import time
import cv2
from datetime import datetime
from ultralytics import YOLO, solutions
import math

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
        camera = cv2.VideoCapture(0)
        assert camera.isOpened(), "Error reading video file"
        # Define region points
        region_points = [(20, 400), (1080, 404), (1080, 360), (20, 360)]
        classes_to_count = list(range(len(class_names)))  # Classes for count

        counter = solutions.ObjectCounter(
            view_img=True,
            reg_pts=region_points,
            names=model.names,
            draw_tracks=True,
            line_thickness=2,
        )
        while True:
            success, frame = camera.read()
            if not success:
                print("Video frame is empty or video processing has been successfully completed.")
                break
            tracks = model.track(frame, persist=True, show=False, classes=classes_to_count)
            frame = counter.start_counting(frame, tracks)
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, current_time, (frame.shape[1] - 350, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)

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
