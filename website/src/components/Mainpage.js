import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Chart from "react-apexcharts";
import React, {useState} from "react";
// Mainpage refers to the content of the home page for the website
const Mainpage = () => { 
    const [state,setState] = useState({
        options: {
          chart: {
            id: "basic-bar"
          },
          xaxis: {
            categories: ["sedan", "suv", "truck", "bus", "pickup", "van"]
          }
        },
        series: [
          {
            name: "Amount of vehicles",
            data: [4, 5, 10, 3, 6, 20]
          }
        ]
      }
    )
    
    //Page Layout
    return (
        <section>    
            <div class="container-fluid">
                <div class="row row-cols-2 row-cols-xxl-3 gy-2 gx-2">
                    <div class="col">
                        <div class="video">
                            <script src="https://player.live-video.net/1.16.0/amazon-ivs-player.min.js"></script>
                            <video id="video-player" controls playsinline></video>
                        </div>
                    </div>
                    <div class="col">
                        <div class="text-box">
                            <p>
                            Vehicle detection plays an important role in analyzing the traffic flow data for intelligent transportation planning. 
                            This project monitors the real-time traffic flow of the highway using a LiDAR camera and stereo-based depth camera to 
                            collect real-time traffic data, process it for vehicle detection, and develop a web-based service with real-time vehicle 
                            detection stream and statistical data visualization.This project is composed of 4 modules: Data acquisition, 2D vehicle detection,
                            3D vehicle detection, and web application. The data acquisition module collects traffic flow data from the 2D camera and 3D LiDAR camera, 
                            after which the data is annotated and labeled. After training and testing, the 2D and 3D machine learning models will be integrated into 
                            the real-time web application for detection and classifications of vehicles in real-time traffic flow. The real-time video with recognized vehicles 
                            labeled in the video will be displayed in the web-based user interface. In addition, real-time traffic flow statistic data extracted from the 3D vehicle 
                            detection results will be visualized on the web-based user interface. 
                            </p>
                        </div>
                    </div>
                    <div class="col">
                        <div class="box">
                            <Chart
                                options = {state.options}
                                series = {state.series}
                                type = "bar"
                                width = "90%"
                                align = "center"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
} 

export default Mainpage
