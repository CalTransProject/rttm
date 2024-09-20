# lidar_processor.py

import socket
import struct
import numpy as np

class LidarProcessor:
    def __init__(self, host='192.168.1.201', port=2368):  # Default VLP-32C settings
        self.host = host
        self.port = port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.bind(('', port))

    def process_packet(self, data):
        # VLP-32C specific packet processing
        # This is a simplified version and may need adjustment based on exact data format
        points = []
        for offset in range(0, len(data), 100):  # VLP-32C has 12 data blocks per packet
            block = data[offset:offset+100]
            azimuth = struct.unpack_from('<H', block, 2)[0] * 2 * np.pi / 36000.0
            for channel in range(32):
                distance = struct.unpack_from('<H', block, 4 + channel * 3)[0] * 0.004
                if distance == 0:
                    continue
                omega = np.radians(-30.67 + channel * 1.33)  # VLP-32C vertical angles
                x = distance * np.cos(omega) * np.sin(azimuth)
                y = distance * np.cos(omega) * np.cos(azimuth)
                z = distance * np.sin(omega)
                points.extend([x, y, z])
        return points

    def get_frame(self):
        data, addr = self.socket.recvfrom(1248)  # VLP-32C packet size
        return self.process_packet(data)

if __name__ == "__main__":
    processor = LidarProcessor()
    while True:
        points = processor.get_frame()
        print(f"Received {len(points)//3} points")
        # Here you would send these points to your main server for streaming