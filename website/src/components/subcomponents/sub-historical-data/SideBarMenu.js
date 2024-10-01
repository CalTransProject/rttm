import React from "react";
import "./styling/SideBarMenu.css";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from "cdbreact";
import { NavLink } from "react-router-dom";
import { motion } from 'framer-motion'; // Import Framer Motion

function HistoricalSidebarMenu() {
  return (
    <div className="sidebar-container">
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CDBSidebar textColor="white" backgroundColor="#565264" className="border-sidebar">
          <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
            Historical Data
          </CDBSidebarHeader>
          <CDBSidebarContent className="sidebar-content">
            <CDBSidebarMenu>
              <NavLink exact="true" to="general" activeClassName="active-link">
                <CDBSidebarMenuItem className="menu-item" icon="book">
                  General
                </CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact="true" to="upload" activeClassName="active-link">
                <CDBSidebarMenuItem className="menu-item" icon="upload">
                  Upload Data
                </CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact="true" to="upload-traffic-stream" activeClassName="active-link">
                <CDBSidebarMenuItem className="menu-item" icon="stream">
                  Upload Traffic Stream
                </CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact="true" to="manage-traffic-stream" activeClassName="active-link">
                <CDBSidebarMenuItem className="menu-item" icon="tasks">
                  Manage Traffic Stream
                </CDBSidebarMenuItem>
              </NavLink>
              {/* Added Activity Monitor menu item
              <NavLink exact="true" to="activity-monitor" activeClassName="active-link">
                <CDBSidebarMenuItem className="menu-item" icon="chart-line">
                  Activity Monitor
                </CDBSidebarMenuItem>
              </NavLink> */}
            </CDBSidebarMenu>
          </CDBSidebarContent>
        </CDBSidebar>
      </motion.div>
    </div>
  );
}

export default HistoricalSidebarMenu;
