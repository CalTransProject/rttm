import React from "react";
import Header from "./components/page-components/Header";
import Footer from "./components/page-components/Footer";
import MainPage from "./components/Mainpage";
import Technologies from "./components/Technologies";
import HistoricalData from "./components/HistoricalData";
import CameraManagement from "./components/CameraManagement";
import General from "./components/camera-management-subpages/General";
import HistoricalGeneral from "./components/historical-data-subpages/HistoricalGeneral";
import HistoricalUpload from "./components/historical-data-subpages/HistoricalUpload";
import HistoricalDownload from "./components/historical-data-subpages/HistoricalDownload";
import UploadTrafficStream from "./components/historical-data-subpages/UploadTrafficStream";
import ManageTrafficStream from "./components/historical-data-subpages/ManageTrafficStream";
import EditTrafficStream from "./components/historical-data-subpages/EditTrafficStream"; // New import for EditTrafficStream
import Configuration from "./components/camera-management-subpages/Configuration";
import NewCamera from "./components/camera-management-subpages/NewCamera";
import RemoveCameras from "./components/camera-management-subpages/RemoveCameras";
import AboutUs from "./components/AboutUs";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <div className="content">
        <Header />
      </div>
      <div className="container-fluid">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/technologies" element={<Technologies />} />
          <Route path="/camera-management" element={<CameraManagement />}>
            <Route path="general" element={<General />} />
            <Route path="new-camera" element={<NewCamera />} />
            <Route path="remove-cameras" element={<RemoveCameras />} />
            <Route path="configuration" element={<Configuration />} />
          </Route>
          <Route path="/historical-data" element={<HistoricalData />}>
            <Route path="general" element={<HistoricalGeneral />} />
            <Route path="upload" element={<HistoricalUpload />} />
            <Route path="download" element={<HistoricalDownload />} />
            <Route path="upload-traffic-stream" element={<UploadTrafficStream />} />
            <Route path="manage-traffic-stream" element={<ManageTrafficStream />} />
            <Route path="edit-stream/:streamId" element={<EditTrafficStream />} /> {/* New Route for editing a stream */}
          </Route>
          <Route path="/about-us" element={<AboutUs />} />
        </Routes>
      </div>
      <div className="chart"></div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default App;