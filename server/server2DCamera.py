from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from datetime import datetime
from ultralytics import YOLO
import math
import json

app = Flask(__name__)
CORS(app)

camera = cv2.VideoCapture(0)
PATH_TO_MODEL = "../model/2dModel.pt"
model = YOLO(PATH_TO_MODEL)

classNames = ['car', 'pickup', 'SUV', 'van', 'truck', 'bus', 'motorcycle', 'pedestrian']
class_counts = {cls_name: 0 for cls_name in classNames}

def gen_frames_and_data():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Convert the frame from BGR to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            results = model(frame, stream=True)
            
            # Reset counts for each frame
            class_counts = {cls_name: 0 for cls_name in classNames}
            
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (200, 150, 255), 2)
                    
                    confidence = math.ceil((box.conf[0] * 100)) / 100
                    cls = int(box.cls[0])
                    class_name = classNames[cls]
                    class_counts[class_name] += 1
                    
                    cv2.putText(frame, f"{class_name} {confidence}", (x1, y1), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            
            # Prepare data to send along with the frame
            data = {
                'timestamp': current_time,
                'counts': class_counts
            }
            
            print("Sending data:", json.dumps(data))  # Add this line for logging
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n'
                   b'Content-Type: application/json\r\n\r\n' + json.dumps(data).encode() + b'\r\n')

@app.route('/webcam')
def video_feed():
    return Response(gen_frames_and_data(), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)