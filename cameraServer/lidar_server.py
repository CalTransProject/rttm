# lidar_server.py

import asyncio
import websockets
import json
from lidar_processor import LidarProcessor

# Assuming you're using the VLP-32C
LIDAR_IP = '192.168.1.201'  # Replace with your LiDAR's IP
LIDAR_PORT = 2368  # Default data port for VLP-32C

lidar_processor = LidarProcessor(host=LIDAR_IP, port=LIDAR_PORT)

async def lidar_data_stream(websocket, path):
    try:
        while True:
            # Get processed point cloud data from the LidarProcessor
            points = lidar_processor.get_frame()
            
            # Send the processed point cloud data
            await websocket.send(json.dumps({
                "type": "lidar_data",
                "data": points  # This is now a list of [x, y, z] coordinates
            }))
            
            # Add a small delay to control the stream rate
            await asyncio.sleep(0.1)  # Adjusted to 0.1s for potentially larger data size
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def main():
    server = await websockets.serve(lidar_data_stream, "localhost", 8765)
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())