// Technology Page
import React, { useState, useEffect } from "react";
import TechnologyTrafficPicture from "./subcomponents/sub-technologies/TechnologyTrafficPicture";
import TechnologyLidarPicture from "./subcomponents/sub-technologies/TechnologyLidarPicture";
import TechnologyWebDevPicture from "./subcomponents/sub-technologies/TechnologyWebDevPicture";
import Technology3DModelPicture from "./subcomponents/sub-technologies/Technology3DModelPicture";
import TechnologyDataPicture from "./subcomponents/sub-technologies/TechnologyDataPicture";
import TechnologyObjectDetectionPicture from "./subcomponents/sub-technologies/TechnologyObjectDetectionPicture";
import Technology2DModelPicture from "./subcomponents/sub-technologies/Technology2DModelPicture";
const Technologies = () => {
  const [activeSection, setActiveSection] = useState("");

  //Function pupose to handle button Click and scroll to specific info section
  const handleClick = (section) => {
    setActiveSection(section);
  };

  useEffect(() => {
    //Hellper Function to find element by id and scroll to specific info section
    const sectionElement = document.getElementById(activeSection);
    if (sectionElement) {
      sectionElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeSection]);

  return (
    <section>
      <div class="container-fluid">
        <div class="col">
          <button
            onClick={() => handleClick("WebDevelopment")}
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            Web Development
          </button>

          <button
            onClick={() => handleClick("3DModel")}
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            3D Model
          </button>

          <button
            onClick={() => handleClick("DataAcquisition")}
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            Data Acquisition
          </button>

          <button
            onClick={() => handleClick("ObjectDetection")}
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            Object Detection
          </button>

          <button
            onClick={() => handleClick("2DModel")}
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            2D Model
          </button>
        </div>

        <div class="row row-cols-2">
          <div class="col">
            <div class="text-box">
              <h3>Real Time Traffic Monitoring</h3>
              <p>
                Contribute to intelligent transportation systems (ITS)
                applications to achieve smarter and safer transportation
                infrastructure. This is done through LiDAR data that can provide
                valuable info that traditional radar or video s ensors can't.
              </p>
            </div>
          </div>
          <div class="col">
            <div>
              <TechnologyTrafficPicture />
            </div>
          </div>
          <div class="col">
            <TechnologyLidarPicture />
          </div>
          <div class="col">
            <div class="text-box">
              <h4>What is LiDAR?</h4>
              <p>
                Contribute to intelligent transportation systems (ITS)
                applications to achieve smarter and safer transportation
                infrastructure. This is done through LiDAR data that can provide
                valuable info that traditional radar or video s ensors can't.
              </p>
            </div>
          </div>
        </div>

        <div class="row row-cols-2">
          <div class="col">
            <div id="WebDevelopment" class="text-box">
              <h3>Web Development</h3>
              <p>
                - React-Bootstrap - <br /> - ECharts - A javascript library that
                provides a wide range of charts that one can use and also have
                them update in real-time.
              </p>
            </div>
          </div>
          <div class="col">
            <TechnologyWebDevPicture />
          </div>
          <div class="col">
            <Technology3DModelPicture />
          </div>
          <div class="col">
            <div id="3DModel" class="text-box">
              <h4>3D Model</h4>
              <p>
                - MATLAB (labeling) - The Lidar Labeler toolbox enables you to
                interactively label ground truth data in a point cloud or a
                point cloud sequence and generate corresponding ground truth
                data. <br />- PyTorch -
              </p>
            </div>
          </div>
        </div>
        <div class="row row-cols-2">
          <div class="col">
            <div id="DataAcquisition" class="text-box">
              <h3>Data Acquisition</h3>
              <p>
                - LiDAR (light detection and ranging): Captures a 3D scan of the
                environment in the form of point clouds.
                <br /> - Velodyne Ultra Puck - Real-time 3D LiDAR data is
                collected using Velodyne’s Ultra Puck cameras, combining long
                range performance with outstanding resolution and point density
                in a compact form factor. (I copied and pasted this) <br />-
                Intel RealSense Depth Camera D435i - 2D data is collected using
                the Intel RealSense Depth Camera, which is able to display video
                and depth metrics on the Intel RealSense Viewer platform. In our
                use case, we use it primarily only for 2D stream of traffic
                without the use of depth metrics since it doesn’t really apply.
              </p>
            </div>
          </div>
          <div class="col">
            {" "}
            <TechnologyDataPicture />
          </div>
          <div class="col">
            <TechnologyObjectDetectionPicture />
          </div>
          <div class="col">
            <div id="ObjectDetection" class="text-box">
              <h4>Object Detection</h4>
              <p>
                - Complex-YOLO
                <br />- YOLOv7
                <br /> - SORT
              </p>
            </div>
          </div>
        </div>
        <div class="row row-cols-2">
          <div class="col">
            <div id="2DModel" class="text-box">
              <h3>2D Model</h3>
              <p>
                YOLOv7: Most up-to-date and accurate 2D object detection model
                that is perfect for vehicle detection. <br />- labelImg:
                Software used to take relevant images and manually apply
                bounding boxes for the sake of training the model. <br />-
                Google Colab: Cloud hosted version of Jupyter Notebook that is
                being used to train the custom dataset and run the model with
                the aforementioned dataset.
              </p>
            </div>
          </div>
          <div class="col">
            <Technology2DModelPicture />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technologies;
