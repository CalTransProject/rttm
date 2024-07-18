import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedAreaHist from '../subcomponents/sub-graph/StackedAreaHist';
import PieChartHist from '../subcomponents/sub-graph/PieChartHist';
import StackedBarHist from '../subcomponents/sub-graph/StackedBarHist';
import DensityHist from '../subcomponents/sub-graph/DensityHist';
import HeatMapHist from '../subcomponents/sub-graph/HeatMapHist';

const HistoricalGeneral = () => {
  const [dataType, setDataType] = useState('per-day');
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
          case 'per-day':
            url = 'http://localhost:3008/api/per-hour-data';
            limit = 24;
            break;
          case 'per-week':
            url = 'http://localhost:3008/api/per-hour-data';
            limit = 24 * 7;
            break;
          case 'per-month':
            url = 'http://localhost:3008/api/per-day-data';
            limit = 30;
            break;
          case 'per-year':
            url = 'http://localhost:3008/api/per-day-data';
            limit = 365;
            break;
          default:
            throw new Error('Invalid data type');
        }

        const response = await fetch(`${url}?limit=${limit}`, { cache: 'no-cache' });
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
  }, [dataType]);

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
    const vehicleTypeCounts = data.reduce((acc, item) => {
      if (item.AggregatedVehicleTypeCounts) {
        Object.entries(item.AggregatedVehicleTypeCounts).forEach(([type, count]) => {
          acc[type] = (acc[type] || 0) + count;
        });
      } else {
        const vehicleTypeCounts = item.VehicleTypeCounts || {};
        Object.entries(vehicleTypeCounts).forEach(([type, count]) => {
          acc[type] = (acc[type] || 0) + count;
        });
      }
      return acc;
    }, {});
  
    return {
      labels: Object.keys(vehicleTypeCounts),
      datasets: [{ data: Object.values(vehicleTypeCounts) }]
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
      backgroundColor: '#888',
      padding: '5px',
      borderRadius: '5px',
      margin: '10px 0',
    };

    switch (dataType) {
      case 'per-day':
        return <div style={descriptionStyle}>Showing data for the past day</div>;
      case 'per-week':
        return <div style={descriptionStyle}>Showing data for the past week</div>;
      case 'per-month':
        return <div style={descriptionStyle}>Showing data for the past month</div>;
      case 'per-year':
        return <div style={descriptionStyle}>Showing data for the past year</div>;
      default:
        return null;
    }
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
          <button
            className={`button ${dataType === 'per-day' ? 'button-active' : ''}`}
            onClick={() => handleDataTypeClick('per-day')}
          >
            Past Day
          </button>
          <button
            className={`button ${dataType === 'per-week' ? 'button-active' : ''}`}
            onClick={() => handleDataTypeClick('per-week')}
          >
            Past Week
          </button>
          <button
            className={`button ${dataType === 'per-month' ? 'button-active' : ''}`}
            onClick={() => handleDataTypeClick('per-month')}
          >
            Past Month
          </button>
          <button
            className={`button ${dataType === 'per-year' ? 'button-active' : ''}`}
            onClick={() => handleDataTypeClick('per-year')}
          >
            Past Year
          </button>
        </div>
        <button className="button button-table" onClick={handleTableClick}>
          {showTable ? 'Hide Table' : 'Show Table'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {data.length > 0 && !error && !showTable && (
        <div className="container-fluid d-flex flex-column align-items-center">
          {getDataTypeDescription()}
          <div className="row row-cols-1 row-cols-md-2 g-3 w-100">
            {[
              { title: "Vehicle Count & Avg Speed vs. Time", description: "Depicts vehicle counts and average speed over time, highlighting temporal trends.", Component: StackedAreaHist, data: getStackedAreaData() },
              { title: "Vehicle Type Distribution", description: "Breaks down vehicle counts by type, useful for spotting trends in vehicle composition.", Component: PieChartHist, data: getPieChartData(), key: `pie-chart-${dataType}-${new Date().getTime()}` },
              { title: "Vehicle Count Per Lane", description: "Breaks down vehicle counts by lane, useful for spotting congestion patterns.", Component: StackedBarHist, data: getStackedBarData() },
              { title: "Traffic Density vs Time", description: "Tracks the density of vehicles, a key indicator of traffic flow efficiency.", Component: DensityHist, data: getDensityData() },
              { title: "Traffic Density Heatmap", description: "Visualizes vehicle density over time, with color intensity reflecting density levels.", Component: HeatMapHist, data: getDensityData() }
            ].map(({ title, description, Component, data, key }) => (
              <div className="col" key={key || title}>
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
          {getDataTypeDescription()}
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