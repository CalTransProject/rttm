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
      try {
        const response = await fetch('/api/historical-data');
        console.log('Fetch response:', response); // Log the fetch response

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Log the fetched data

        setHistoricalData(data);

        const processedStackedAreaData = processStackedAreaData(data);
        console.log('Processed stacked area data:', processedStackedAreaData); // Log the processed stacked area data

        const processedPieChartData = processPieChartData(data);
        console.log('Processed pie chart data:', processedPieChartData); // Log the processed pie chart data

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

    return stackedAreaDataObject;
  };

  const processPieChartData = (data) => {
    const vehicleTypeCounts = {};
    data.forEach((item) => {
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
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8B4513'],
        },
      ],
    };

    return pieChartDataObject;
  };

  return (
    <div className="GeneralSection">
      <h1>General</h1>
      {error && <p>{error}</p>}
      {historicalData.length > 0 && stackedAreaData && pieChartData && (
        <>
          <StackedArea data={stackedAreaData} />
          <Bar data={historicalData.map((item, index) => ({ time: item.UnixTimestamp, speed: item.AverageSpeed, key: index }))} />
          <PieChart data={pieChartData} />
          {historicalData.map((item, index) => (
            <StackedBar
              data={{
                ...JSON.parse(item.LaneVehicleCounts || '{}'),
              }}
              key={index}
            />
          ))}
          <Density data={historicalData.map((item, index) => ({ value: item.Density, key: index }))} />
        </>
      )}
    </div>
  );
};

export default HistoricalGeneral;