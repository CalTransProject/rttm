import React from 'react';
import { NavLink } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";
import { motion } from 'framer-motion';

const MotionNavLink = motion(NavLink);

const Header = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <motion.h1
            className="logo col-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            RTTM
          </motion.h1>
          <div className="navbar-nav col-8 justify-content-center">
            <MotionNavLink
              to="/"
              className="nav-link"
              whileHover={{ scale: 1.1}}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </MotionNavLink>
            <MotionNavLink
              to="/camera-management/general"
              className="nav-link"
              whileHover={{ scale: 1.1}}
              whileTap={{ scale: 0.95 }}
            >
              Camera Management
            </MotionNavLink>
            <MotionNavLink
              to="/historical-data/general"
              className="nav-link"
              whileHover={{ scale: 1.1}}
              whileTap={{ scale: 0.95 }}
            >
              Historical Data
            </MotionNavLink>
            {/* <MotionNavLink
              to="/about-us"
              className="nav-link"
              whileHover={{ scale: 1.1, color: "#f8c102" }}
              whileTap={{ scale: 0.95 }}
            >
              About Us
            </MotionNavLink> */}
            <MotionNavLink
              to="/research-and-resources"
              className="nav-link"
              whileHover={{ scale: 1.1}}
              whileTap={{ scale: 0.95 }}
            >
              Research And Resources
            </MotionNavLink>
          </div>
          <div className="col-2 text-right">
            <MotionNavLink
              to="/my-account"
              className="user_button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              My Account
            </MotionNavLink>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
