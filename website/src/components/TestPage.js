import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
//import Chart from "react-apexcharts";
import React, {useState} from "react";
import StackedArea from './subcomponents/StackedArea';
import StackedBar from './subcomponents/Bar';
import PieChart from './subcomponents/PieChart';


const TestPage = () => { 
    return(
        <section>    
            <div class="container-fluid">
                <div class="row row-cols-2">
                    <div class="col">
                        <h2>Home</h2>
                            <div class="box">
                                <video
                                    id="my-video"
                                    class="video-js"
                                    controls
                                    preload="auto"
                                    width="640"
                                    height="264"
                                    poster="MY_VIDEO_POSTER.jpg"
                                    data-setup="{}"
                                >
                                    <source src="MY_VIDEO.mp4" type="video/mp4" />
                                    <source src="MY_VIDEO.webm" type="video/webm" />
                                </video>
                            </div>
                    </div>
                    
                    <div class="col">
                        <div class="box">
                            <div class = "chart">
                            {
                            <StackedArea/>
                            }
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </section>
    )
}

export default TestPage