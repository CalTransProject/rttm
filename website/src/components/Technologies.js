// Technologies.js
import React from "react";
import { motion } from 'framer-motion'; // Import Framer Motion
import TechnologyTrafficPicture from "./subcomponents/sub-technologies/TechnologyTrafficPicture";
import TechnologyLidarPicture from "./subcomponents/sub-technologies/TechnologyLidarPicture";
import TechnologyWebDevPicture from "./subcomponents/sub-technologies/TechnologyWebDevPicture";
import Technology3DModelPicture from "./subcomponents/sub-technologies/Technology3DModelPicture";
import TechnologyDataPicture from "./subcomponents/sub-technologies/TechnologyDataPicture";
import Technology2DModelPicture from "./subcomponents/sub-technologies/Technology2DModelPicture";
import "./subcomponents/sub-technologies/technologies.css";

const Technologies = () => {
  return (
    <section>
      <div className="container-fluid">  
        <div className="row row-cols-2">
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div> 

          {/* First Section */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="techH">Real Time Traffic Monitoring</h2>
                <p className="techP">
                  The Real-Time Traffic Monitoring project monitors traffic flow in Southern California, 
                  providing a system that collects and streams traffic data, detects and classifies vehicles, 
                  and generates data statistics which describe traffic flow, all in real time. With technologies
                  like LiDAR sensing and machine learning, this system is intended to be an application of 
                  intelligent transportation systems (ITS) in California’s major metropolitan areas.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <TechnologyTrafficPicture />
              </div>
            </motion.div>
          </div>
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div> 

          {/* Second Section */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TechnologyLidarPicture />
            </motion.div>
          </div>
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="techHR">What is LiDAR?</h2>
                <p className="techPR">
                  Intelligent transportation systems (ITS) have become increasingly 
                  important to the development of smarter and safer transportation infrastructure, 
                  especially in Southern California, where traffic continues to be a severe 
                  and chronic problem. Vehicle detection technologies greatly support the 
                  applications of ITS, providing information such as the number of vehicles
                  in traffic, number of vehicle types, or density of vehicles in each lane. 
                  This is done through LiDAR data that can provide
                  valuable info that traditional radar or video sensors can't.
                </p>
              </div>
            </motion.div>
          </div>
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div> 

          {/* Third Section */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="techH">Web Development</h2>
                <p className="techP">
                  The creation of our website was done with the help of React libraries! Some that were used were
                  Bootstrap to customize and organize the pages on the website as well as the components on the site. 
                  AWS SDK was used to be able to create a connection between the website and the AWS system. ECharts 
                  was used to display real-time data statistics on the website. ReactHLSPlayer was used to be able 
                  to display the real-time 2D Video on the website.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <TechnologyWebDevPicture />
              </div>
            </motion.div>
          </div>
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div>

          {/* Fourth Section */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TechnologyDataPicture />
            </motion.div>
          </div>
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="techHR">Data Acquisition</h2>
                <p className="techPR">
                  When it came to data acquisition it all happened thanks to the help of two devices. The 
                  Velodyne Ultra Puck helped capture a 3D scan of the environment in the form of 
                  point clouds in real time. The Intel RealSense Depth Camera D435i helped with 2D data collection, 
                  displaying video and depth metrics, though we mainly used the camera solely for streaming 
                  without the metrics.
                </p>
              </div>
            </motion.div>
          </div>
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div> 

          {/* Fifth Section */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="techH">2D Model</h2>
                <p className="techP">
                  When it came to the 2D Model, YOLOv7-tiny was one of the big pieces of technologies. 
                  It's one of the most up-to-date and accurate 2D object detection models, making it perfect for 
                  vehicle detection. LabelImg was used to take relevant images and manually apply bounding 
                  boxes for the sake of training the model to accommodate the project. Google Colab was 
                  used as a cloud-hosted version of Jupyter Notebook used to train the custom dataset and 
                  run the model with the aforementioned dataset.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <Technology2DModelPicture />
              </div>
            </motion.div>
          </div>
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div>

          {/* Sixth Section */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Technology3DModelPicture />
            </motion.div>
          </div>
          <div className="col">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="techHR">3D Model</h2>
                <p className="techPR">
                  With the 3D model, MATLAB's LiDAR labeler toolbox was used to interactively label ground truth data in point clouds or point cloud sequences and generate corresponding ground truth data.
                </p>
              </div>
            </motion.div>
          </div>
          {/* Spacing Breaks */}
          <div className="col"></div>
          <div className="col"><br /><br /></div>
        </div>
      </div>
    </section>
  );
};

export default Technologies;
