from __future__ import annotations
import asyncio
import websockets
import json
from lidar_processor import LidarProcessor
import logging
from typing import Set
import signal
import sys
import os
import time
from websockets.server import WebSocketServerProtocol
from typing import Final

# Setup logging with more detailed formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_HOST: Final[str] = "localhost"
DEFAULT_PORT: Final[int] = 8765
DEFAULT_LIDAR_IP: Final[str] = '192.168.1.201'
DEFAULT_LIDAR_PORT: Final[int] = 2368
RATE_LIMIT: Final[float] = 0.1  # 100ms between frames
PACKET_SIZE: Final[int] = 1206  # Updated to match LidarProcessor
MIN_POINTS: Final[int] = 60  # Reduced minimum point threshold

# Handle SIGTSTP (Ctrl+Z)
def handle_suspend(signum, frame):
    logger.info("Received suspend signal, cleaning up...")
    if 'server' in globals():
        # Force close the socket immediately
        if server.lidar_processor and server.lidar_processor.socket:
            server.lidar_processor.socket.close()
        # Exit immediately
        os._exit(0)  # Use os._exit() instead of sys.exit() for immediate termination

signal.signal(signal.SIGTSTP, handle_suspend)

class LidarServer:
    def __init__(
        self, 
        host: str = DEFAULT_HOST,
        port: int = DEFAULT_PORT,
        lidar_ip: str = DEFAULT_LIDAR_IP, 
        lidar_port: int = DEFAULT_LIDAR_PORT
    ) -> None:
        self.host = host
        self.port = port
        self.lidar_ip = lidar_ip
        self.lidar_port = lidar_port
        self.lidar_processor: LidarProcessor | None = None
        self.active_connections: Set[WebSocketServerProtocol] = set()
        self.running: bool = False
        self._setup_complete: bool = False
        self._consecutive_low_points: int = 0
        self._max_consecutive_low_points: int = 5

    async def setup(self) -> None:
        """Initialize LiDAR processor and setup server."""
        if self._setup_complete:
            return

        try:
            self.lidar_processor = LidarProcessor(
                host=self.lidar_ip,
                port=self.lidar_port
            )
            self._setup_complete = True
            logger.info("LiDAR processor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize LiDAR processor: {e}")
            raise

    async def handle_client(self, websocket: WebSocketServerProtocol, path: str) -> None:
        """Handle individual client connections."""
        client_id = id(websocket)
        logger.info(f"New client connected. ID: {client_id}")
        
        self.active_connections.add(websocket)
        
        try:
            while self.running and self.lidar_processor is not None:
                points, success = self.lidar_processor.get_frame()
                
                if not success:
                    logger.warning("Failed to get LiDAR frame")
                    await asyncio.sleep(RATE_LIMIT)
                    continue

                num_points = len(points) // 3
                if num_points < MIN_POINTS:
                    self._consecutive_low_points += 1
                    if self._consecutive_low_points >= self._max_consecutive_low_points:
                        logger.warning(f"Consistently low point count: {num_points} points")
                        await asyncio.sleep(RATE_LIMIT)
                        continue
                else:
                    self._consecutive_low_points = 0

                if points:
                    message = {
                        "type": "lidar_data",
                        "data": points,
                        "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        "frame_count": num_points
                    }
                    
                    try:
                        await websocket.send(json.dumps(message))
                    except websockets.exceptions.ConnectionClosed:
                        break
                    except Exception as e:
                        logger.error(f"Error sending data to client {client_id}: {e}")
                        break

                await asyncio.sleep(RATE_LIMIT)

        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client {client_id} disconnected normally")
        except Exception as e:
            logger.error(f"Error handling client {client_id}: {e}")
        finally:
            self.active_connections.remove(websocket)
            logger.info(f"Client {client_id} connection cleaned up. Active connections: {len(self.active_connections)}")

    async def shutdown(self) -> None:
        """Gracefully shutdown the server."""
        if not self.running:
            return

        logger.info("Shutting down server...")
        self.running = False
        
        # Close all active connections
        if self.active_connections:
            await asyncio.gather(
                *(ws.close() for ws in self.active_connections),
                return_exceptions=True
            )
        
        # Cleanup LiDAR processor
        if self.lidar_processor is not None:
            self.lidar_processor.close()
            self.lidar_processor = None
            
        self._setup_complete = False
        logger.info("Server shutdown complete")

    async def restart(self) -> None:
        """Restart the server by performing a clean shutdown and setup."""
        await self.shutdown()
        await self.setup()
        await self.run()

    async def run(self) -> None:
        """Run the WebSocket server."""
        if not self._setup_complete:
            await self.setup()

        # Check if port is already in use
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind((self.host, self.port))
            sock.close()
        except OSError as e:
            if e.errno == 48 or e.errno == 98:  # Address already in use
                logger.error(f"Port {self.port} is already in use. Please ensure no other instance is running.")
                await self.shutdown()
                return
            raise

        self.running = True
        
        # Setup signal handlers for graceful shutdown
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(
                sig,
                lambda: asyncio.create_task(self.shutdown())
            )
        
        try:
            async with websockets.serve(
                self.handle_client,
                self.host,
                self.port,
                ping_interval=20,  # Send ping every 20 seconds
                ping_timeout=30    # Wait 30 seconds for pong response
            ):
                logger.info(f"LiDAR WebSocket server running on ws://{self.host}:{self.port}")
                await asyncio.Future()  # run forever
        except Exception as e:
            logger.error(f"Server error: {e}")
            await self.shutdown()

async def main() -> None:
    global server
    server = LidarServer()
    try:
        await server.run()
    except Exception as e:
        logger.error(f"Server error: {e}")
        await server.shutdown()

if __name__ == "__main__":
    while True:
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            logger.info("Server stopped. Press Ctrl+C again to exit completely, or wait to restart...")
            try:
                # Wait for 2 seconds to either restart or exit
                asyncio.run(asyncio.sleep(2))
            except KeyboardInterrupt:
                logger.info("Exiting...")
                sys.exit(0)
            logger.info("Restarting server...")
        except Exception as e:
            logger.error(f"Server error: {e}")
            sys.exit(1)