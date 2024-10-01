import MOCK_DATA from "./Data/MOCK_DATA.json";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styling/General.css";
import ModalComponent from "../subcomponents/sub-camera-management/Modal.js";
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { motion } from "framer-motion";

const MotionButton = motion.button;
const MotionTableRow = motion.tr;
const MotionSpan = motion.span;

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
      <motion.div
        className="Table-Wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: "center" }}>
          <MotionButton
            className="add-camera-button"
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Camera
          </MotionButton>
          {lastDeleted && (
            <MotionButton
              className="undo-button"
              onClick={handleUndoDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Undo Delete
            </MotionButton>
          )}
          <motion.table
            className="table table-bordered"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
                <MotionTableRow
                  key={i}
                  className="table-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <td>{d.Index}</td>
                  <td>{d.Name}</td>
                  <td>{d.Type}</td>
                  <td>{d.Address}</td>
                  <td
                    id="edit"
                    onClick={(e) => handleIconClick(e.currentTarget.id, d)}
                    style={{ cursor: "pointer" }}
                  >
                    <MotionSpan whileHover={{ scale: 1.2 }}>
                      <PencilSquare size={30} />
                    </MotionSpan>
                  </td>
                  <td
                    id="view"
                    onClick={(e) => handleIconClick(e.currentTarget.id, d)}
                    style={{ cursor: "pointer" }}
                  >
                    <MotionSpan whileHover={{ scale: 1.2 }}>
                      <Eye size={30} />
                    </MotionSpan>
                  </td>
                  <td
                    id="del"
                    onClick={() => handleDelete(i)}
                    style={{ cursor: "pointer" }}
                  >
                    <MotionSpan whileHover={{ scale: 1.2 }}>
                      <Trash size={30} />
                    </MotionSpan>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox-large"
                      checked={isDefault(d)}
                      onChange={() => handleCheckboxChange(i)}
                    />
                  </td>
                </MotionTableRow>
              ))}
            </tbody>
          </motion.table>
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
      </motion.div>
    </div>
  );
};

export default General;
