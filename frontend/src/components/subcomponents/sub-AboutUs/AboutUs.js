import React from 'react';
import "./sub-AboutUs/AboutUs.css";

const AboutUs = () => {
  return (
    <section>
      <div className="box">
        <h1 className="about-title">About Us</h1>
        <h2>Our Project</h2>
        <div className="main-content">
          <p>...</p>
        </div>
        <img src="/images/img-AboutUs/CSUNlogo.png" alt="Image at the bottom"></img>
        <div className="member">
          <div className="name">John Smith</div>
          <div className="description">Software Engineer</div>
        </div>
        <div className="member">
          <div className="name">Jane Doe</div>
          <div className="description">Graphic Designer</div>
        </div>
        <div className="member">
          <div className="name">Bob Johnson</div>
          <div className="description">Marketing Manager</div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;