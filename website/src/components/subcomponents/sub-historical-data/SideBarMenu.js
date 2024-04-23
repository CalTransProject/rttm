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

function HistoricalSidebarMenu() {
  return (
    <div className="sidebar-container">
      <CDBSidebar textColor="white" backgroundColor="#565264" className="border-sidebar">
        <CDBSidebarHeader
          prefix={<i className="fa fa-bars fa-large" hover="red"></i>}
        >
          Historical Data
        </CDBSidebarHeader>
        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink
              exact="true"
              to="general"
              activeClassName="active-link"
            >
              <CDBSidebarMenuItem className="menu-item" icon="book">
                General
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              exact="true"
              to="upload"
              activeClassName="active-link"
            >
              <CDBSidebarMenuItem className="menu-item" icon="upload">
                Upload Data
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
      </CDBSidebar>
    </div>
  );
}

export default HistoricalSidebarMenu;