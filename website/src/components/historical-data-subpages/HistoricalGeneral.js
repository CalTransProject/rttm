import React, { useState, useEffect } from 'react';
import './styling/general.css';

const HistoricalGeneral = () => {
  const [speeds, setSpeeds] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    if (selectedFile !== '') {
      fetch(`/mockData/${selectedFile}`)
        .then((response) => response.json())
        .then((data) => setSpeeds(data.speeds));
    }
  }, [selectedFile]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.value);
  };

  const tableStyle = {
    fontSize: '18px',
    fontFamily: 'Segoe UI',
  };

  return (
    <div className='GeneralSection'>
      <h1>General</h1>
      <div className='row row-cols-1 justify-content-center'>
        <div className="col">
          <label htmlFor='file-select' className='file-select'>View Historical Data:</label>
          <select id='file-select' onChange={handleFileSelect}>
            <option value=''>Choose a file</option>
            <option value='data_20230512_011641.json'>20230512_011641</option>
            {/* Add more options here */}
          </select>
          <br />
          <button className="btn btn-primary mt-2">Download</button>
          <button className="btn btn-secondary mt-2">Upload</button>
          <button className="btn btn-info mt-2">Recent History of Camera</button>
        </div>
        <div className="col">
          {speeds.length > 0 && (
            <div className='tableWrapper'>
              <table className='averageSpeedTable' style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableStyle}>Time (s)</th>
                    <th style={tableStyle}>Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {speeds.map((speed, index) => (
                    <tr key={index}>
                      <td style={tableStyle}>{index + 1}</td>
                      <td style={tableStyle}>{speed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Add graph placement areas here */}
        <div className="col">
          {/* Graph 1 */}
        </div>
        <div className="col">
          {/* Graph 2 */}
        </div>
        <div className="col">
          {/* Graph 3 */}
        </div>
      </div>
    </div>
  );
};

export default HistoricalGeneral;
