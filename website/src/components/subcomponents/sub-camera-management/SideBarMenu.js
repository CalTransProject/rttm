import React from "react";
import "./styling/SideBarMenu.css";
import { NavLink } from "react-router-dom";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from "cdbreact";

function SidebarMenu() {
  return (
    <div className="sidebar-container">
      <CDBSidebar textColor="white" backgroundColor="#565264" className="border-sidebar">
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
          Camera Management
        </CDBSidebarHeader>
        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink
              to="/camera-management/general"
              className={({ isActive }) => (isActive ? "menu-item activeClicked" : "menu-item")}
            >
              <CDBSidebarMenuItem icon="video">
                General
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              to="/camera-management/new-camera"
              className={({ isActive }) => (isActive ? "menu-item activeClicked" : "menu-item")}
            >
              <CDBSidebarMenuItem icon="plus">
                Add New Camera
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
      </CDBSidebar>
    </div>
  );
}

export default SidebarMenu;