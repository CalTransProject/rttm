import React, { useState, useEffect, useCallback } from 'react';
import './styling/general.css';
import StackedArea from '../subcomponents/sub-graph/StackedAreaHist';
import Bar from '../subcomponents/sub-graph/BarHist';
import PieChart from '../subcomponents/sub-graph/PieChartMin';
import StackedBar from '../subcomponents/sub-graph/StackedBarHist';
import Density from '../subcomponents/sub-graph/DensityHist';

const HistoricalMin = () => {
    const [perMinData, setPerMinData] = useState([]);
    const [stackedAreaData, setStackedAreaData] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('1hour'); // Default to 1 hour

    const processStackedAreaData = useCallback((data) => {
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
    }, []);

    const processPieChartData = useCallback((data) => {
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
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3008/api/per-minute-data?timeRange=${timeRange}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPerMinData(data);
            setStackedAreaData(processStackedAreaData(data));
            setPieChartData(processPieChartData(data));
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch per-minute data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [timeRange, processStackedAreaData, processPieChartData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="HistoricalMin">
            <h1>Per Minute Data</h1>
            <select value={timeRange} onChange={handleTimeRangeChange}>
                <option value="1hour">Last 1 Hour</option>
                <option value="6hours">Last 6 Hours</option>
                <option value="24hours">Last 24 Hours</option>
            </select>
            {perMinData.length > 0 && stackedAreaData && pieChartData && (
                <>
                    <StackedArea data={stackedAreaData} />
                    <Bar
                        data={perMinData.map((item) => ({
                            time: new Date(item.Timestamp * 1000).toLocaleString(),
                            speed: item.AverageSpeed,
                        }))}
                    />
                    <PieChart data={pieChartData} />
                    <StackedBar data={perMinData[perMinData.length - 1].LaneVehicleCounts} />
                    <Density
                        data={perMinData.map((item) => ({
                            time: new Date(item.Timestamp * 1000).toLocaleString(),
                            value: item.Density,
                        }))}
                    />
                </>
            )}
        </div>
    );
};

export default HistoricalMin;