import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './styling/trafficstream.css';

const API_BASE_URL = 'http://localhost:5001';
const socket = io(API_BASE_URL);

function UploadTrafficStream() {
  const [streamFile, setStreamFile] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const processedVideoRef = useRef(null);

  useEffect(() => {
    socket.on('processing_progress', (data) => {
      setProcessingProgress(data.progress);
    });

    return () => {
      socket.off('processing_progress');
    };
  }, []);

  useEffect(() => {
    if (previewUrl && videoRef.current) {
      videoRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleStreamFileUpload = (event) => {
    const file = event.target.files[0];
    setStreamFile(file);
    setStreamUrl('');
    setError(null);
    setProcessedVideoUrl(null);
    setUploadProgress(0);
    setProcessingProgress(0);
    
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file) {
      setError('Please select a valid video file.');
      setPreviewUrl(null);
      setStreamFile(null);
    }
  };

  const handleStreamUrlChange = (event) => {
    setStreamUrl(event.target.value);
    setStreamFile(null);
    setPreviewUrl(null);
    setError(null);
    setProcessedVideoUrl(null);
    setUploadProgress(0);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const checkVideoExists = async (url) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-video/${url.split('/').pop()}`);
      console.log('Video file info:', response.data);
      return true;
    } catch (error) {
      console.error('Error checking video file:', error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);
    setProcessedVideoUrl(null);
    setUploadProgress(0);
    setProcessingProgress(0);

    try {
      let response;
      if (streamFile) {
        const formData = new FormData();
        formData.append('video', streamFile);
        response = await axios.post(`${API_BASE_URL}/api/process-video`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
      } else if (streamUrl) {
        response = await axios.post(`${API_BASE_URL}/api/process-video-url`, { url: streamUrl });
      } else {
        throw new Error('Please provide a video file or URL.');
      }
      console.log('Server response:', response);
      
      const videoUrl = `${API_BASE_URL}${response.data.processed_video_url}`;
      const videoExists = await checkVideoExists(response.data.processed_video_url);
      if (!videoExists) {
        throw new Error('Processed video file not found on server');
      }
      
      setProcessedVideoUrl(videoUrl);
    } catch (error) {
      console.error('Error processing video:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        setError(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from server. Please check if the server is running and accessible.');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    setStreamFile(null);
    setStreamUrl('');
    setPreviewUrl(null);
    setError(null);
    setProcessedVideoUrl(null);
    setUploadProgress(0);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoError = (e) => {
    console.error('Error playing processed video:', e);
    console.error('Video element:', processedVideoRef.current);
    console.error('Video source:', processedVideoRef.current?.src);
    console.error('Video error code:', processedVideoRef.current?.error?.code);
    console.error('Video error message:', processedVideoRef.current?.error?.message);
    setError(`Error playing processed video: ${processedVideoRef.current?.error?.message || 'Unknown error'}. Please try again.`);
  };

  return (
    <div className='upload-container'>
      <h2>Upload Traffic Stream</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <input 
            type="file" 
            onChange={handleStreamFileUpload} 
            accept="video/*"
            disabled={processing}
            ref={fileInputRef}
          />
        </div>
        <div className="url-input-container">
          <input 
            type="text" 
            placeholder="Or enter stream URL" 
            value={streamUrl} 
            onChange={handleStreamUrlChange}
            disabled={processing}
          />
        </div>
        <div className="button-container">
          <button type="submit" disabled={processing || (!streamFile && !streamUrl)}>
            {processing ? 'Processing...' : 'Upload and Process Stream'}
          </button>
          <button type="button" onClick={handleClear} disabled={processing}>
            Clear
          </button>
        </div>
      </form>
      
      {(processing || uploadProgress > 0 || processingProgress > 0) && (
        <div className="progress-container">
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
              <span className="progress-text">{`Upload: ${uploadProgress}%`}</span>
            </div>
          )}
          {processingProgress > 0 && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${processingProgress}%` }}></div>
              <span className="progress-text">{`Processing: ${processingProgress}%`}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {previewUrl && (
        <div className="video-preview">
          <h3>Original Video Preview</h3>
          <video ref={videoRef} width="320" height="240" controls>
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {processedVideoUrl && (
        <div className="processed-video">
          <h3>Processed Video</h3>
          <video 
            ref={processedVideoRef}
            width="320" 
            height="240" 
            controls 
            src={processedVideoUrl}
            onError={handleVideoError}
            onLoadStart={() => setVideoLoading(true)}
            onLoadedData={() => setVideoLoading(false)}
          >
            Your browser does not support the video tag.
          </video>
          {videoLoading && <p>Loading processed video...</p>}
        </div>
      )}
    </div>
  );
}

export default UploadTrafficStream;