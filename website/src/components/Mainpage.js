//import Chart from "react-apexcharts";

import React, { useEffect, useRef } from "react";
import StackedArea from "./subcomponents/sub-graph/StackedArea";
import Bar from "./subcomponents/sub-graph/Bar";
import PieChart from "./subcomponents/sub-graph/PieChart";
import "./subcomponents/sub-graph/charts.css";
import "./subcomponents/sub-s3-components/videoPlayer.css";
import StackedBar from "./subcomponents/sub-graph/StackedBar";
import Density from "./subcomponents/sub-graph/Density";
import "../index.css";
// testhomepage
const Mainpage = () => {
  const videoRef = useRef(null);
  useEffect(() => {
    const fetchWebcamStream = async () => {
      try {
        const videoElement = videoRef.current;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoElement && stream) {
          videoElement.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam stream:", error);
      }
    };

    fetchWebcamStream();
  }, []);
  // Page Layout
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
                poster="YOUR_CAMERA1_POSTER.jpg" // Change to your Camera 1 poster image path
                data-setup="{}"
              >
                <source src="../videos/YOLOv7-Tiny Demo.mp4" type="video/mp4" />{" "}
                {/* Change to your Camera 1 video path */}
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
          {/* Other content */}
          <div className="col">
            <div className="box">
              <div className="chart">
                <StackedArea />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <Bar />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <PieChart />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <StackedBar />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <Density />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mainpage;
