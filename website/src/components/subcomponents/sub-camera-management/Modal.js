import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./styling/Modal.css";
import { Wrench } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const ModalComponent = ({ modalInfo, showModal, handleCloseModal }) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Index: Camera {modalInfo.Index} </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalInfo && (
          <div>
            <p>
              <strong>Name: </strong>
              {modalInfo.Name}
            </p>
            <p>
              <strong>Model: </strong>
              {modalInfo.Camera_Model}
            </p>
            <p>
              <strong>Type: </strong>
              {modalInfo.Type}
            </p>
            <p>
              <strong>Address: </strong>
              {modalInfo.Address}
            </p>
            <p>
              <strong>Default: </strong>
              {modalInfo.Default}
            </p>
            <p>
              <strong>Description: </strong>
              <textarea
                id="w3review"
                name="w3review"
                rows="5"
                cols="55"
                readOnly
              >
                {modalInfo.Camera_Description}
              </textarea>
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Link to="/camera-management/configuration">
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            className="configuration-button"
          >
            Configure <Wrench size={30} />
          </Button>
        </Link>
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
