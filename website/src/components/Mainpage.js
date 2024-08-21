import React, { useState, useEffect, useRef } from "react";
import { 
  MemoizedStackedArea, 
  MemoizedBar, 
  MemoizedPieChart, 
  MemoizedStackedBar, 
  MemoizedDensity 
} from "./MemoizedChartComponents";

import StackedArea from "./subcomponents/sub-graph/StackedArea";
import Bar from "./subcomponents/sub-graph/Bar";
import PieChart from "./subcomponents/sub-graph/PieChart";
import StackedBar from "./subcomponents/sub-graph/StackedBar";
import Density from "./subcomponents/sub-graph/Density";
import "./subcomponents/sub-graph/charts.css";
import "./subcomponents/sub-s3-components/videoPlayer.css";
import "../index.css";

const Mainpage = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const [currentCounts, setCurrentCounts] = useState({});
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/webcam');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const parts = chunk.split('\r\n\r\n');
          
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].startsWith('Content-Type: application/json')) {
              const jsonData = JSON.parse(parts[i + 1]);
              console.log("Received data:", jsonData);  // Add this line for logging
              setCurrentCounts(jsonData.counts);
              setVehicleData(prevData => {
                const newData = [...prevData, { time: jsonData.timestamp, ...jsonData.counts }];
                return newData.slice(-60);  // Keep only the last 60 data points
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("Current vehicleData:", vehicleData);  // Add this line for logging
  console.log("Current currentCounts:", currentCounts);  // Add this line for logging

  return (
    <section>
      <div className="container-fluid">
        <div className="row row-cols-2">
          <div className="col">
            <h4 className="camText gradient-label">Camera 1</h4>
            <div className="video-box">
              <video
                id="camera1-video"
                className="video-js"
                autoPlay
                muted
                loop
                preload="auto"
                width="100%"
                height="100%"
                poster="YOUR_CAMERA1_POSTER.jpg"
                data-setup="{}"
              >
                <source src="../videos/YOLOv7-Tiny Demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="col">
            <h4 className="camText gradient-label">Camera 2 (2D)</h4>
            <div className="video-box">
              <img
                src="http://127.0.0.1:5000/webcam"
                alt="webcam"
                className="webcam-image"
              />
            </div>
          </div>
        </div>
        <div className="row row-cols-2 row-cols-xxl-3 gy-2 gx-2">
          <div className="col">
            <div className="box">
              <div className="chart">
                <MemoizedStackedArea data={vehicleData} />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <MemoizedBar data={vehicleData} />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <MemoizedPieChart data={currentCounts} />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <MemoizedStackedBar data={vehicleData} />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <MemoizedDensity data={vehicleData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mainpage;