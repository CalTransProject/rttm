from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from ml_module import process_video
import os
import logging
import traceback
import requests
import tempfile

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['PROCESSED_FOLDER'] = 'processed_videos'
for folder in [app.config['UPLOAD_FOLDER'], app.config['PROCESSED_FOLDER']]:
    if not os.path.exists(folder):
        os.makedirs(folder)

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Server is running"}), 200

@app.route('/api/process-video', methods=['POST'])
def process_uploaded_video():
    try:
        temp_dir = tempfile.mkdtemp()
        if 'video' in request.files:
            video = request.files['video']
            if video.filename == '':
                return jsonify({'error': 'No selected file'}), 400
            
            filename = secure_filename(video.filename)
            filepath = os.path.join(temp_dir, filename)
            video.save(filepath)
            logging.info(f"Video saved to {filepath}")
        elif 'url' in request.form:
            url = request.form['url']
            filepath = os.path.join(temp_dir, 'temp_video')
            response = requests.get(url, stream=True)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            logging.info(f"Video downloaded from URL and saved to {filepath}")
        else:
            return jsonify({'error': 'No video file or URL provided'}), 400

        def progress_callback(progress):
            socketio.emit('processing_progress', {'progress': progress})

        processed_video_path = process_video(filepath, progress_callback)
        
        if not os.path.exists(processed_video_path):
            raise FileNotFoundError(f"Processed video file not found: {processed_video_path}")

        processed_filename = os.path.basename(processed_video_path)
        return jsonify({'processed_video_url': f'/api/processed-video/{processed_filename}'})
    except Exception as e:
        logging.error(f"Error processing video: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'file_info': {
                'filename': filename if 'filename' in locals() else 'N/A',
                'filepath': filepath if 'filepath' in locals() else 'N/A',
                'file_exists': os.path.exists(filepath) if 'filepath' in locals() else 'N/A',
                'file_size': os.path.getsize(filepath) if 'filepath' in locals() and os.path.exists(filepath) else 'N/A'
            }
        }), 500
    finally:
        if 'temp_dir' in locals() and os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                os.remove(os.path.join(temp_dir, file))
            os.rmdir(temp_dir)
            logging.info(f"Removed temporary directory: {temp_dir}")

@app.route('/api/processed-video/<filename>')
def processed_video(filename):
    try:
        return send_from_directory(app.config['PROCESSED_FOLDER'], filename, mimetype='video/mp4', as_attachment=True)
    except FileNotFoundError:
        logging.error(f"Processed video file not found: {filename}")
        return jsonify({'error': 'Processed video not found'}), 404
    except Exception as e:
        logging.error(f"Error serving processed video: {str(e)}")
        return jsonify({'error': 'Error serving video'}), 500

@app.route('/api/check-video/<filename>')
def check_video(filename):
    file_path = os.path.join(app.config['PROCESSED_FOLDER'], filename)
    if os.path.exists(file_path):
        return jsonify({
            'exists': True,
            'size': os.path.getsize(file_path),
            'last_modified': os.path.getmtime(file_path)
        })
    else:
        return jsonify({'exists': False}), 404

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)