import React from 'react';
import { NavLink } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";

const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light d-none d-md-block">
        <div className="container">
          <div className="col-1 div-header">
            <h1 className="logo">RTTM</h1>
          </div>
          <div className="col justify-content-center">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink exact to="/" className="nav-link" activeClassName="active">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink exact to="/camera-management/general" className="nav-link" activeClassName="active">
                  Camera Management
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink exact to="/historical-data/general" className="nav-link" activeClassName="active">
                  Historical Data
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink exact to="/about-us" className="nav-link" activeClassName="active">
                  About Us
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink exact to="/research-and-resources" className="nav-link" activeClassName="active">
                  Resources
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="col-1 div-header">
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