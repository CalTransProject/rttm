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
    fontSize: '28px', // Change the font size as needed
    fontFamily: 'Segoe UI',
  };

  return (
    <div className='GeneralSection'>
      <h1>General</h1>
      <div className='row row-cols-1 justify-content-center'>
            <div class="col">
                <label htmlFor='file-select' className='file-select'>View Historical Data:</label>
                <select id='file-select' onChange={handleFileSelect}>
                    <option value=''>Choose a file</option>
                    <option value='data_20230512_011641.json'>20230512_011641</option>
                    <option value='data_20230512_011741.json'>20230512_011741</option>
                    <option value='data_20230512_011841.json'>20230512_011841</option>
                    <option value='data_20230512_011941.json'>20230512_011941</option>
                    <option value='data_20230512_012041.json'>20230512_012041</option>
                    <option value='data_20230512_012141.json'>20230512_012141</option>
                    <option value='data_20230512_012241.json'>20230512_012241</option>
                    <option value='data_20230512_012341.json'>20230512_012341</option>
                    <option value='data_20230512_012441.json'>20230512_012441</option>
                    <option value='data_20230512_012541.json'>20230512_012541</option>

                    <option value='data_20230512_012641.json'>20230512_012641</option>
                    <option value='data_20230512_012741.json'>20230512_012741</option>
                    <option value='data_20230512_012841.json'>20230512_012841</option>
                    <option value='data_20230512_012941.json'>20230512_012941</option>
                    <option value='data_20230512_013041.json'>20230512_013041</option>
                    <option value='data_20230512_013141.json'>20230512_013141</option>
                    <option value='data_20230512_013241.json'>20230512_013241</option>
                    <option value='data_20230512_013341.json'>20230512_013341</option>
                    <option value='data_20230512_013441.json'>20230512_013441</option>
                    <option value='data_20230512_013541.json'>20230512_013541</option>

                    <option value='data_20230512_013641.json'>20230512_013641</option>
                    <option value='data_20230512_013741.json'>20230512_013741</option>
                    <option value='data_20230512_013841.json'>20230512_013841</option>
                    <option value='data_20230512_013941.json'>20230512_013941</option>
                    <option value='data_20230512_014041.json'>20230512_014041</option>
                    <option value='data_20230512_014141.json'>20230512_014141</option>
                    <option value='data_20230512_014241.json'>20230512_014241</option>
                    <option value='data_20230512_014341.json'>20230512_014341</option>
                    <option value='data_20230512_014441.json'>20230512_014441</option>
                    <option value='data_20230512_014541.json'>20230512_014541</option>
                </select>
            </div>
            <div class="col">
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
                        {Array.from({ length: 60 }, (_, index) => (
                        <tr key={index}>
                            <td style={tableStyle}>{index + 1}</td>
                            <td style={tableStyle}>{speeds[index]}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default HistoricalGeneral;
