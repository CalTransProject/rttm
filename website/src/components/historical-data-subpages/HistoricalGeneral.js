import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedAreaHist from '../subcomponents/sub-graph/StackedAreaHist';
import PieChartHist from '../subcomponents/sub-graph/PieChartHist';
import StackedBarHist from '../subcomponents/sub-graph/StackedBarHist';
import DensityHist from '../subcomponents/sub-graph/DensityHist';
import HeatMapHist from '../subcomponents/sub-graph/HeatMapHist'; // Ensure the new component is imported

const HistoricalGeneral = () => {
  const [perSecondData, setPerSecondData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const response = await fetch('http://localhost:3008/api/per-second-data?limit=100');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPerSecondData(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch per-second data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  const getStackedBarData = () => {
    const data = {};
    perSecondData.forEach((item) => {
      Object.entries(item.LaneVehicleCounts).forEach(([lane, count]) => {
        if (!data[lane]) {
          data[lane] = [];
        }
        data[lane].push(count);
      });
    });
    return data;
  };

  const getStackedAreaData = () => {
    return {
      labels: perSecondData.map((item) => new Date(item.Timestamp * 1000).toLocaleString()),
      datasets: [
        {
          label: 'Vehicle Count',
          data: perSecondData.map((item) => item.TotalVehicles),
        },
        {
          label: 'Average Speed',
          data: perSecondData.map((item) => item.AverageSpeed),
        },
      ],
    };
  };

  const getPieChartData = () => {
    const vehicleTypeCounts = perSecondData.reduce((acc, item) => {
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
        },
      ],
    };
  };

  const getDensityData = () => {
    return perSecondData.map((item) => ({
      value: item.Density,
    }));
  };

  return (
    <div className="GeneralSection">
      <h1>Per Second Traffic Data Analysis</h1>
      {error && <p className="error">{error}</p>}
      {perSecondData.length > 0 && !error && (
        <div className="container-fluid d-flex flex-column align-items-center">
          <div className="row row-cols-1 row-cols-md-2 g-3 w-100">
            {/* Chart boxes with centered descriptions */}
            {[
              { title: "Stacked Area Chart", description: "Depicts vehicle counts and average speed over time, highlighting temporal trends.", Component: StackedAreaHist, data: getStackedAreaData() },
              { title: "Pie Chart", description: "Breaks down vehicle counts by lane, useful for spotting congestion.", Component: PieChartHist, data: getPieChartData() },
              { title: "Stacked Bar Chart", description: "Breaks down vehicle counts by lane, useful for spotting congestion.", Component: StackedBarHist, data: getStackedBarData() },
              { title: "Density Chart", description: "Tracks the density of vehicles, a key indicator of traffic flow efficiency", Component: DensityHist, data: getDensityData() },
              { title: "Heatmap", description: "Visualizes vehicle density over time, with color intensity reflecting density levels", Component: HeatMapHist, data: getDensityData() }
            ].map(({ title, description, Component, data }) => (
              <div className="col" key={title}>
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
    </div>
  );
};

export default HistoricalGeneral;