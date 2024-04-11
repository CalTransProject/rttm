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

function HistoricalSidebarMenu() {
  return (
    <div className="sidebar-container">
      <CDBSidebar textColor="white" backgroundColor="rgb(36, 36, 36)">
        <CDBSidebarHeader
          prefix={<i className="fa fa-bars fa-large" hover="red"></i>}
        >
          Historical Data
        </CDBSidebarHeader>
        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink
              exact="true"
              to="/historical-data/general"
              activeClassName="active-link"
            >
              <CDBSidebarMenuItem className="menu-item" icon="book">
                General
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              exact="true"
              to="/historical-data/upload"
              activeClassName="active-link"
            >
              <CDBSidebarMenuItem className="menu-item" icon="upload">
                Upload Data
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
      </CDBSidebar>
      <Outlet />
    </div>
  );
}

export default HistoricalSidebarMenu;