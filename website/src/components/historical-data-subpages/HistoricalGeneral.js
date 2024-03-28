import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedArea from '../subcomponents/sub-graph/StackedArea';
import Bar from '../subcomponents/sub-graph/Bar';
import PieChart from '../subcomponents/sub-graph/PieChart';
import StackedBar from '../subcomponents/sub-graph/StackedBar';
import Density from '../subcomponents/sub-graph/Density';

const HistoricalGeneral = () => {
  const [historicalData, setHistoricalData] = useState(null);
  const [stackedAreaData, setStackedAreaData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/historical-data');
        if (!response.ok) {
          throw new Error('Request failed');
        }
        const data = await response.json();
        setHistoricalData(data);

        const processedStackedAreaData = processStackedAreaData(data);
        const processedPieChartData = processPieChartData(data);
        setStackedAreaData(processedStackedAreaData);
        setPieChartData(processedPieChartData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setError('Failed to fetch historical data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  // Helper functions to process the fetched data and create the required data objects
  const processStackedAreaData = (data) => {
    const stackedAreaDataObject = {
      labels: data.map(item => new Date(item.UnixTimestamp * 1000).toLocaleString()), // Use timestamps as labels
      datasets: [
        {
          label: 'Vehicle Count',
          data: data.map(item => item.TotalVehicles), // Extract vehicle count data
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
          label: 'Average Speed',
          data: data.map(item => item.AverageSpeed), // Extract average speed data
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
        },
      ],
    };

    return stackedAreaDataObject;
  };

  const processPieChartData = (data) => {
    const vehicleTypeCounts = {};
    data.forEach(item => {
      if (item.VehicleTypeCounts) {
        Object.entries(item.VehicleTypeCounts).forEach(([type, count]) => {
          vehicleTypeCounts[type] = (vehicleTypeCounts[type] || 0) + count;
        });
      }
    });

    const pieChartDataObject = {
      labels: Object.keys(vehicleTypeCounts),
      datasets: [
        {
          data: Object.values(vehicleTypeCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8B4513'], // Assign colors for different vehicle types
        },
      ],
    };

    return pieChartDataObject;
  };

  return (
    <div className="GeneralSection">
      <h1>General</h1>
      {error && <p>{error}</p>}
      {historicalData && stackedAreaData && pieChartData && (
        <>
          <StackedArea data={stackedAreaData} />
          <Bar data={historicalData.map(item => ({ time: item.UnixTimestamp, speed: item.AverageSpeed }))} />
          <PieChart data={pieChartData} />
          <StackedBar
            data={historicalData.map(item => ({
              ...JSON.parse(item.LaneVehicleCounts || '{}'),
            }))}
          />
          <Density data={historicalData.map(item => item.Density)} />
        </>
      )}
    </div>
  );
};

export default HistoricalGeneral;