#Thanks to https://dipankarmedh1.medium.com/real-time-object-detection-with-yolo-and-webcam-enhancing-your-computer-vision-skills-861b97c78993
import cv2
from ultralytics import YOLO
import math 


camera = cv2.VideoCapture(0)

PATH_TO_MODEL = "/Users/Robin1/Desktop/rttm/model/2dModel.pt"
#model = YOLO('yolov8s.pt')  # load an official model
model = YOLO(PATH_TO_MODEL )
# object classes
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

def gen_frames():  

    while True:
        success, frame = camera.read()  # read the camera frame
        results = model(frame, stream=True)#
        # coordinates
        for r in results:
            boxes = r.boxes

            for box in boxes:
                # bounding box
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2) # convert to int values

                # put box in cam
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 3)

                # confidence
                confidence = math.ceil((box.conf[0]*100))/100
                print("Confidence --->",confidence)

                # class name
                cls = int(box.cls[0])
                print("Class name -->", classNames[cls])

                # object details
                org = [x1, y1]
                font = cv2.FONT_HERSHEY_SIMPLEX
                fontScale = 1
                color = (255, 0, 0)
                thickness = 2
                cv2.putText(frame, classNames[cls], org, font, fontScale, color, thickness)
        
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result
