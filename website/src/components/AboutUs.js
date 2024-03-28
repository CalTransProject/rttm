import React from 'react';
import "./subcomponents/sub-AboutUs/AboutUs.css"

const AboutUs = () => {
  return (
    <section>
      <div className="box">
        <h1 className="about-title">About Us</h1>
        <div className="main-content">
          <h2>Our Project Introduction</h2>
          <p className='aboutUsP'>
            The primary aim of our project is to enhance the efficiency of intelligent transportation planning through advanced vehicle detection techniques. Leveraging the robustness of 3D LiDAR technology, we endeavor to overcome the limitations faced by traditional 2D vehicle detection methods under adverse weather conditions like fog, rain, snow, and extreme winds. Our project introduces an innovative system designed to capture, process, and analyze real-time traffic flow data using 3D LiDAR cameras strategically deployed along highways and freeways, areas where existing research on 3D vehicle detection, typically focused on autonomous driving, falls short.
            Our system stands out by offering a comprehensive web-based service that not only detects and classifies vehicles in real-time traffic flows but also presents this data through dynamic, user-friendly visualizations. This approach facilitates a deeper understanding of traffic patterns, supporting more informed decisions in traffic management and planning. By bridging the gap in current research and applying 3D LiDAR technology in a novel context, our project sets a new standard for real-time vehicle detection and traffic data analysis, promising significant improvements in the field of intelligent transportation systems.
          </p>
        </div>
        <h2>Our team</h2>
        <div class="container">
          <div class="membersDisplay">
            <div class="member">
              <div class="name">Jimwell Castillo</div>
              <br></br>
              <div class="description">As our leader and front-end developer, Jimwell has masterfully crafted the homepage, showcasing his adeptness in UX/UI design. His vision and execution have provided a user-friendly gateway to our traffic monitoring system, ensuring ease of access and engagement for all users. He also worked on the database to bridge historical data visualization.</div>
              <a href="https://github.com/castvier">https://github.com/castvier</a>
            </div>
            <div class="member">
              <div class="name">Kaylee Groves</div>
              <br></br>
              <div class="description">Kaylee spearheaded the development of our camera management feature. Her expertise in front-end development, specifically within React Native, has been crucial in implementing functionalities that enable efficient camera control and data acquisition, enhancing our system's capability to monitor traffic in real-time.</div>
              <a href="https://github.com/kaygroves">https://github.com/kaygroves</a>
            </div>
            <div class="member">
              <div class="name">Raymond Gharapeti Babayans</div>
              <br></br>
              <div class="description">Raymond has been pivotal in implementing user management through Google Firebase. His efforts ensure a seamless, secure, and efficient user experience, from account creation and login to data privacy and access control, emphasizing the importance of user data protection and personalized user interaction.</div>
              <a href="https://github.com/RaySD03">https://github.com/RaySD03</a>
            </div>
            <div class="member">
              <div class="name">Gisela Calva</div>
              <br></br>
              <div class="description">Gisela initiated the development of historical data visualization, utilizing her skills in data analysis and visualization to transform raw traffic data into insightful, accessible visual narratives. This foundation has been instrumental in allowing users to understand and interpret traffic trends over time.</div>
              <a href="https://github.com/Giselv">https://github.com/Giselv</a>
            </div>
            <div class="member">
              <div class="name">Anthony Merzoian</div>
              <br></br>
              <div class="description">Focused on enhancing our system's security and developing the notification feature, Anthony has ensured that our platform is not only secure against potential threats but also capable of providing timely alerts to users. His work underscores our commitment to delivering a reliable and safe user experience.</div>
              <a href="https://github.com/anthonymerzoian">https://github.com/anthonymerzoian</a>
            </div>
            <div class="member">
              <div class="name">Alma Dollente</div>
              <br></br>
              <div class="description">Alma's role in planning and managing the historical data component of our project lays the groundwork for future enhancements in how traffic data is stored, processed, and analyzed. Her strategic approach to data management planning ensures our system's scalability and the integrity of long-term data analysis.</div>
              <a href="https://github.com/No0d1e">https://github.com/No0d1e</a>
            </div>
          </div>
        </div>
        <div className="spacing-below-team"></div> {/* Extra spacing div */}
      </div>
    </section>
  );
};

export default AboutUs;