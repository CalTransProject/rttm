import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple
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
    
    # VLP-32C specific corrections
    rot_correction: float = 0.0  # radians
    vert_correction: float = 0.0  # radians
    dist_correction: float = 0.0  # meters
    dist_correction_x: float = 0.0
    dist_correction_y: float = 0.0
    focal_distance: float = 0.0
    focal_slope: float = 0.0
    
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
    """Decoder for VLP-32C packets with VeloView-like processing."""
    def __init__(self, config: Config):
        self.config = config
        self.vertical_angles_rad = np.radians(self.config.vertical_angles)
        self.cos_rot_correction = np.cos(self.config.rot_correction)
        self.sin_rot_correction = np.sin(self.config.rot_correction)
        
    def correct_distance(self, distance: float, laser_idx: int) -> float:
        """Apply VLP-32C distance corrections."""
        # Apply focal distance and slope corrections
        focal_offset = 256 * (1 - self.config.focal_distance / 13100)
        focal_slope = self.config.focal_slope
        
        if distance <= self.config.focal_distance:
            focal_correction = focal_offset * np.square(1 - distance/self.config.focal_distance)
        else:
            focal_correction = focal_slope * (distance - self.config.focal_distance)
            
        return distance + self.config.dist_correction + focal_correction
        
    def decode_packet(self, packet: bytes) -> Tuple[List[float], List[float]]:
        """Decode a VLP-32C packet into points and intensities."""
        if len(packet) != self.config.packet_size:
            return [], []
            
        points = []
        intensities = []
        
        for block_idx in range(self.config.num_data_blocks):
            block_offset = block_idx * self.config.data_block_size
            block = packet[block_offset:block_offset + self.config.data_block_size]
            
            if len(block) != self.config.data_block_size:
                continue
                
            try:
                # Get azimuth for this firing (2 bytes)
                azimuth = struct.unpack_from('<H', block, 2)[0] * 0.01 * np.pi / 180.0
                
                # Process each firing in the block
                for firing_idx in range(32):
                    distance_offset = 4 + firing_idx * 3
                    distance = struct.unpack_from('<H', block, distance_offset)[0] * self.config.distance_resolution
                    intensity = block[distance_offset + 2]
                    
                    if distance < 0.001:  # Only filter out extremely close/invalid measurements
                        continue
                        
                    # Apply distance corrections
                    distance = self.correct_distance(distance, firing_idx)
                    
                    # Get vertical angle with correction
                    vert_angle = self.vertical_angles_rad[firing_idx] + self.config.vert_correction
                    
                    # Convert to cartesian coordinates with corrections
                    cos_vert = np.cos(vert_angle)
                    sin_vert = np.sin(vert_angle)
                    cos_azim = np.cos(azimuth) * self.cos_rot_correction - np.sin(azimuth) * self.sin_rot_correction
                    sin_azim = np.sin(azimuth) * self.cos_rot_correction + np.cos(azimuth) * self.sin_rot_correction
                    
                    # Apply distance corrections in x/y plane
                    xy_distance = distance * cos_vert
                    x = xy_distance * sin_azim + self.config.dist_correction_x
                    y = xy_distance * cos_azim + self.config.dist_correction_y
                    z = distance * sin_vert
                    
                    points.extend([float(x), float(y), float(z)])
                    intensities.append(float(intensity))
                    
            except (struct.error, IndexError) as e:
                logger.error(f"Failed to process block {block_idx}: {e}")
                continue
                
        return points, intensities
        
    @staticmethod
    def get_block_timestamp(block: bytes) -> float:
        """Extract timestamp from a data block."""
        return struct.unpack_from('<I', block, 0)[0] * 1e-6  # Convert to seconds
