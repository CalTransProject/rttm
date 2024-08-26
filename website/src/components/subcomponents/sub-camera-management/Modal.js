import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./styling/Modal.css";
import camerasData from "../../camera-management-subpages/Data/MOCK_DATA.json"; 


const ModalComponent = ({ modalInfo, showModal, handleCloseModal, icon }) => {
  
  //Fields are only editable(not disabled) if in edit mode
  const isEditable = () => {
    return (icon === "edit") ? false: true;
  }

  const isDefault = () => {
    return defaultStatus == "Yes" ? true : false;
  }

  const buttonStatus = () => {
    switch(icon) {
      case "edit":
        return <button type="submit">Confirm Changes</button>
        break;
      case "del":
        return <button type="submit">Delete</button>
        break;
      default:    
    } 
  }

  const [cameraName, setCameraName] = useState(modalInfo.Name);
  const [camIndex, setCamIndex] = useState(modalInfo.Index-1);
  const [cameraType, setCameraType] = useState(modalInfo.Type);
  const [address, setAddress] = useState(modalInfo.Address);
  const [defaultStatus, setDefaultStatus] = useState(modalInfo.Default);
  const [cameraModel, setCameraModel] = useState(modalInfo.Camera_Model);
  const [description, setDescription] = useState(modalInfo.Camera_Description);

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
    event.target.checked === true ? setDefaultStatus("Yes") : setDefaultStatus("No");
  };

  const handleCameraModelChange = (event) => {
    setCameraModel(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  //function for updating camera's data
  const handleSubmit = (event) => {
    event.preventDefault();
    if(icon === "del"){
      camerasData.splice(camIndex, 1);
      for(let i = camIndex; i < camerasData.length; i++){ //updating subsequent camera's indexes
        camerasData[i].Index -= 1;
      }
    }

    else{
      camerasData[camIndex].Address = address;
      camerasData[camIndex].Name = cameraName;
      camerasData[camIndex].Type = cameraType;
      camerasData[camIndex].Default = defaultStatus;
      camerasData[camIndex].Camera_Model = cameraModel;
      camerasData[camIndex].Camera_Description = description;
    }
    handleCloseModal()
  };  

  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Index: Camera {modalInfo.Index} </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalInfo && (
          <div>
            <form onSubmit={handleSubmit} className="modal-form" >
              <div>
                <label htmlFor="cameraName">Camera Name:</label>
                <input
                  type="text"
                  id="cameraName"
                  value={cameraName}
                  disabled = {isEditable()}
                  onChange={handleCameraNameChange}
                />
              </div>
              <div>
                <label htmlFor="cameraModel">Camera Model:</label>
                <input
                  type="text"
                  id="cameraModel"
                  value={cameraModel}
                  disabled = {isEditable()}
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
                  disabled = {isEditable()}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <label htmlFor="cameraType">Camera Type:</label>
                <select
                  id="cameraType"
                  value={cameraType}
                  onChange={handleCameraTypeChange}
                  disabled = {isEditable()}
                >
                  <option value="3D">3D</option>
                  <option value="2D">2D</option>
                </select>
              </div>
              <div>
                <label htmlFor="defaulttatus">Default Status:</label>
                <input
                  type="checkbox"
                  id="defaultStatus"
                  checked = {isDefault()}
                  disabled = {isEditable()}
                  onChange={handleDefaultStatusChange}
                />
              </div>
              <div>
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={description}
                  disabled = {isEditable()}
                  onChange={handleDescriptionChange}
                />
              </div>
              {buttonStatus()}
            </form>
          </div>
        )}
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
