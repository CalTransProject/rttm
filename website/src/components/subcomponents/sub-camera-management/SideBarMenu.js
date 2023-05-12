import React from "react";
import "./styling/SideBarMenu.css";
import { Outlet } from "react-router-dom";
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
      <CDBSidebar textColor="white" backgroundColor="rgb(36, 36, 36)">
        <CDBSidebarHeader
          prefix={<i className="fa fa-bars fa-large" hover="red"></i>}
        >
          Camera Management
        </CDBSidebarHeader>
        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink
              exact
              to="/camera-management/general"
              active
            >
              <CDBSidebarMenuItem className="menu-item" icon="video">
                General
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              exact
              to="/camera-management/new-camera"
              activeClassName="activeClicked"
            >
              <CDBSidebarMenuItem className="menu-item" icon="plus">
                Add New Camera
              </CDBSidebarMenuItem>
            </NavLink>
            
          </CDBSidebarMenu>
        </CDBSidebarContent>
        {/* <CDBSidebarFooter style={{ textAlign: "center" }}>
          <div className="sidebar-footer">Sidebar Footer</div>
        </CDBSidebarFooter> */}
      </CDBSidebar>
      <Outlet />
    </div>
  );
}

export default SidebarMenu;
