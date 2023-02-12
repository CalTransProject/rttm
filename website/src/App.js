import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/Mainpage";
import Technologies from "./components/Technologies";
import LoginMain from "./components/LoginMain";
import TestPage from "./components/TestPage";
import MainPicture from "./components/subcomponents/MainPicture";
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
              <Route path="/login" element={<LoginMain />} />
              <Route path="/test" element={<TestPage />} />
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
