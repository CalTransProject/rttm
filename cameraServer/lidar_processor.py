from __future__ import annotations
import socket
import struct
import numpy as np
from typing import List, Tuple, Final
import logging

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
                self.socket.close()
            
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.socket.bind(('', self.port))
            self.socket.settimeout(1.0)  # 1 second timeout
            self.connected = True
            logger.info(f"Successfully connected to LiDAR at {self.host}:{self.port}")
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
            for _ in range(3):  # Process 3 packets per frame
                data, addr = self.socket.recvfrom(PACKET_SIZE)
                points = self.process_packet(data)
                all_points.extend(points)
            return all_points, True
            
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