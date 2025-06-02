from __future__ import annotations
import socket
import struct
import numpy as np
from typing import List, Tuple, Final
import logging
import time
from lidar_core import PacketDecoder, Config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class LidarProcessor:
    def __init__(self, host: str = '192.168.1.201', port: int = 2368) -> None:
        """Initialize LiDAR processor with specified host and port."""
        self.host = host
        self.port = port
        self.socket: socket.socket | None = None
        self.connected: bool = False
        self.config = Config()
        self.decoder = PacketDecoder(self.config)
        self._setup_socket()

    def _setup_socket(self) -> None:
        """Set up UDP socket with error handling."""
        try:
            if self.socket:
                try:
                    self.socket.shutdown(socket.SHUT_RDWR)
                except:
                    pass
                try:
                    self.socket.close()
                except:
                    pass
                self.socket = None
            
            # Wait for port to be available
            max_retries = 5
            retry_delay = 0.5
            for attempt in range(max_retries):
                try:
                    self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                    self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
                    self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 4096 * 1024)
                    self.socket.bind(('', self.port))
                    self.socket.settimeout(0.1)
                    break
                except socket.error as e:
                    if attempt < max_retries - 1:
                        logger.warning(f"Port {self.port} busy, retrying in {retry_delay}s...")
                        time.sleep(retry_delay)
                        continue
                    raise

            self.connected = True
            logger.info(f"Socket setup complete. Buffer size: {self.socket.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)}")
            logger.info(f"Listening for LiDAR data on port {self.port}")
        except socket.error as e:
            self.connected = False
            logger.error(f"Failed to setup socket: {e}")
            raise

    def process_packet(self, data: bytes) -> List[float]:
        """Process a single LiDAR packet using the PacketDecoder."""
        try:
            if len(data) != self.config.packet_size:
                logger.warning(f"Invalid packet size: got {len(data)}, expected {self.config.packet_size}")
                return []

            points = self.decoder.decode_packet(data)
            if points:
                logger.debug(f"Processed packet with {len(points)//3} points")
            return points
        except Exception as e:
            logger.error(f"Error processing packet: {e}")
            return []

    def get_frame(self) -> Tuple[List[float], bool]:
        """
        Get a single frame of point cloud data.
        
        Returns:
            Tuple of (points_list, success_flag)
        """
        if not self.connected or not self.socket:
            try:
                logger.info("Socket not connected, attempting to reconnect...")
                self._setup_socket()
            except socket.error as e:
                logger.error(f"Failed to reconnect: {e}")
                return [], False

        try:
            # Accumulate points from multiple packets
            all_points = []
            packets_received = 0
            start_time = time.time()
            
            while time.time() - start_time < 0.1:  # Collect data for 100ms
                try:
                    data, addr = self.socket.recvfrom(self.config.packet_size)
                    logger.debug(f"Received packet from {addr[0]}, size: {len(data)} bytes")
                    
                    points = self.process_packet(data)
                    if points:
                        packets_received += 1
                        all_points.extend(points)
                        logger.debug(f"Processed packet {packets_received} with {len(points)//3} points")
                except socket.timeout:
                    continue

            if packets_received > 0:
                logger.debug(f"Frame complete: {packets_received} packets, {len(all_points)//3} total points")
                return all_points, True
            else:
                logger.warning("No valid packets received in frame")
                return [], False
            
        except socket.error as e:
            logger.error(f"Socket error while receiving data: {e}")
            self.connected = False
            return [], False
        except Exception as e:
            logger.error(f"Unexpected error in get_frame: {e}")
            return [], False

    def close(self) -> None:
        """Clean up resources."""
        if self.socket:
            try:
                self.socket.close()
            except Exception as e:
                logger.error(f"Error closing socket: {e}")
            finally:
                self.socket = None
                self.connected = False

if __name__ == "__main__":
    processor = LidarProcessor()
    try:
        while True:
            points, success = processor.get_frame()
            if success:
                print(f"Received {len(points)//3} points")
            else:
                print("Failed to get frame, retrying...")
    except KeyboardInterrupt:
        print("\nStopping LiDAR processor...")
    finally:
        processor.close()