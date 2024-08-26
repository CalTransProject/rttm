import logging
from ultralytics import YOLO
import cv2
import os
import numpy as np
from datetime import datetime
import math

# Object classes
classNames = [
    'car', 'pickup', 'SUV', 'van', 'truck', 'bus', 'motorcycle', 'pedestrian'
]

def process_video(source, progress_callback=None):
    logging.info(f"Processing video from source: {source}")
    try:
        model_path = os.path.abspath('../model/2dModel.pt')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"YOLO model not found at {model_path}")
        
        model = YOLO(model_path)
        logging.info("YOLO model loaded successfully")

        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            raise IOError("Error opening video file")

        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logging.info(f"Video properties: {frame_width}x{frame_height}, {fps} fps, {total_frames} frames")

        output_path = os.path.join('processed_videos', 'output.mp4')
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        fourcc = cv2.VideoWriter_fourcc(*'avc1')  # Use H.264 codec
        out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

        if not out.isOpened():
            raise IOError("Error opening output video file")

        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame, stream=True)

            for r in results:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (200, 150, 255), 2)
                    confidence = math.ceil((box.conf[0] * 100)) / 100
                    cls = int(box.cls[0])
                    org = [x1, y1]
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    fontScale = 1
                    color = (255, 255, 255)
                    thickness = 2
                    cv2.putText(frame, f"{classNames[cls]} {confidence}", org, font, fontScale, color, thickness)

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)

            out.write(frame)

            frame_count += 1
            if progress_callback and total_frames > 0:
                progress = int((frame_count / total_frames) * 100)
                progress_callback(progress)

            if frame_count % 100 == 0:
                logging.info(f"Processed {frame_count}/{total_frames} frames")

        cap.release()
        out.release()

        if frame_count == 0:
            raise ValueError("No frames were processed")

        logging.info(f"Completed processing {frame_count} frames")
        return output_path
    except Exception as e:
        logging.error(f"Error in process_video: {str(e)}")
        logging.exception("Stack trace:")
        raise