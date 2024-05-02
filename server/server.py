import tempfile
from flask import Flask,  Response, request, jsonify
import cv2
from ultralytics import YOLO
from webcam import gen_frames
import os



# Initializing flask app
app = Flask(__name__)


@app.route('/webcam')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/upload-and-predict', methods=['POST'])
def upload_and_predict():
    # Loading the 2d Model 
    PATH_TO_MODEL = "../model/2dModel.pt"
    model = YOLO(PATH_TO_MODEL)  # Assuming YOLO class is defined
    
    #Geeting the file from the http request
    file = request.files['file']
    
    #Creating a Temporary video file to store file
    filename = 'uploaded_video.mp4'
    file_path = os.path.join('./video-uploads', filename)
    
    #Saving the gile in the new directory
    file.save(file_path)
    
    # Loading the video with opencv 
    cap = cv2.VideoCapture(file_path)
    
    # Getting the video frame width and height
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Define the codec and create VideoWriter object

    #Defining the codec to creat VidewWriter  object
    fourcc = cv2.VideoWriter_fourcc(*'MP4V')
    out = cv2.VideoWriter('output.mp4', fourcc, 30.0, (frame_width, frame_height))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: 
            break
        
        # Yolo V8 detection 
        results = model(frame)
        print(results)
        cv2.waitKey(1)
        
        # Plotting the results and saving the video 
        res_plotted = results[0].plot()
        out.write(res_plotted)
        
        if cv2.waitKey(1) == ord('q'):
            break
        
        # Process detection results
        for detection_result in results:
            boxes = detection_result.boxes  # Boxes object for bounding box outputs
            clss = boxes.cls  # Detected Class 
            xyxy = boxes.xyxy
            xywh = boxes.xywh
            print("Class:", clss)
    
 
               
    cap.release()
    out.release()
    cv2.destroyAllWindows()     
      
    return 'Successfully Proccesed video'


# Running app
if __name__ == '__main__':
    app.run(debug=True)