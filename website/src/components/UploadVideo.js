import React, { useState } from "react";
import "../index.css";

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload-and-predict", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload video");
      }
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      setBlobUrl(blobURL); // Store the Blob URL in state
      setUploadStatus("processed"); // Update status after processing
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error"); // Update status on error
    }
  };

  const handleDownload = async () => {
    if (blobUrl) {
      const blob = await fetch(blobUrl).then((response) => response.blob());
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "processed_video.mp4";
      link.click();
    }
  };

  return (
    <div className="container-fluid">
      <div className="row row-cols-2">
        <div className="col">
          <input type="file" accept="video/*" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      </div>

      <div className="row">
        <div className="col"></div>{" "}
        {uploadStatus === "idle" && <p>Select a video to predict.</p>}
        {uploadStatus === "uploading" && (
          <p>Uploading and predicting video...</p>
        )}
        {uploadStatus === "processed" && (
          <>
            <video controls className="video-image">
              <source src={blobUrl} />
              Your browser does not support the video tag.
            </video>
            <button onClick={handleDownload} disabled={!blobUrl}>
              Download Video
            </button>
          </>
        )}
        {uploadStatus === "error" && <p>Error processing video. Try again.</p>}
      </div>
    </div>
  );
};

export default UploadVideo;
