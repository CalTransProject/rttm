import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedArea from './subcomponents/sub-graph/StackedArea';
import Bar from './subcomponents/sub-graph/Bar';
import PieChart from './subcomponents/sub-graph/PieChart';
import StackedBar from './subcomponents/sub-graph/StackedBar';
import Density from './subcomponents/sub-graph/Density';
import VehicleData from './VehicleData';

const HistoricalGeneral = () => {
  const [speeds, setSpeeds] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [historicalData, setHistoricalData] = useState(null);

  useEffect(() => {
    // Fetch data from the appropriate database tables
    const fetchData = async () => {
      try {
        const response = await fetch('/api/historical-data');
        const data = await response.json();
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchData();
  }, []);

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
    <div className="GeneralSection">
      <h1>General</h1>
      <div className="row row-cols-1 justify-content-center">
        <div className="col">
          <label htmlFor="file-select" className="file-select">
            View Historical Data:
          </label>
          <select id="file-select" onChange={handleFileSelect}>
            <option value="">Choose a file</option>
            {/* Add the file options */}
          </select>
        </div>
        <div className="col">
          {speeds.length > 0 && (
            <div className="tableWrapper">
              <table className="averageSpeedTable" style={tableStyle}>
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
      {historicalData && (
        <>
          <StackedArea data={StackedAreaData} />
          <Bar data={historicalData.vehicleCount} />
          <PieChart data={PieChartData} />
          <PieChart data={PieChartDataDy} />
          <StackedBar data={historicalData.vehicleTypeCounts} />
          <Density data={historicalData.density} />
          <VehicleData data={historicalData.vehicleData} />
        </>
      )}
    </div>
  );
};

export default HistoricalGeneral;