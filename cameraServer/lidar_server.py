import asyncio
import websockets
import json
import logging
import socket
import time
import os
import signal
from contextlib import asynccontextmanager
from lidar_processor import LidarProcessor

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return False
        except socket.error:
            return True

async def cleanup_port(port):
    try:
        # Kill processes using both IPv4 and IPv6
        cmds = [
            f"lsof -ti4:{port}",  # IPv4
            f"lsof -ti6:{port}"   # IPv6
        ]
        for cmd in cmds:
            pids = os.popen(cmd).read().strip().split('\n')
            for pid in pids:
                try:
                    if pid:
                        pid = int(pid)
                        logger.info(f"Killing process {pid} using port {port}")
                        os.kill(pid, signal.SIGKILL)  # Use SIGKILL instead of SIGTERM
                        await asyncio.sleep(1)  # Give more time for cleanup
                except ValueError:
                    continue
                except ProcessLookupError:
                    continue
                except Exception as e:
                    logger.warning(f"Error killing process {pid}: {e}")
        
        # Additional sleep to ensure port is fully released
        await asyncio.sleep(2)
    except Exception as e:
        logger.warning(f"Port cleanup failed: {e}")

class LidarServer:
    def __init__(self, host="localhost", port=8765, max_retries=3):
        self.host = host
        self.port = port
        self.max_retries = max_retries
        self.clients = set()
        self.processor = LidarProcessor()
        self.running = True
        self.server = None
        self._shutdown_event = asyncio.Event()
        
    async def cleanup(self):
        """Cleanup resources on shutdown"""
        logger.info("Starting cleanup...")
        self.running = False
        
        # Stop accepting new connections
        if self.server:
            self.server.close()
            await self.server.wait_closed()
        
        # Close all client connections gracefully
        if self.clients:
            close_tasks = [client.close() for client in self.clients]
            await asyncio.gather(*close_tasks, return_exceptions=True)
            self.clients.clear()
        
        # Cleanup LiDAR processor
        if hasattr(self.processor, 'cleanup'):
            await self.processor.cleanup()
        
        logger.info("Cleanup complete")

    async def handle_client(self, websocket, path):
        """Handle individual client connections"""
        client_id = id(websocket)
        try:
            self.clients.add(websocket)
            logger.info(f"New client {client_id} connected from {websocket.remote_address}")
            
            while self.running:
                try:
                    if self._shutdown_event.is_set():
                        break
                        
                    frame_data, success = self.processor.get_frame()
                    if success and frame_data:
                        # Send points, intensities, and timestamp
                        await websocket.send(json.dumps({
                            "points": frame_data["points"],
                            "intensities": frame_data["intensities"],
                            "timestamp": frame_data["timestamp"]
                        }))
                        await asyncio.sleep(0.01)  # Rate limiting
                    else:
                        await asyncio.sleep(0.1)  # Longer delay on failure
                        
                except websockets.exceptions.ConnectionClosed:
                    logger.info(f"Client {client_id} connection closed")
                    break
                except Exception as e:
                    logger.error(f"Error handling client {client_id}: {e}")
                    await asyncio.sleep(1)  # Delay before retry
                    
        finally:
            self.clients.remove(websocket)
            logger.info(f"Client {client_id} removed. Total clients: {len(self.clients)}")

    @asynccontextmanager
    async def server_context(self):
        """Context manager for server lifecycle"""
        try:
            if is_port_in_use(self.port):
                logger.info(f"Port {self.port} is in use, cleaning up...")
                await cleanup_port(self.port)
                await asyncio.sleep(1)
            
            self.server = await websockets.serve(
                self.handle_client,
                self.host,
                self.port,
                ping_interval=20,
                ping_timeout=60,
                close_timeout=10,
                max_size=2**23,  # 8MB max message size
                max_queue=32,
                reuse_address=True
            )
            
            yield self.server
            
        finally:
            await self.cleanup()

    async def start(self):
        """Start the LiDAR server with retry logic"""
        retries = 0
        while retries < self.max_retries and not self._shutdown_event.is_set():
            try:
                logger.info(f"Starting LiDAR server on ws://{self.host}:{self.port}")
                async with self.server_context() as server:
                    await self._shutdown_event.wait()
                break
                
            except Exception as e:
                retries += 1
                logger.error(f"Server error (attempt {retries}/{self.max_retries}): {e}")
                if retries < self.max_retries:
                    await asyncio.sleep(2 ** retries)  # Exponential backoff
                else:
                    logger.error("Max retries reached, shutting down")
                    break

    def signal_handler(self, signum, frame):
        """Handle system signals for graceful shutdown"""
        logger.info(f"Received signal {signum}, initiating shutdown...")
        asyncio.create_task(self.cleanup())
        self._shutdown_event.set()

if __name__ == "__main__":
    server = LidarServer()
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, server.signal_handler)
    signal.signal(signal.SIGTERM, server.signal_handler)
    
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        logger.info("Server shutdown complete")