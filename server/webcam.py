import cv2
from datetime import datetime
from ultralytics import YOLO
import math


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


def process_frame(frame, model):
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

def gen_frames(video_source=0):
    PATH_TO_MODEL = "../model/2dModel.pt"
    model = YOLO(PATH_TO_MODEL)
    camera = cv2.VideoCapture(video_source)
    while True:
        success, frame = camera.read()
        if not success:
            break
        frame = process_frame(frame, model)
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    camera.release()
    cv2.destroyAllWindows()
