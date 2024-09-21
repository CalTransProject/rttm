import MOCK_DATA from "./Data/MOCK_DATA.json";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styling/General.css";
import ModalComponent from "../subcomponents/sub-camera-management/Modal.js";
import { Eye } from "react-bootstrap-icons";
import { PencilSquare } from "react-bootstrap-icons";
import { Trash } from "react-bootstrap-icons";


const General = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('');

  const handleIconClick = (icon, entry)=> {
    setSelectedIcon(icon);
    setShowModal(true);
    setSelectedRow(entry);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setShowModal(false);
  };

  const isDefault = (camera) => {
    return camera.Default === "Yes" ? true : false;

  }
  

  return (
    <div class="all">
      <h1 class="page-title">View All Cameras</h1>
      <div className="Table-Wrapper">
        <div style={{ textAlign: "center" }}>
          <table className="table table-bordered">
            <thead>
              <tr className="header-row">
                <th>Index</th>
                <th>Name</th>
                <th>Type</th>
                <th>Address</th>
                <th colspan="3" id="actions-col">Actions</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATA.map((d, i) => (
                <tr key={i}>
                  <td>{d.Index}</td>
                  <td>{d.Name}</td>
                  <td>{d.Type}</td>
                  <td>{d.Address}</td>
                  <td id = {"edit"} onClick={(e) => handleIconClick(e.currentTarget.id, d)}> <PencilSquare size={30} /> </td>
                  <td id = {"view"} onClick={(e) => handleIconClick(e.currentTarget.id, d)}> <Eye size={30} /> </td>
                  <td id = {"del"} onClick={(e) => handleIconClick(e.currentTarget.id, d)}> <Trash size={30} /> </td>
                  <td><input type="checkbox" disabled="true" className="checkbox-large" checked={isDefault(d)}></input></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedRow && (
          <ModalComponent
            modalInfo={selectedRow}
            showModal={showModal}
            handleCloseModal={handleCloseModal}
            icon = {selectedIcon}
          />
        )}
      </div>
    </div>
  );
};

export default General;
