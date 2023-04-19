import MOCK_DATA from "./Data/MOCK_DATA.json";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import "./Styling/General.css";
import ModalComponent from "../subcomponents/sub-camera-management/Modal.js";

const General = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setShowModal(false);
  };

  

  return (
    <div className="Table-Wrapper">
      <div style={{ textAlign: "center" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Index</th>
              <th>Name</th>
              <th>Type</th>
              <th>Address</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map((d, i) => (
              <tr key={i} onClick={() => handleRowClick(d)}>
                <td>{d.Index}</td>
                <td>{d.Name}</td>
                <td>{d.Type}</td>
                <td>{d.Address}</td>
                <td>{d.Default}</td>
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
        />
      )}
    </div>
  );
};

export default General;
