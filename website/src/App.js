import Header from "./components/page-components/Header";
import Footer from "./components/page-components/Footer";
import MainPage from "./components/Mainpage";
import Technologies from "./components/Technologies";
import HistoricalData from "./components/HistoricalData";

import CameraManagement from "./components/CameraManagement";
import General from "./components/camera-management-subpages/General";
import Configuration from "./components/camera-management-subpages/Configuration";
import NewCamera from "./components/camera-management-subpages/NewCamera";
import RemoveCameras from "./components/camera-management-subpages/RemoveCameras";

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Switch,
} from "react-router-dom";
import AboutUs from "./components/AboutUs";

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

          <Route path="/historical-data" element={<HistoricalData />} />
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
