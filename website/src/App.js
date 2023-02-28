import Header from "./components/page-components/Header";
import Footer from "./components/page-components/Footer";
import MainPage from "./components/Mainpage";
import Technologies from "./components/Technologies";
import CameraManagement from "./components/CameraManagement";
import HistoricalData from "./components/HistoricalData";
import React, {useState} from "react";
import { BrowserRouter as Router, Route, Routes, Switch } from 'react-router-dom';



function App() {
  return (
        <div className="App">
          <div className = "content">
            <Header />
          </div>
          <div className="container-fluid">            
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/technologies" element={<Technologies />} />
              <Route path="/camera-management" element={<CameraManagement />} />
              <Route path="/historical-data" element={<HistoricalData />} />

            </Routes>
          </div>
          <div className = "chart">
            
          </div>
          <div className="footer">
            <Footer />
          </div>
        </div>
  );
}

export default App;
