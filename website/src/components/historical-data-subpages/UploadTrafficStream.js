import React, { useState } from 'react';
import './styling/trafficstream.css';

function UploadTrafficStream() {
  const [streamFile, setStreamFile] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  const handleStreamFileUpload = (event) => {
    setStreamFile(event.target.files[0]);
  };

  const handleStreamUrlChange = (event) => {
    setStreamUrl(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (streamFile) {
      console.log('Uploading file:', streamFile);
    } else if (streamUrl) {
      console.log('Submitting stream URL:', streamUrl);
    } else {
      console.error('No file or URL provided!');
    }
  };

  return (
    <div className='upload-container'> {/* Adjusted class name */}
        <h2>Upload Traffic Stream</h2>
        <div className="file-input-container"> {/* New container for file input */}
            <input type="file" onChange={handleStreamFileUpload} />
        </div>
        <div className="url-input-container"> {/* New container for URL input */}
            <input type="text" placeholder="Or enter stream URL" value={streamUrl} onChange={handleStreamUrlChange} />
        </div>
        <button type="submit" onClick={handleSubmit}>Upload Stream</button>
    </div>
);
}

export default UploadTrafficStream;