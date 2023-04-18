import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalComponent = ({ modalInfo, showModal, handleCloseModal }) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Selected Row Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalInfo && (
          <div>
            <p>
              <strong>Index: </strong>
              {modalInfo.Index}
            </p>
            <p>
              <strong>Name: </strong>
              {modalInfo.Name}
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
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComponent;
