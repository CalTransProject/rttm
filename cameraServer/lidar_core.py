import numpy as np
from dataclasses import dataclass
from typing import List, Optional
import struct
import logging

logger = logging.getLogger(__name__)

@dataclass
class Config:
    """Configuration for VLP-32C LiDAR."""
    num_lasers: int = 32
    firing_cycle: int = 55.296  # μs
    packet_size: int = 1206
    data_block_size: int = 100
    num_data_blocks: int = 12
    distance_resolution: float = 0.004  # 4mm
    
    # VLP-32C vertical angles (degrees)
    vertical_angles: List[float] = None
    
    def __post_init__(self):
        if self.vertical_angles is None:
            # VLP-32C has 32 lasers with non-uniform spacing
            self.vertical_angles = [
                -25.0, -15.639, -11.31, -8.843, -7.254, -6.148, -5.333, -4.667,
                -4.0, -3.667, -3.333, -3.0, -2.667, -2.333, -2.0, -1.667,
                -1.333, -1.0, -0.667, -0.333, 0.0, 0.333, 0.667, 1.0,
                1.333, 1.667, 2.0, 2.333, 2.667, 3.0, 3.333, 3.667
            ]
            
class PacketDecoder:
    """Decoder for VLP-32C packets."""
    def __init__(self, config: Config):
        self.config = config
        self.vertical_angles_rad = np.radians(self.config.vertical_angles)
        
    def decode_packet(self, packet: bytes) -> List[float]:
        """Decode a single VLP-32C packet into a list of [x, y, z] coordinates."""
        if len(packet) != self.config.packet_size:
            logger.warning(f"Invalid packet size: got {len(packet)}, expected {self.config.packet_size}")
            return []
            
        points = []
        
        for block_idx in range(self.config.num_data_blocks):
            block_offset = block_idx * self.config.data_block_size
            
            # Extract block data
            block = packet[block_offset:block_offset + self.config.data_block_size]
            if len(block) != self.config.data_block_size:
                logger.warning(f"Invalid block size at idx {block_idx}: got {len(block)}, expected {self.config.data_block_size}")
                continue
            
            # Get azimuth for this firing (2 bytes)
            try:
                azimuth = struct.unpack_from('<H', block, 2)[0] * 0.01 * np.pi / 180.0
            except struct.error as e:
                logger.error(f"Failed to unpack azimuth at block {block_idx}: {e}")
                continue
            
            # Process each firing in the block
            for firing_idx in range(32):
                # Extract distance and intensity
                try:
                    distance_offset = 4 + firing_idx * 3
                    distance = struct.unpack_from('<H', block, distance_offset)[0] * self.config.distance_resolution
                    intensity = block[distance_offset + 2]
                    
                    if distance == 0:  # Invalid measurement
                        continue
                    
                    # Get vertical angle for this laser
                    vertical_angle = self.vertical_angles_rad[firing_idx]
                    
                    # Convert spherical coordinates to cartesian
                    cos_vert = np.cos(vertical_angle)
                    sin_vert = np.sin(vertical_angle)
                    cos_azim = np.cos(azimuth)
                    sin_azim = np.sin(azimuth)
                    
                    x = distance * cos_vert * sin_azim
                    y = distance * cos_vert * cos_azim
                    z = distance * sin_vert
                    
                    points.extend([float(x), float(y), float(z)])
                    
                except (struct.error, IndexError) as e:
                    logger.error(f"Failed to process firing {firing_idx} in block {block_idx}: {e}")
                    continue
                    
        return points
        
    @staticmethod
    def get_block_timestamp(block: bytes) -> float:
        """Extract timestamp from a data block."""
        return struct.unpack_from('<I', block, 0)[0] * 1e-6  # Convert to seconds
        return points, intensities
        
    @staticmethod
    def get_block_timestamp(block: bytes) -> float:
        """Extract timestamp from a data block."""
        return struct.unpack_from('<I', block, 0)[0] * 1e-6  # Convert to seconds
