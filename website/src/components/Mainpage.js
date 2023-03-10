//import Chart from "react-apexcharts";
import React, {useState} from "react";
import StackedArea from './subcomponents/StackedArea';
import StackedBar from './subcomponents/Bar';
import PieChart from './subcomponents/PieChart';
import './subcomponents/charts.css'
import Video from "./subcomponents/sub-s3-components/Video";
import Body from "./subcomponents/sub-s3-components/Body";
import './subcomponents/sub-s3-components/videoPlayer.css';
// Mainpage refers to the content of the home page for the website
const Mainpage = () => { 
    //Page Layout
    return (
        <section>    
            <div class="container-fluid">
                <div class="row row-cols-1">
                <div class="col text-center">
                        <h1 className="welcome">Welcome to Home Dashboard</h1>
                    </div>
                </div>
                <div class="row row-cols-2">
                    <div class="col">
                        <h4 class="camText">Camera 1</h4>
                        <Body />
                    </div>
                    <div class="col">
                        <h4 class="camText">Camera 2</h4>
                            <div class="video-box">
                                <h5>Video Player Placeholder</h5>
                                {/* <Video /> */}
                            </div>
                    </div>
                </div>
                <div class="row row-cols-2 row-cols-xxl-3 gy-2 gx-2">
                    {/* <div class="col">
                        <div class="text-box">
                            <h2>The Home Dashboard</h2>
                            <p>
                            This is where users will be able to view all of the
                            live feed from the camera view whether it's through the
                            2D or LiDAR camera, or through the data visualizations
                            provided by the data from the camera.
                            </p>
                        </div>
                    </div> */}
                    <div class="col">
                        <div class="box">
                            <div class = "chart">
                            {
                            <StackedArea/>
                            }
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="box">
                        <div class = "chart">
                        { <StackedBar/>}
                        </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="box">
                        <div class = "chart">
                        {
                        <PieChart/>}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
} 

export default Mainpage
