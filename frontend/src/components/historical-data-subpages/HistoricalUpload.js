import React, { useState } from 'react';
import AWS from 'aws-sdk';
import './styling/upload.css'

AWS.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-west-1' // Change this to your S3 bucket region
});

const s3 = new AWS.S3();

const awsconnect = (file) => {
  const params = {
    Bucket: 'updownbucket',
    Key: file.name,
    Body: file
  };
  s3.upload(params, function(err, data) {
    if (err) {
      console.log('Error uploading file:', err);
    } else {
      console.log('File uploaded successfully:', data.Location);
    }
  });
};

function HistoricalUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) {
      awsconnect(selectedFile);
    }
  };

  return (
    <div className='upload'>
        <h2>Upload Data</h2>
        <form className='fileUpload' onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileUpload} />
            <button type="submit">Upload</button>
        </form>
    </div>
  );
}

export default HistoricalUpload;
