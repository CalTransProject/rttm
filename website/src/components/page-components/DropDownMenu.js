import "bootstrap/dist/css/bootstrap.min.css";
import "./dropdownmenu.css";
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from "react";

import { FaBars, FaTimes } from 'react-icons/fa';



const DropdownNav = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    }
  return (
    <div className="dropdown-menu d-block d-md-none"> 
    <div className="menu-icon" onClick={toggleMenu}>
        <span id="left-section">RTTM</span>
        <span id="right-section">{isOpen ? <FaTimes /> : <FaBars />}</span>
      
    </div>
    <ul className={isOpen ? 'menu-list active' : 'menu-list'}>
    <li class="menu-item">
                <NavLink exact to="/" className="nav-link" activeClassName="active" >
                  Home
                </NavLink>
              </li>
              <li class="menu-item">
                <NavLink exact to="/camera-management/general" className="nav-link" activeClassName="active">
                  Camera Management
                </NavLink>
              </li>
              <li class="menu-item">
                <NavLink exact to="/historical-data/general" className="nav-link" activeClassName="active">
                Historical Data
                </NavLink>
              </li>
              <li class="menu-item">
                <NavLink exact to="/research-and-resources" className="nav-link" activeClassName="active">
                Resources
                </NavLink>
              </li>
              <li class="menu-item">
                <NavLink exact to="/about-us" className="nav-link" activeClassName="active">
                About Us
                </NavLink>
              </li>
              
    </ul>
  </div>
  );
};

export default DropdownNav;
