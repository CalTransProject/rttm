import React, { useState, useEffect } from "react";
import Echarts from "echarts-for-react";
import './styling/upload.css';

const HistDataViz = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:5432/PerHourData");
                if (!res.ok) {
                    throw new Error(res.statusText);
                }
                const jsonData = await res.json();
                setData(jsonData);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchData();
    }, []);

    const getOption = () => {
        return {
            title: {
                text: "Historical Data Visualization",
            },
            xAxis: {
                data: data.map(item => item.hour),
            },
            yAxis: {},
            series: [
                {
                    name: 'Average Speed',
                    type: 'bar',
                    data: data.map((point) => point.speed),
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                },]
        };
    };

    if (error) {
        return <div>Error:  {error}</div>;
    }

    return (
        <div className="historical-data-visualization">
            <h1>Data Report</h1>
            <Echarts option={getOption()} />
        </div>
    );
};

export default HistDataViz;

