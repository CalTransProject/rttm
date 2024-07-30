import time
import cv2
from datetime import datetime
from ultralytics import YOLO, solutions
import math
import numpy as np

def encode_frame(frame):
    """Encode the frame for web streaming."""
    ret, buffer = cv2.imencode('.jpg', frame)
    return buffer.tobytes()

def gen_frames(video_source='webcam'):
    """Generate frames from the video source, adding annotations and timestamps."""
    # Initialize the model and class names once
    PATH_TO_MODEL = "../model/2dModel.pt"
    model = YOLO(PATH_TO_MODEL)
    class_names = list(model.model.names.values())  # List of class names from model

    if video_source == 'webcam':
        # Using video file for testing purposes
        #camera = cv2.VideoCapture("/Users/Robin1/Desktop/LIDAR Project/data/Dataset 1/Zelzah and Plummer 1 2023-03-20 11-48-13.mkv")
        
        #Using Webcam
        camera = cv2.VideoCapture(0)
        assert camera.isOpened(), "Error reading video file"
        
        # Define region points
        line_points = [(30, 400), (27, 1300)]  # line or region points for in and out of region count
        
        classes_to_count = list(range(len(class_names)))  # Classes for count
        
        counter = solutions.ObjectCounter(
            view_img=True,
            reg_pts=line_points,
            names=model.names,
            draw_tracks=False,
            line_thickness=1,
        )
        
        while True:
            success, frame = camera.read()
            if not success:
                print("Video frame is empty or video processing has been successfully completed.")
                break
            tracks = model.track(frame, persist=True, show=False, classes=classes_to_count, conf =0.7)
            frame = tracks[0].plot()
            frame = counter.start_counting(frame, tracks)
            print("In and Out count: ",counter.class_wise_count)
            
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cv2.putText(frame, current_time, (frame.shape[1] - 350, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 1, cv2.LINE_AA)
            
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + encode_frame(frame) + b'\r\n')

        camera.release()
        cv2.destroyAllWindows()

    elif video_source == 'video':
        video_path = 'output.mp4'
        video = cv2.VideoCapture(video_path)
        while True:
            success, frame = video.read()
            if not success:
                break
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + encode_frame(frame) + b'\r\n')
        time.sleep(0.1)
