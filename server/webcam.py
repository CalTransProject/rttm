import time
import cv2
from datetime import datetime
from ultralytics import YOLO
import math
import os


# Object classes
classNames = [
    'car',
    'pickup',
    'SUV',
    'van',
    'truck',
    'bus',
    'motorcycle',
    'pedestrian'
]

# Dictionary to store class counts
class_counts = {cls_name: 0 for cls_name in classNames}

#method used to process  each frame of an generate a prediction
def process_frame(frame):
    PATH_TO_MODEL = "../model/2dModel.pt"
    model = YOLO(PATH_TO_MODEL)
    results = model(frame, stream=True)
    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            confidence = math.ceil((box.conf[0] * 100)) / 100
            cls = int(box.cls[0])
            class_counts[classNames[cls]] += 1
            org = [x1, y1]
            font = cv2.FONT_HERSHEY_SIMPLEX
            fontScale = 1
            color = (0, 0, 0)
            thickness = 2
            cv2.putText(frame, classNames[cls] + "  " + str(confidence), org, font, fontScale, color, thickness)
    return frame

#Method used to return the video frames with the plots from either a webcam source or a video 
def gen_frames(video_source='webcam'):
    if video_source == 'webcam':
        camera = cv2.VideoCapture(0)
        while True:
            success, frame = camera.read()
            if not success:
                break
            frame = process_frame(frame)
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        camera.release()
        cv2.destroyAllWindows()
    if video_source == 'video':
        folder_path = os.getcwd()
        mp4_files = 'output.mp4'

        video = cv2.VideoCapture(mp4_files) #Load video from current folder 
        while True:
            success, frame = video.read()
            if not success:
                break
            ret, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame.tobytes() + b'\r\n') # return frames from the vide so that they can be displayed on a html page
        time.sleep(0.1)
"/Users/Robin1/Desktop/LIDAR Project/rttm/server/output.mp4"