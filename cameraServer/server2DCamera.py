from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import cv2
from datetime import datetime
from ultralytics import YOLO
import math
import json
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

camera = cv2.VideoCapture(0)
PATH_TO_MODEL = "../model/2dModel.pt"
model = YOLO(PATH_TO_MODEL)
classNames = ['car', 'pickup', 'SUV', 'van', 'truck', 'bus', 'motorcycle', 'pedestrian']

# Define light pink color (in BGR format)
LIGHT_PINK = (203, 192, 255)  # This is approximately light pink in BGR

def process_frame():
    while True:
        success, frame = camera.read()
        if not success:
            print("Failed to grab frame")
            socketio.sleep(0.1)
            continue
        
        results = model(frame, stream=True)
        
        class_counts = {cls_name: 0 for cls_name in classNames}
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), LIGHT_PINK, 2)  # Light pink rectangle
                
                confidence = math.ceil((box.conf[0] * 100)) / 100
                cls = int(box.cls[0])
                class_name = classNames[cls]
                class_counts[class_name] += 1
                
                cv2.putText(frame, f"{class_name} {confidence:.2f}", (x1, y1), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        data = {
            'timestamp': current_time,
            'counts': class_counts
        }
        
        print("Sending data:", json.dumps(data))  # Logging
        socketio.emit('update', json.dumps(data))
        socketio.emit('frame', frame_bytes)
        
        socketio.sleep(0.1)  # Adjust this value to control the update frequency

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@app.route('/')
def index():
    return "Vehicle Detection Server"

def start_processing():
    socketio.start_background_task(process_frame)

if __name__ == '__main__':
    threading.Thread(target=start_processing).start()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)