import "./Styling/NewCamera.css";
import React, { useState, useEffect } from "react";
import camerasData from "./Data/MOCK_DATA.json";

const NewCamera = () => {
  const [defaultStatus, setDefaultStatus] = useState(true);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [inputFields, setInputFields] = useState({
    camName: "",
    camType: "3D",
    addr: "",
    isDefault: "true",
    camModel: "",
    descr: ""
  });

  const handleChange = (e) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  };

  const validateValues = (inputValues) => {
    let errors = {};
    if (!inputValues.camName) {
      errors.camName = "Camera Name is required";
    }
    if (!inputValues.addr) {
      errors.addr = "Address is required";
    }
    if(!inputValues.camModel){
      errors.camModel = "Camera Model is required";
    }
    if (!inputValues.descr ) {
      errors.descr = "Description is required";
    }
    if(inputValues.descr.length > 300){
      errors.descr = "Description is too long"
    }
    return errors;
  };

  const finishSubmit = () => {
    const newIndex = camerasData.length + 1;
     
      const newCamera = {
        Index: newIndex,
        Name: inputFields.camName,
        Type: inputFields.camType,
        Address: inputFields.addr,
        Default: defaultStatus ? "Yes" : "No",
        Camera_Model: inputFields.camModel,
        Camera_Description: inputFields.descr,
      };
      camerasData.push(newCamera);
      const jsonString = JSON.stringify(camerasData);
  
      console.log(jsonString);
  };
 
  useEffect(() => {
    if (Object.keys(errors).length === 0 && submitting) {
      finishSubmit();
    }
  }, [errors]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(validateValues(inputFields));
    setSubmitting(true);
  };

  const handleDefaultStatusChange = (event) => {
    event.target.checked === true ? setDefaultStatus("Yes") : setDefaultStatus("No");
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        {Object.keys(errors).length === 0 && submitting ? (
        <span className="success">Successfully submitted ✓</span>) : null}
        <div>
          <label htmlFor="cameraName">Camera Name:</label>
          <input
            type="text"
            id="cameraName"
            name="camName"
            value={inputFields.camName}
            onChange={handleChange}
            autoComplete="off"
            style={{ border: errors.camName ? "2px solid red" : null }}
          />
          {errors.camName ? (
            <p className="error">Camera Name is required.</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="cameraModel">Camera Model:</label>
          <input
            type="text"
            id="cameraModel"
            name="camModel"
            value={inputFields.camModel}
            onChange={handleChange}
            autoComplete="off"
            style={{ border: errors.camModel ? "2px solid red" : null }}
            />
            {errors.camModel ? (
              <p className="error">Camera Model is required.</p>
            ) : null}
        </div>

        <div>
          <label htmlFor="address">Address:</label>
          <input
            name="addr"
            type="text"
            autoComplete="off"
            value={inputFields.addr}
            onChange={handleChange}
            style={{ border: errors.addr ? "2px solid red" : null }}
            />
            {errors.addr ? (
              <p className="error">Address is required.</p>
            ) : null}
          {/* These inputs are unnecessary for now */}
          {/* <input
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
          /> */}
        </div>
        <div>
          <label htmlFor="cameraType">Camera Type:</label>
          <select
            id="cameraType"
            name="camType"
            value={inputFields.camType}
            onChange={handleChange}
            autoComplete="off"
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
            checked={inputFields.isDefault}
            onChange={handleDefaultStatusChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="descr"
            value={inputFields.descr}
            onChange={handleChange}
            autoComplete="off"
            style={{ border: errors.descr ? "2px solid red" : null }}
            />
            {errors.descr ? (
              <p className="error">Decription is required and must be less than 300 characters.</p>
            ) : null}
        </div>
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default NewCamera;
