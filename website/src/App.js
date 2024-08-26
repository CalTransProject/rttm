import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { AuthContextProvider, UserAuth } from "./context/AuthContext";
import Header from "./components/page-components/Header";
import DropdownNav from "./components/page-components/DropDownMenu";
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
import EditTrafficStream from "./components/historical-data-subpages/EditTrafficStream";
import Configuration from "./components/camera-management-subpages/Configuration";
import NewCamera from "./components/camera-management-subpages/NewCamera";
import RemoveCameras from "./components/camera-management-subpages/RemoveCameras";
import AboutUs from "./components/AboutUs";
import ResearchAndResources from "./components/ResearchAndResources";
import UserAuthentication from "./components/UserAuthentication";
import MyAccount from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectLogin from "./components/ProtectLogin";

function App() {
  return (
    <div className="App">
      <div className="content">
        <Header />
        <DropdownNav />
      </div>
      <div className="container-fluid">
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
            <Route path="/technologies" element={<Technologies />} />
            <Route path="/camera-management" element={<ProtectedRoute><CameraManagement /></ProtectedRoute>}>
              <Route path="general" element={<ProtectedRoute><General /></ProtectedRoute>} />
              <Route path="new-camera" element={<ProtectedRoute><NewCamera /></ProtectedRoute>} />
              <Route path="remove-cameras" element={<ProtectedRoute><RemoveCameras /></ProtectedRoute>} />
              <Route path="configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
            </Route>
            <Route path="/historical-data" element={<ProtectedRoute><HistoricalData /></ProtectedRoute>}>
              <Route path="general" element={<ProtectedRoute><HistoricalGeneral /></ProtectedRoute>} />
              <Route path="upload" element={<ProtectedRoute><HistoricalUpload /></ProtectedRoute>} />
              <Route path="download" element={<ProtectedRoute><HistoricalDownload /></ProtectedRoute>} />
              <Route path="upload-traffic-stream" element={<ProtectedRoute><UploadTrafficStream /></ProtectedRoute>} />
              <Route path="manage-traffic-stream" element={<ProtectedRoute><ManageTrafficStream /></ProtectedRoute>} />
              <Route path="edit-stream/:streamId" element={<ProtectedRoute><EditTrafficStream /></ProtectedRoute>} />
            </Route>
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/research-and-resources" element={<ResearchAndResources />} />
            <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/user-authentication" element={<ProtectLogin><UserAuthentication /></ProtectLogin>} />
          </Routes>
        </AuthContextProvider>
      </div>
      <div className="chart"></div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default App;