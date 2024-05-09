import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedAreaHist from '../subcomponents/sub-graph/StackedAreaHist';
import PieChartHist from '../subcomponents/sub-graph/PieChartHist';
import StackedBarHist from '../subcomponents/sub-graph/StackedBarHist';
import DensityHist from '../subcomponents/sub-graph/DensityHist';
import HeatMapHist from '../subcomponents/sub-graph/HeatMapHist';

const HistoricalGeneral = () => {
  const [dataType, setDataType] = useState('per-second');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        let url;
        let limit;

        switch (dataType) {
          case 'per-second':
            url = 'http://localhost:3008/api/per-second-data';
            limit = 100;
            break;
          case 'per-minute':
            url = 'http://localhost:3008/api/per-minute-data';
            limit = 8;
            break;
          case 'per-5-minute':
            url = 'http://localhost:3008/api/per-5-minute-data';
            limit = 3;
            break;
          case 'per-hour':
            url = 'http://localhost:3008/api/per-hour-data';
            limit = 24;
            break;
          default:
            throw new Error('Invalid data type');
        }

        const response = await fetch(`${url}?limit=${limit}`, { cache: 'no-cache' }); // Added no-cache
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to fetch ${dataType} data. Please try again later.`);
      }
    };

    fetchData();
  }, [dataType]); // Dependency array ensures this effect runs when dataType changes

  const getStackedBarData = () => {
    const processedData = {};
    data.forEach((item) => {
      Object.entries(item.LaneVehicleCounts).forEach(([lane, count]) => {
        if (!processedData[lane]) {
          processedData[lane] = [];
        }
        processedData[lane].push(count);
      });
    });
    return processedData;
  };

  const getStackedAreaData = () => {
    return {
      labels: data.map((item) => new Date(item.Timestamp * 1000).toLocaleString()),
      datasets: [
        {
          label: 'Vehicle Count',
          data: data.map((item) => item.TotalVehicles),
        },
        {
          label: 'Average Speed',
          data: data.map((item) => item.AverageSpeed),
        },
      ],
    };
  };

  const getPieChartData = () => {
    console.log(data); // Log the raw data to see what's different for per-minute and per-hour
    const vehicleTypeCounts = data.reduce((acc, item) => {
      const itemCounts = item.AggregatedVehicleTypeCounts || {};

      if (!Object.keys(itemCounts).length) {
        const vehicleTypeCounts = item.VehicleTypeCounts || {};
        Object.entries(vehicleTypeCounts).forEach(([type, count]) => {
          acc[type] = (acc[type] || 0) + count;
        });
      } else {
        Object.entries(itemCounts).forEach(([type, count]) => {
          acc[type] = (acc[type] || 0) + count;
        });
      }
      return acc;
    }, {});
    console.log(vehicleTypeCounts); // Log the processed data to compare
    return {
      labels: Object.keys(vehicleTypeCounts),
      datasets: [
        {
          data: Object.values(vehicleTypeCounts),
        },
      ],
    };
  };

  const getDensityData = () => {
    return data.map((item) => ({
      value: item.Density,
    }));
  };

  const getDataTypeDescription = () => {
    const descriptionStyle = {
      textAlign: 'center',
      color: 'white',
      fontSize: '18px',
      backgroundColor: '#4a4a4a',
      padding: '5px',
      borderRadius: '5px',
      margin: '10px 0',
    };

    let description = '';

    switch (dataType) {
      case 'per-second':
        description = 'Showing per-second data';
        break;
      case 'per-minute':
        description = 'Showing per-minute data';
        break;
      case 'per-5-minute':
        description = 'Showing per-5-minute data';
        break;
      case 'per-hour':
        description = 'Showing per-hour data';
        break;
      default:
        description = '';
    }

    return description ? <div style={descriptionStyle}>{description}</div> : null;
  };
  const handleDataTypeClick = (type) => {
    setDataType(type);
    setShowTable(false);
  };

  const handleTableClick = () => {
    setShowTable(!showTable);
  };

  return (
    <div className="GeneralSection">
      <h1>Historical Data Visualization</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => handleDataTypeClick('per-second')}>Per Second</button>
          <button onClick={() => handleDataTypeClick('per-minute')}>Per Minute</button>
          <button onClick={() => handleDataTypeClick('per-5-minute')}>Per 5 Minutes</button>
          <button onClick={() => handleDataTypeClick('per-hour')}>Per Hour</button>
        </div>
        <button onClick={handleTableClick}>{showTable ? 'Table' : 'Table'}</button>
      </div>
      {error && <p className="error">{error}</p>}
      {data.length > 0 && !error && !showTable && (
        <div className="container-fluid d-flex flex-column align-items-center">
          <div className="row row-cols-1 row-cols-md-2 g-3 w-100">
            {[
              //Stacked Area Chart: 
              { title: "Vehicle Count & Avg Speed vs. Time", description: "Depicts vehicle counts and average speed over time, highlighting temporal trends.", Component: StackedAreaHist, data: getStackedAreaData() },

              //Pie Chart
              {
                title: "Vehicle Type Count",
                description: "Breaks down vehicle counts by type, useful for spotting congestion.",
                Component: PieChartHist,
                data: getPieChartData(),
                key: `pie-chart-${dataType}-${new Date().getTime()}` // Force re-render by using a unique key
              },

              //Stacked Bar Chart
              { title: "Vehicle Count Per Lane", description: "Breaks down vehicle counts by lane, useful for spotting congestion.", Component: StackedBarHist, data: getStackedBarData() },

              //Density Chart
              { title: "Traffic Density vs Time", description: "Tracks the density of vehicles, a key indicator of traffic flow efficiency", Component: DensityHist, data: getDensityData() },

              //Heatmap
              { title: "Traffic Density", description: "Visualizes vehicle density over time, with color intensity reflecting density levels", Component: HeatMapHist, data: getDensityData() }
            ].map(({ title, description, Component, data, key }) => (
              <div className="col" key={key}>
                <div className="box">
                  <h2>{title}</h2>
                  <Component data={data} />
                  <p className="small-text">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showTable && (
        <div>
          <p>{getDataTypeDescription()}</p>
          <table style={{ border: '1px solid black', marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ fontSize: '12px', padding: '8px' }}>Timestamp</th>
                <th style={{ fontSize: '12px', padding: '8px' }}>Total Vehicles</th>
                <th style={{ fontSize: '12px', padding: '8px' }}>Average Speed</th>
                <th style={{ fontSize: '12px', padding: '8px' }}>Density</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontSize: '12px', padding: '8px' }}>{new Date(item.Timestamp * 1000).toLocaleString()}</td>
                  <td style={{ fontSize: '12px', padding: '8px' }}>{item.TotalVehicles}</td>
                  <td style={{ fontSize: '12px', padding: '8px' }}>{item.AverageSpeed}</td>
                  <td style={{ fontSize: '12px', padding: '8px' }}>{item.Density}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoricalGeneral;