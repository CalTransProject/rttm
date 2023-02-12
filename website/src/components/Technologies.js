// Technology Page
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Chart from "react-apexcharts";
import React, { useState } from "react";
import TechnologyTrafficPicture from "./subcomponents/TechnologyTrafficPicture";
import TechnologyLidarPicture from "./subcomponents/TechnologyLidarPicture";
const Technologies = () => {
  return (
    <section>
      <div class="container-fluid">
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
            <TechnologyTrafficPicture />
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
        <div class="col">
          <a
            href="#"
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            Data Acquisition
          </a>
          <a
            href="#"
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            Web Development
          </a>
          <a
            href="#"
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            3D Model
          </a>
          <a
            href="#"
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            2D Model
          </a>
          <a
            href="#"
            class="btn btn-outline-light"
            role="button"
            aria-pressed="true"
          >
            Object Detection
          </a>
        </div>

        <div class="col">
          <div class="text-box">
            <u>
              <h3>Web Development</h3>
            </u>
            <p>
              Bootstrap + React
              <br /> The web development was made possible with the use of
              React-Bootstrap. React is used in order to build components and
              make the UI workload easier to build. We used bootstrap in order
              to style the website's content. In our case it would be the
              buttons we have on the header and footer of our website currently.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technologies;
