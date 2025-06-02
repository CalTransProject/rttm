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
import subprocess

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def cleanup_port(port: int) -> None:
    """Clean up any processes using the specified port."""
    try:
        # Get list of processes using the port
        result = subprocess.run(['lsof', '-i', f':{port}'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            # Parse output to get PIDs
            for line in result.stdout.splitlines()[1:]:  # Skip header
                try:
                    pid = int(line.split()[1])
                    logger.info(f"Killing process {pid} using port {port}")
                    subprocess.run(['kill', '-9', str(pid)], 
                                 capture_output=True, check=False)
                except (IndexError, ValueError) as e:
                    logger.warning(f"Failed to parse process info: {e}")
        
        # Wait for ports to be fully released
        time.sleep(2)
        
    except subprocess.CalledProcessError as e:
        logger.warning(f"Failed to check port usage: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during port cleanup: {e}")

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
                    # Check if we should shutdown
                    if self._shutdown_event.is_set():
                        break
                        
                    points, success = self.processor.get_frame()
                    if success and points:
                        await websocket.send(json.dumps({
                            "points": points,
                            "timestamp": time.time()
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
                cleanup_port(self.port)
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
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Starting LiDAR server on ws://{self.host}:{self.port}")
                
                # Clean up port before binding
                cleanup_port(self.port)
                
                # Create server with reuse_address
                self.server = await websockets.serve(
                    self.handle_client,
                    self.host,
                    self.port,
                    reuse_address=True
                )
                
                await self.server.wait_closed()
                return
                
            except OSError as e:
                if "address already in use" in str(e).lower():
                    logger.error(f"Server error (attempt {attempt + 1}/{max_retries}): {e}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                else:
                    logger.error(f"Failed to start server: {e}")
                    break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                break
        
        logger.error("Max retries reached, shutting down")
        await self.cleanup()

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