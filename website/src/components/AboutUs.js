import React from 'react';
import "./subcomponents/sub-AboutUs/AboutUs.css"

const AboutUs = () => { 
    return(
        <section>
            <div className="box">
                
                    <h1 className="about-title">About Us</h1>
                    
                    <div className="main-content">
                    <h2>Our Project</h2>  
                        <p>Vehicle detection plays an important role in analyzing traffic flow data for efficient planning in intelligent transportation. Machine Learning technology has been increasingly used for vehicle detection in both 2D real-time traffic flow video and 3D point clouds. Adverse weather conditions, such as fog, rain, snow, extreme wind, and other conditions prove to be challenging for 2D vehicle detection. 3D LiDAR point clouds can be more resistant to adverse weather conditions. Most of the existing research on 3D vehicle detection are used for autonomous vehicle driving with the LiDAR cameras are deployed on vehicles. There is a lack of research on real-time vehicle detection for intelligent transportation with LiDAR cameras deployed by highway/freeway. In this project, we propose to build a system that collects real-time traffic flow data through 3D LiDAR cameras, processes the 3D point cloud data for vehicle detection and classification, and provides a web-based service with vehicles detected and classified in real-time traffic flow and data visualization for statistical traffic flow data.</p>
                    </div>
                    <h2>Our team</h2>
                    
                    <div class="container">                 
    <div class="member">
      <div class="name">Andres Mercado</div>
      <div class="description">I am a graduating Senior, interested in Robotics and Machine Learning. On this project I helped the Machine Learning team integrate the tiny Yolo algorithm that was the best fit for our project. </div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    
    <div class="member">
      <div class="name">Alondra Gonzalez</div>
      <div class="description">Hello my name's Alondra Gonzalez, I worked on the data acquisition process and configuring the AWS Kinesis Video Streams module to add a stream to the project website.</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    <div class="member">
      <div class="name">Alexander Rose</div>
      <div class="description">Software Engineer</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    <div class="member">
      <div class="name">Brian Uribe</div>
      <div class="description">Software Engineer</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    <div class="member">
      <div class="name">Icess Nisce</div>
      <div class="description">Software Engineer</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    
    <div class="member">
      <div class="name">Matthew Davis</div>
      <div class="description">The son of a colgate baron, he was given the sector of wash and rinse 
      liquids. But one day he had enough and ran away from his country to study in the most prestigious of schools
      and discovered the wonders of computer science. He worked on 2D detection and Yolo.</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    <div class="member">
      <div class="name">Javier Carranza</div>
      <div class="description">Software Engineer</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    <div class="member">
      <div class="name">Robin Rosculete</div>
      <div class="description">Software Engineer</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    <div class="member">
      <div class="name">Jose Flores</div>
      <div class="description">Software Engineer</div>
      <a href="https://github.com/CalTransProject">
        <img src="/images/img-AboutUs/githublogo.png" alt="Git hub logo" class="github-photo"></img>
      </a>
    </div>
    
    </div>
    
        <img src="/images/img-AboutUs/CSUNlogo.png" alt="Image at the bottom"></img>
                    
    
     
            </div>
        </section>
    )
}

export default AboutUs; 
