from __future__ import annotations
import socket
import struct
import numpy as np
from typing import List, Tuple, Final
import logging
import time

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# VLP-32C Constants
PACKET_SIZE: Final[int] = 1206  # Updated from 1248 to match actual packet size
DATA_BLOCK_SIZE: Final[int] = 100
NUM_CHANNELS: Final[int] = 32
DISTANCE_RESOLUTION: Final[float] = 0.004  # 4mm
AZIMUTH_RESOLUTION: Final[float] = 2 * np.pi / 36000.0
VERTICAL_ANGLES: Final[np.ndarray] = np.array([-30.67 + i * 1.33 for i in range(32)])
NUM_DATA_BLOCKS: Final[int] = 12

class LidarProcessor:
    def __init__(self, host: str = '192.168.1.201', port: int = 2368) -> None:
        """Initialize LiDAR processor with specified host and port."""
        self.host = host
        self.port = port
        self.socket: socket.socket | None = None
        self.connected: bool = False
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
                    self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)  # Add REUSEPORT
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
        """
        Process a single LiDAR packet and return point cloud data.
        
        Args:
            data: Raw packet data from the LiDAR
            
        Returns:
            List of [x, y, z] coordinates as floats
        """
        points: List[float] = []
        
        try:
            if len(data) != PACKET_SIZE:
                logger.warning(f"Unexpected packet size: {len(data)} bytes")
                return points

            # Process multiple packets to accumulate more points
            for block_idx in range(NUM_DATA_BLOCKS):
                offset = block_idx * DATA_BLOCK_SIZE
                block = data[offset:offset + DATA_BLOCK_SIZE]
                
                if len(block) < DATA_BLOCK_SIZE:
                    logger.warning(f"Incomplete data block at index {block_idx}")
                    continue
                
                try:
                    azimuth = struct.unpack_from('<H', block, 2)[0] * AZIMUTH_RESOLUTION
                    
                    for channel in range(NUM_CHANNELS):
                        try:
                            distance = struct.unpack_from('<H', block, 4 + channel * 3)[0] * DISTANCE_RESOLUTION
                            
                            # Adjust filtering thresholds for more points
                            if distance == 0 or distance > 250:  # Increased range to 250m
                                continue
                                
                            omega = np.radians(VERTICAL_ANGLES[channel])
                            
                            # Calculate coordinates
                            x = distance * np.cos(omega) * np.sin(azimuth)
                            y = distance * np.cos(omega) * np.cos(azimuth)
                            z = distance * np.sin(omega)
                            
                            # Relaxed point filtering thresholds
                            if abs(x) < 150 and abs(y) < 150 and abs(z) < 150:  # Increased to 150m
                                points.extend([float(x), float(y), float(z)])
                                
                        except struct.error as e:
                            logger.warning(f"Error unpacking channel {channel} data: {e}")
                            continue
                            
                except struct.error as e:
                    logger.warning(f"Error unpacking azimuth at block {block_idx}: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error processing packet: {e}")
            return []

        return points

    def get_frame(self) -> Tuple[List[float], bool]:
        """
        Get a single frame of point cloud data.
        
        Returns:
            Tuple of (points_list, success_flag)
        """
        if not self.connected or not self.socket:
            try:
                self._setup_socket()
            except socket.error:
                return [], False

        try:
            # Accumulate points from multiple packets
            all_points = []
            packets_received = 0
            for _ in range(5):  # Try to get 5 packets
                try:
                    data, addr = self.socket.recvfrom(PACKET_SIZE)
                    logger.info(f"Received packet from {addr[0]}, size: {len(data)} bytes")
                    
                    # Don't filter by host address since some LiDAR units might use different IPs
                    points = self.process_packet(data)
                    if points:
                        packets_received += 1
                        all_points.extend(points)
                        logger.info(f"Processed packet {packets_received} with {len(points)//3} points")
                    else:
                        logger.warning(f"Packet processing yielded no points, size: {len(data)}")
                except socket.timeout:
                    logger.warning("Timeout while receiving packet")
                    continue

            if packets_received > 0:
                logger.info(f"Frame complete: {packets_received} packets, {len(all_points)//3} total points")
                return all_points, True
            else:
                logger.warning("No valid packets received in frame")
                return [], False
            
        except socket.timeout:
            logger.warning("Socket timeout while receiving data")
            return [], False
        except socket.error as e:
            logger.error(f"Socket error: {e}")
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