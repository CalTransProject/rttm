import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/Mainpage";
import MainPicture from "./components/MainPicture";
import Chart from "react-apexcharts";
import React, {useState} from "react";
import { BrowserRouter as Router, Route, Routes, Switch } from 'react-router-dom';



function App() {
  return (
        <div className="App">
          <div className = "content">
            <Header />
          </div>
          <div className="container-fluid">            
            <MainPage />  
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
