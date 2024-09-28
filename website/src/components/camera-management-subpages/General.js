import MOCK_DATA from "./Data/MOCK_DATA.json";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styling/General.css";
import ModalComponent from "../subcomponents/sub-camera-management/Modal.js";
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";

const General = () => {
  const [data, setData] = useState(MOCK_DATA);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);

  const handleIconClick = (icon, entry) => {
    setSelectedIcon(icon);
    setShowModal(true);
    setSelectedRow(entry);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setShowModal(false);
    setShowAddModal(false);
  };

  const isDefault = (camera) => {
    return camera.Default === "Yes" ? true : false;
  };

  const handleDelete = (index) => {
    const deletedCamera = data[index];
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    setLastDeleted(deletedCamera);
  };

  const handleUndoDelete = () => {
    if (lastDeleted) {
      setData([...data, lastDeleted]);
      setLastDeleted(null);
    }
  };

  const handleAddCamera = (newCamera) => {
    setData([...data, newCamera]);
    setShowAddModal(false);
  };

  const handleCheckboxChange = (index) => {
    const newData = data.map((camera, i) => {
      if (i === index) {
        return { ...camera, Default: camera.Default === "Yes" ? "No" : "Yes" };
      }
      return camera;
    });
    setData(newData);
  };

  return (
    <div className="all">
      <h1 className="page-title">View All Cameras</h1>
      <div className="Table-Wrapper">
        <div style={{ textAlign: "center" }}>
          <button className="add-camera-button" onClick={() => setShowAddModal(true)}>
            Add Camera
          </button>
          {lastDeleted && (
            <button className="undo-button" onClick={handleUndoDelete}>
              Undo Delete
            </button>
          )}
          <table className="table table-bordered">
            <thead>
              <tr className="header-row">
                <th>Index</th>
                <th>Name</th>
                <th>Type</th>
                <th>Address</th>
                <th colSpan="3" id="actions-col">Actions</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="table-row">
                  <td>{d.Index}</td>
                  <td>{d.Name}</td>
                  <td>{d.Type}</td>
                  <td>{d.Address}</td>
                  <td id="edit" onClick={(e) => handleIconClick(e.currentTarget.id, d)}> <PencilSquare size={30} /> </td>
                  <td id="view" onClick={(e) => handleIconClick(e.currentTarget.id, d)}> <Eye size={30} /> </td>
                  <td id="del" onClick={() => handleDelete(i)}> <Trash size={30} /> </td>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox-large"
                      checked={isDefault(d)}
                      onChange={() => handleCheckboxChange(i)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedRow && showModal && (
          <ModalComponent
            modalInfo={selectedRow}
            showModal={showModal}
            handleCloseModal={handleCloseModal}
            icon={selectedIcon}
          />
        )}
        {showAddModal && (
          <ModalComponent
            showModal={showAddModal}
            handleCloseModal={handleCloseModal}
            icon="add"
            onAddCamera={handleAddCamera}
          />
        )}
      </div>
    </div>
  );
};

export default General;