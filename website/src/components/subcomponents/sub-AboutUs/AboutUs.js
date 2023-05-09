import React from 'react';
import "./sub-AboutUs/AboutUs.css"

const AboutUs = () => { 
    return(
        <section>
            <div className="box">
                
                    <h1 className="about-title">About Us</h1>
                    <h2>Our Project</h2>
                    <div className="main-content">
                        <p>...</p>
                    </div>
                    <img src="/images/img-AboutUs/CSUNlogo.png" alt="Image at the bottom"></img>
                    
    <div class="member">
      <div class="name">John Smith</div>
      <div class="description">Software Engineer</div>
    </div>
    <div class="member">
      <div class="name">Jane Doe</div>
      <div class="description">Graphic Designer</div>
    </div>
    <div class="member">
      <div class="name">Bob Johnson</div>
      <div class="description">Marketing Manager</div>
    </div>
  
            </div>
        </section>
    )
}

export default AboutUs; 
