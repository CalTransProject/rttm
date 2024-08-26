import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './styling/EditTrafficStream.css'; // Make sure you have the corresponding CSS

const EditTrafficStream = () => {
  const { streamId } = useParams(); // This gets the streamId from the URL
  const [streamData, setStreamData] = useState(null);

  useEffect(() => {
    // Simulate fetching data with the fake data generator
    const fakeData = {
      id: streamId,
      name: `Stream ${streamId}`,
      status: 'Active',
      date: '2022-01-01',
    };
    setStreamData(fakeData); // Set the fake data to state
  }, [streamId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setStreamData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulate form submission
    alert(`Stream updated: ${JSON.stringify(streamData)}`);
    // In a real scenario, you would send a request to update the data
  };

  // If streamData is null (data not fetched yet), show loading state
  if (!streamData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-traffic-stream">
      <h2>Edit Traffic Stream</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={streamData.name}
          onChange={handleChange}
        />

        <label htmlFor="status">Status:</label>
        <input
          type="text"
          id="status"
          name="status"
          value={streamData.status}
          onChange={handleChange}
        />

        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={streamData.date}
          onChange={handleChange}
        />

        <button type="submit">Update Stream</button>
      </form>
    </div>
  );
};

export default EditTrafficStream;
