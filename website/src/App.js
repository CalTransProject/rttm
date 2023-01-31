import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/Mainpage";
import MainPicture from "./components/MainPicture";
import Chart from "react-apexcharts";
import React, {useState} from "react";
import { BrowserRouter as Router, Route, Routes, Switch } from 'react-router-dom';



function App() {
  const [state,setState] = useState({
    options: {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: ["Van", "Semi Truck", "SUV", "Bus"]
      }
    },
    series: [
      {
        name: "series-1",
        data: [4, 5, 10, 3]
      }
    ]
  }
)
  return (
    <Router>
        <div className="App">
          <div className = "content">
            <Header />
          </div>
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={
                <MainPage />} />
            </Routes>
          </div>
          <div className = "chart">
            <Chart
              options = {state.options}
              series = {state.series}
              type = "bar"
              width = "500"
            />
          </div>
          <div className="footer">
            <Footer />
          </div>
        </div>
      
    </Router>
  );
}

export default App;
