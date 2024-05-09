import React, { useState, useEffect } from 'react';
import './styling/general.css';

import StackedArea from '../subcomponents/sub-graph/StackedAreaHist'; // Update & Modify file
import Bar from '../subcomponents/sub-graph/BarHist'; // Update & Modify file
import PieChart from '../subcomponents/sub-graph/PieChartMin'; // Shows PieChart per Min
import StackedBar from '../subcomponents/sub-graph/StackedBarHist'; // Update & Modify file
import Density from '../subcomponents/sub-graph/DensityHist'; // Update & Modify file


const HistoricalMin = () => {
    const [perMinData, setPerMinData] = useState([]);
    const [stackedAreaData, setStackedAreaData] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            try {
                const response = await fetch('http://localhost:3008/api/per-minute-data?limit=1');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPerMinData(data);
                setStackedAreaData(processStackedAreaData(data));
                setPieChartData(processPieChartData(data));
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch per-Min data. Please try again later.');
            }
        };
        fetchData();
    }, []);

    const processStackedAreaData = (data) => {
        return {
            labels: data.map((item) => new Date(item.Timestamp * 1000).toLocaleString()),
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
        <div className="GeneralMintion">
            <h1>Per Min Data</h1>
            {error && <p className="error">{error}</p>}
            {perMinData.length > 0 && stackedAreaData && pieChartData && !error && (
                <>
                    <StackedArea data={stackedAreaData} />
                    <Bar
                        data={perMinData.map((item) => ({
                            time: new Date(item.Timestamp * 1000).toLocaleString(),
                            speed: item.AverageSpeed,
                        }))}
                    />
                    <PieChart data={pieChartData} />
                    {perMinData.map((item, index) => (
                        <StackedBar data={item.LaneVehicleCounts} key={index} />
                    ))}
                    <Density
                        data={perMinData.map((item) => ({
                            value: item.Density,
                        }))}
                    />
                </>
            )}
        </div>
    );
};

export default HistoricalMin;