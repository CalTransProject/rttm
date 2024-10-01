import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "./styling/Modal.css";
import camerasData from "../../camera-management-subpages/Data/MOCK_DATA.json";

const ModalComponent = ({ modalInfo, showModal, handleCloseModal, icon, onAddCamera }) => {
  const [cameraName, setCameraName] = useState("");
  const [camIndex, setCamIndex] = useState(null);
  const [cameraType, setCameraType] = useState("");
  const [address, setAddress] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("");
  const [cameraModel, setCameraModel] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (modalInfo) {
      setCameraName(modalInfo.Name);
      setCamIndex(modalInfo.Index - 1);
      setCameraType(modalInfo.Type);
      setAddress(modalInfo.Address);
      setDefaultStatus(modalInfo.Default);
      setCameraModel(modalInfo.Camera_Model);
      setDescription(modalInfo.Camera_Description);
    } else if (icon === "add") {
      setCameraName("");
      setCamIndex(camerasData.length);
      setCameraType("3D");
      setAddress("");
      setDefaultStatus("No");
      setCameraModel("");
      setDescription("");
    }
  }, [modalInfo, icon]);

  const isEditable = () => {
    return icon === "edit" ? false : true;
  };

  const isDefault = () => {
    return defaultStatus === "Yes" ? true : false;
  };

  const buttonStatus = () => {
    switch (icon) {
      case "edit":
        return <button type="submit" className="styled-button">Confirm Changes</button>;
      case "del":
        return <button type="submit" className="styled-button">Delete</button>;
      case "add":
        return <button type="submit" className="styled-button">Add Camera</button>;
      default:
        return null;
    }
  };

  const handleCameraNameChange = (event) => {
    setCameraName(event.target.value);
  };

  const handleCameraTypeChange = (event) => {
    setCameraType(event.target.value);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleDefaultStatusChange = (event) => {
    setDefaultStatus(event.target.checked ? "Yes" : "No");
  };

  const handleCameraModelChange = (event) => {
    setCameraModel(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (icon === "del") {
      camerasData.splice(camIndex, 1);
      for (let i = camIndex; i < camerasData.length; i++) {
        camerasData[i].Index -= 1;
      }
    } else if (icon === "add") {
      const newCamera = {
        Index: camerasData.length + 1,
        Name: cameraName,
        Type: cameraType,
        Address: address,
        Default: defaultStatus,
        Camera_Model: cameraModel,
        Camera_Description: description,
      };
      onAddCamera(newCamera);
    } else {
      camerasData[camIndex].Address = address;
      camerasData[camIndex].Name = cameraName;
      camerasData[camIndex].Type = cameraType;
      camerasData[camIndex].Default = defaultStatus;
      camerasData[camIndex].Camera_Model = cameraModel;
      camerasData[camIndex].Camera_Description = description;
    }
    handleCloseModal();
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {icon === "add" ? "Add New Camera" : `Index: Camera ${modalInfo?.Index}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalInfo || icon === "add" ? (
          <div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div>
                <label htmlFor="cameraName">Camera Name:</label>
                <input
                  type="text"
                  id="cameraName"
                  value={cameraName}
                  disabled={isEditable() && icon !== "add"}
                  onChange={handleCameraNameChange}
                />
              </div>
              <div>
                <label htmlFor="cameraModel">Camera Model:</label>
                <input
                  type="text"
                  id="cameraModel"
                  value={cameraModel}
                  disabled={isEditable() && icon !== "add"}
                  onChange={handleCameraModelChange}
                />
              </div>
              <div>
                <label htmlFor="address">Address:</label>
                <input
                  name="address"
                  placeholder="Address"
                  type="text"
                  autoComplete="address-line1"
                  value={address}
                  disabled={isEditable() && icon !== "add"}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <label htmlFor="cameraType">Camera Type:</label>
                <select
                  id="cameraType"
                  value={cameraType}
                  onChange={handleCameraTypeChange}
                  disabled={isEditable() && icon !== "add"}
                >
                  <option value="3D">3D</option>
                  <option value="2D">2D</option>
                </select>
              </div>
              <div>
                <label htmlFor="defaultStatus">Default Status:</label>
                <input
                  type="checkbox"
                  id="defaultStatus"
                  checked={isDefault()}
                  disabled={isEditable() && icon !== "add"}
                  onChange={handleDefaultStatusChange}
                />
              </div>
              <div>
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={description}
                  disabled={isEditable() && icon !== "add"}
                  onChange={handleDescriptionChange}
                />
              </div>
              {buttonStatus()}
            </form>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleCloseModal}
          className="close-button"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComponent;