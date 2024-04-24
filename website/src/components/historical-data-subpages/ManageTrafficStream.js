import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './styling/manageTrafficStream.css';

// The modal component for viewing stream details
const StreamDetailsModal = ({ stream, onClose }) => {
  return (
    <div className="stream-details-modal">
      <div className="stream-details-content">
        <h2>{stream.name} Details</h2>
        <p>Status: {stream.status}</p>
        <p>Date: {stream.date}</p>
        {/* Add more details as needed */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const ManageTrafficStream = () => {
  const [streams, setStreams] = useState([
    { id: 1, name: 'Stream 1', status: 'Active', date: '2022-01-01' },
    { id: 2, name: 'Stream 2', status: 'Processing', date: '2022-01-02' },
    { id: 3, name: 'Stream 3', status: 'Completed', date: '2022-01-03' },
    // ... more streams
  ]);
  const [viewingStream, setViewingStream] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  // Handlers for actions
  const handleView = (stream) => {
    setViewingStream(stream);
  };

  const handleEdit = (streamId) => {
    navigate(`/historical-data/edit-stream/${streamId}`); // Corrected path
  };
  

  const handleDelete = (streamId) => {
    if (window.confirm('Are you sure you want to delete this stream?')) {
      setStreams(streams.filter(stream => stream.id !== streamId)); // Remove the stream from the list
    }
  };

  return (
    <div className="manage-traffic-stream">
      <h1>Manage Traffic Streams</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {streams.map(stream => (
            <tr key={stream.id}>
              <td>{stream.name}</td>
              <td>{stream.status}</td>
              <td>{stream.date}</td>
              <td>
                <button onClick={() => handleView(stream)}>View</button>
                <button onClick={() => handleEdit(stream.id)}>Edit</button>
                <button onClick={() => handleDelete(stream.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {viewingStream && <StreamDetailsModal stream={viewingStream} onClose={() => setViewingStream(null)} />}
    </div>
  );
};

export default ManageTrafficStream;
