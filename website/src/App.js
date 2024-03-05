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
import Configuration from "./components/camera-management-subpages/Configuration";
import NewCamera from "./components/camera-management-subpages/NewCamera";
import RemoveCameras from "./components/camera-management-subpages/RemoveCameras";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { AuthContextProvider } from "./context/AuthContext";

import React, { useState, useEffect, navigate } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import AboutUs from "./components/AboutUs";
import Mainpage from "./components/Mainpage";
import UserAuthentication from "./components/UserAuthentication";
import MyAccount from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectLogin from "./components/ProtectLogin";

import { UserAuth } from './context/AuthContext';

function App() {

  return (
    <div className="App">
      <div className="content">
        <Header />
      </div>
      <div className="container-fluid">
        <Routes>
          <Route path="/" element={<Mainpage />} />
          <Route path="/technologies" element={<Technologies />} /> 
        </Routes>
          
        <Routes>
            <Route path="/camera-management" element={<CameraManagement />}>
              <Route path="general" element={<General />} />
              <Route path="new-camera" element={<NewCamera />} />
              <Route path="remove-cameras" element={<RemoveCameras />} />
              <Route path="configuration" element={<Configuration />} />
            </Route>
        </Routes>

        <Routes>
           <Route path="/historical-data" element={<HistoricalData />}>
              <Route path="general" element={<HistoricalGeneral />} />
              <Route path="upload" element={<HistoricalUpload />} />
              <Route path="download" element={<HistoricalDownload />} />
            </Route>
            <Route path="/about-us" element={<AboutUs />} />
        </Routes>
  
        <AuthContextProvider>
        <Routes>
            <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>}/>
        </Routes>
        <Routes>
            <Route path="/user-authentication" element={<ProtectLogin><UserAuthentication/></ProtectLogin>} />
        </Routes>
        </AuthContextProvider>

      </div>
      <div className="chart"></div>
      <div className="footer">
     
      </div>
    </div>
  );
}

export default App;
