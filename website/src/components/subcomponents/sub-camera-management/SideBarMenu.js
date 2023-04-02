import React from "react";
import "./styling/SideBarMenu.css";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from "cdbreact";
import { NavLink } from "react-router-dom";

function SidebarMenu() {
  return (
    <div className="sidebar-container">
      <CDBSidebar textColor="white" backgroundColor="#2229">
        <CDBSidebarHeader
          prefix={<i className="fa fa-bars fa-large" hover="red"></i>}
        >
          Camera Management
        </CDBSidebarHeader>
        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink
              exact
              to="/camera-management"
              activeClassName="activeClicked"
            >
              <CDBSidebarMenuItem className="menu-item" icon="video">
                General
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              exact
              to="/camera-management"
              activeClassName="activeClicked"
            >
              <CDBSidebarMenuItem className="menu-item" icon="plus">
                Add New Camera
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              exact
              to="/camera-management"
              activeClassName="activeClicked"
            >
              <CDBSidebarMenuItem
                className="menu-item"
                icon="fa-regular fa-video-slash"
              >
                Remove Cameras
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              exact
              to="/camera-management"
              activeClassName="activeClicked"
            >
              <CDBSidebarMenuItem className="menu-item" icon="wrench">
                Configuration
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
        <CDBSidebarFooter style={{ textAlign: "center" }}>
          <div className="sidebar-footer">Sidebar Footer</div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
}

export default SidebarMenu;
