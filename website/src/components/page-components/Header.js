import React from 'react';
import { NavLink } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";

const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <h1 className="logo col-2">RTTM</h1>
          <div className="navbar-nav col-8 justify-content-center">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
            <NavLink to="/camera-management/general" className="nav-link">
              Camera Management
            </NavLink>
            <NavLink to="/historical-data/general" className="nav-link">
              Historical Data
            </NavLink>
            <NavLink to="/about-us" className="nav-link">
              About Us
            </NavLink>
            <NavLink to="/research-and-resources" className="nav-link">
              ResearchAndResources
            </NavLink>
          </div>
          <div className="col-2 text-right">
            <NavLink to="/my-account" className="btn btn-primary">
              My Account
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;