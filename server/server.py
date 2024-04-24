from flask import Flask, render_template, Response
from webcam import gen_frames


# Initializing flask app
app = Flask(__name__)


@app.route('/webcam')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Running app
if __name__ == '__main__':
    app.run(debug=True)