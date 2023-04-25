import "./Styling/NewCamera.css";
import React, { useState } from "react";
import camerasData from "./Data/MOCK_DATA.json";

const NewCamera = () => {
  const [cameraName, setCameraName] = useState("");
  const [cameraType, setCameraType] = useState("3D");
  const [address, setAddress] = useState("");
  const [defaultStatus, setDefaultStatus] = useState(true);
  const [cameraModel, setCameraModel] = useState("");
  const [description, setDescription] = useState("");

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
    setDefaultStatus(event.target.checked);
  };

  const handleCameraModelChange = (event) => {
    setCameraModel(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newIndex = camerasData.length + 1;
    const newCamera = {
      Index: newIndex,
      Name: cameraName,
      Type: cameraType,
      Address: address,
      Default: defaultStatus ? "Yes" : "No",
      Camera_Model: cameraModel,
      Camera_Description: description,
    };
    camerasData.push(newCamera);
    const jsonString = JSON.stringify(camerasData);

    console.log(jsonString);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="cameraName">Camera Name:</label>
          <input
            type="text"
            id="cameraName"
            value={cameraName}
            onChange={handleCameraNameChange}
          />
        </div>
        <div>
          <label htmlFor="cameraModel">Camera Model:</label>
          <input
            type="text"
            id="cameraModel"
            value={cameraModel}
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
            onChange={handleAddressChange}
          />
          <input
            name="city"
            placeholder="City"
            type="text"
            autoComplete="address-level2"
          />
          <input
            name="state"
            placeholder="State"
            type="text"
            autoComplete="address-level1"
          />
          <input
            name="country"
            placeholder="Country"
            type="text"
            autoComplete="country"
          />
          <input
            name="postcode"
            placeholder="Postcode"
            type="text"
            autoComplete="postal-code"
          />
        </div>
        <div>
          <label htmlFor="cameraType">Camera Type:</label>
          <select
            id="cameraType"
            value={cameraType}
            onChange={handleCameraTypeChange}
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
            checked={defaultStatus}
            onChange={handleDefaultStatusChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default NewCamera;
