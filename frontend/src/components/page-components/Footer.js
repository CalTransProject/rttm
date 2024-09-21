import React from 'react';
import { NavLink } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 footer-content">
            <NavLink to="/" className="footer-link">Home</NavLink>
            <NavLink to="/camera-management/general" className="footer-link">Camera Management</NavLink>
            <NavLink to="/historical-data/general" className="footer-link">Historical Data</NavLink>
            <NavLink to="/technologies" className="footer-link">Technologies</NavLink>
            <NavLink to="/about-us" className="footer-link">About Us</NavLink>
          </div>
        </div>
        <div className="footer-line"></div>
      </div>
    </footer>
  );
};

export default Footer;
