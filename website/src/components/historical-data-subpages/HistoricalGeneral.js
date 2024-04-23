import React, { useState, useEffect } from 'react';
import './styling/general.css';
import StackedAreaHist from '../subcomponents/sub-graph/StackedAreaHist';
import BarHist from '../subcomponents/sub-graph/BarHist';
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
      <h1>Per Second Data</h1>
      {error && <p className="error">{error}</p>}
      {perSecondData.length > 0 && !error && (
        <div className="container-fluid">
          <div className="row row-cols-2">
            <div className="col">
              <div className="box">
                <div className="chart">
                  <StackedAreaHist data={getStackedAreaData()} />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="box">
                <div className="chart">
                  <PieChartHist data={getPieChartData()} />
                </div>
              </div>
            </div>
          </div>
          <div className="row row-cols-2">
            <div className="col">
              <div className="box">
                <div className="chart" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <StackedBarHist data={getStackedBarData()} />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="box">
                <div className="chart">
                  <DensityHist data={getDensityData()} />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="box">
                <div className="chart">
                  <HeatMapHist data={getDensityData()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalGeneral;
