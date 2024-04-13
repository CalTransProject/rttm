import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedArea from '../subcomponents/sub-graph/StackedArea';
import Bar from '../subcomponents/sub-graph/Bar';
import PieChart from '../subcomponents/sub-graph/PieChart';
import StackedBar from '../subcomponents/sub-graph/StackedBar';
import Density from '../subcomponents/sub-graph/Density';

const HistoricalGeneral = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [stackedAreaData, setStackedAreaData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const response = await fetch('/api/historical-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHistoricalData(data);
        setStackedAreaData(processStackedAreaData(data));
        setPieChartData(processPieChartData(data));
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch historical data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const processStackedAreaData = (data) => {
    return {
      labels: data.map((item) => new Date(item.UnixTimestamp * 1000).toLocaleString()),
      datasets: [
        {
          label: 'Vehicle Count',
          data: data.map((item) => item.TotalVehicles),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
          label: 'Average Speed',
          data: data.map((item) => item.AverageSpeed),
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
        },
      ],
    };
  };

  const processPieChartData = (data) => {
    const vehicleTypeCounts = data.reduce((acc, item) => {
      Object.entries(item.VehicleTypeCounts).forEach(([type, count]) => {
        acc[type] = (acc[type] || 0) + count;
      });
      return acc;
    }, {});

    return {
      labels: Object.keys(vehicleTypeCounts),
      datasets: [
        {
          data: Object.values(vehicleTypeCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8B4513'],
        },
      ],
    };
  };

  return (
    <div className="GeneralSection">
      <h1>General</h1>
      {error && <p className="error">{error}</p>}
      {historicalData.length > 0 && stackedAreaData && pieChartData && !error && (
        <>
          <StackedArea data={stackedAreaData} />
          <Bar data={historicalData.map((item) => ({
            time: new Date(item.UnixTimestamp * 1000).toLocaleString(),
            speed: item.AverageSpeed,
          }))} />
          <PieChart data={pieChartData} />
          {historicalData.map((item, index) => (
            <StackedBar
              data={item.LaneVehicleCounts}
              key={index}
            />
          ))}
          <Density data={historicalData.map((item) => ({
            value: item.Density,
          }))} />
        </>
      )}
    </div>
  );
};

export default HistoricalGeneral;
