import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import ReactEcharts from "echarts-for-react";
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
  const [trafficData, setTrafficData] = useState([]);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const processedVideoRef = useRef(null);

  useEffect(() => {
    socket.on('processing_progress', (data) => {
      setProcessingProgress(data.progress);
    });

    socket.on('traffic_data', (data) => {
      setTrafficData(prevData => [...prevData, data].slice(-100));  // Keep last 100 data points
    });

    return () => {
      socket.off('processing_progress');
      socket.off('traffic_data');
    };
  }, []);

  useEffect(() => {
    if (previewUrl && videoRef.current) {
      videoRef.current.src = previewUrl;
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleStreamFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setStreamFile(file);
      setStreamUrl('');
      setError(null);
      setProcessedVideoUrl(null);
      setUploadProgress(0);
      setProcessingProgress(0);
      setPreviewUrl(URL.createObjectURL(file));
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
      
      const videoUrl = `${API_BASE_URL}${response.data.processed_video_url}`;
      const videoExists = await checkVideoExists(response.data.processed_video_url);
      if (!videoExists) {
        throw new Error('Processed video file not found on server');
      }
      
      setProcessedVideoUrl(videoUrl);
    } catch (error) {
      console.error('Error processing video:', error);
      setError(error.response?.data?.message || error.message || 'An unknown error occurred');
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
    setTrafficData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoError = (e) => {
    console.error('Error playing processed video:', e);
    setError(`Error playing processed video: ${e.target.error?.message || 'Unknown error'}. Please try again.`);
  };

  const getChartOption = (title, data) => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { color: 'white', fontSize: 16 }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisLabel: { color: 'white', rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'white' }
    },
    series: [{
      data: data.map(item => item.value),
      type: 'line',
      smooth: true
    }],
    tooltip: {
      trigger: 'axis'
    },
    backgroundColor: 'transparent'  // To match the dark theme
  });

  return (
    <div className="upload-container">
      <h2>Upload Traffic Stream</h2>
      <form onSubmit={handleSubmit} className="upload-form">
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
            <div>
              <p>Upload Progress</p>
              <div className="progress-bar">
                <div className="progress" style={{width: `${uploadProgress}%`}}></div>
              </div>
            </div>
          )}
          {processingProgress > 0 && (
            <div>
              <p>Processing Progress</p>
              <div className="progress-bar">
                <div className="progress" style={{width: `${processingProgress}%`}}></div>
              </div>
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
          <video ref={videoRef} controls>
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {processedVideoUrl && (
        <div className="processed-video">
          <h3>Processed Video</h3>
          <video 
            ref={processedVideoRef}
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

      {trafficData.length > 0 && (
        <div className="traffic-data-charts">
          <h3>Traffic Data Analysis</h3>
          <div className="chart">
            <ReactEcharts 
              option={getChartOption('Vehicle Count', trafficData.map(item => ({ time: item.time, value: item.vehicleCount })))} 
              style={{ height: '300px', width: '100%' }}
            />
          </div>
          <div className="chart">
            <ReactEcharts 
              option={getChartOption('Average Speed', trafficData.map(item => ({ time: item.time, value: item.averageSpeed })))} 
              style={{ height: '300px', width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadTrafficStream;