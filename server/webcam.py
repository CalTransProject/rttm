import cv2
from datetime import datetime
from ultralytics import YOLO
import math

camera = cv2.VideoCapture(0)

PATH_TO_MODEL = "../model/2dModel.pt"
model = YOLO(PATH_TO_MODEL)

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

def gen_frames():
    while True:
        success, frame = camera.read()  # read the camera frame
        results = model(frame, stream=True)
        # coordinates
        for r in results:
            boxes = r.boxes

            for box in boxes:
                # bounding box
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)  # convert to int values
                
                

                # put box in cam
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                print("(x1, y1) =", (x1, y1), "(x2, y2) =", (x2, y2))

                # confidence
                confidence = math.ceil((box.conf[0] * 100)) / 100

                # class name
                cls = int(box.cls[0])

                # Update class count
                class_counts[classNames[cls]] += 1

                # Object details
                org = [x1, y1]
                font = cv2.FONT_HERSHEY_SIMPLEX
                fontScale = 1
                color = (0, 0, 0)
                thickness = 2
                cv2.putText(frame, classNames[cls] + "  " + str(confidence), org, font, fontScale, color, thickness)

        # Print date and time in the upper right corner
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1,
                    cv2.LINE_AA)

        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)

            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result

