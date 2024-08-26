import React from "react";
import { Outlet } from "react-router-dom";
import SidebarMenu from "./subcomponents/sub-camera-management/SideBarMenu";
import "./camera-management-subpages/Styling/cameraManagement.css";

const CameraManagement = () => {
  return (
    <div className="camera-management">
      <div className="sidebar">
        <SidebarMenu />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default CameraManagement;