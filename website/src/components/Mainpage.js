//import Chart from "react-apexcharts";
import React from "react";
import StackedArea from './subcomponents/sub-graph/StackedArea';
import Bar from './subcomponents/sub-graph/Bar';
import PieChart from './subcomponents/sub-graph/PieChart';
import './subcomponents/sub-graph/charts.css';
import './subcomponents/sub-s3-components/videoPlayer.css';
import StackedBar from "./subcomponents/sub-graph/StackedBar";
import Density from "./subcomponents/sub-graph/Density";
import '../index.css';
// testhomepage
const Mainpage = () => {
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
                <source src="../videos/YOLOv7-Tiny Demo.mp4" type="video/mp4" /> {/* Change to your Camera 1 video path */}
              </video>
            </div>
          </div>
          <div className="col">
            <h4 className="camText gradient-label">Camera 2</h4>
            <div className="video-box">
              <video
                id="camera2-video"
                className="video-js"
                autoPlay
                muted
                loop
                preload="auto"
                width="100%"
                height="100%"
                poster="MY_VIDEO_POSTER.jpg"
                data-setup="{}"
              >
                <source src="../videos/YOLOv7-Tiny Demo.mp4" type="video/mp4" />
              </video>
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