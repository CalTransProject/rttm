import React, { useState, useEffect } from "react";
import ReactEcharts from "react-echarts";
import { useQuery } from "react-query";
import { processDataToPerSecond, fetchHistoricalData } from ".//processDataToPerSecond";
import '../../styling/general.css';
import { time } from 'echarts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const HistoricalVisualization = () => {
    //const [data, setData] = useState([]); // setData(selectedDay) --> returns all day for all day -> convert t0 per second and remove line below ?
    //const [perSecondData, setPerSecondData] = useState([]);  // setPerSecondData(data)  ?
    //const [selectedFile, setSelectedFile] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);  //user sets dday to filter
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedInterval, setSelectedInterval] = useState(null); // Track time interval
    const [isLoading, setIsLoading] = useState(false); // Track loading state
    const [error, setError] = useState(null); // Track errors



    // get rawData which is the data to fetch
    // const { isLoading, error, data: rawData } = useQuery( //
    //     ['historicalData', selectedDay], // 
    //     fetchHistoricalData,
    //     {
    //         enabled: !!selectedDay, //only fetch when selectedDay is chosen
    //     }
    // );


    // ------------------------ 
    // for No0d1e testing purposes until get history_data endpoint or whatever platform, 
    //                                then uncomment all between /**  */ 

    // useEffect(() => {
    // }, [selectedDay]);

    // const chartData = {
    //     labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    //     datasets: [
    //         {
    //             label: "Speed",
    //             data: [12, 14, 16, 18, 20, 18, 16, 14, 12, 10],
    //             borderColor: "rgba(75, 192, 192, 1)",
    //             borderWidth: 2,
    //         },
    //     ],
    // };
    // ------------------------ 

    const timeIntervals = [
        { label: 'Per Second', value: 1 },
        { label: 'Per Minute', value: 60 },
        { label: 'Per Hour', value: 3600 },
    ];

    const { data: rawData } = useQuery(
        ["historicalData", selectedDate, selectedInterval],
        async () => {
            if (!selectedDate || selectedInterval) return;

            setIsLoading(true);
            setError(null);
            try {
                return await fetchHistoricalData(selectedDate.format("YYYY-MM-DD"), selectedInterval);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        },
        {
            enabled: !!selectedDate && !!selectedInterval, // fetch when both are set
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        }
    );

    // perSecondData = if rawData has been fetched, then processDataToPerSecond will process the data to per-second based on the selectedDay
    const perSecondData = rawData ? processDataToPerSecond(rawData, selectedDay) : [];


    // const chartData = {
    //     label: perSecondData.map((point) => point.time),
    //     datasets: [
    //         {
    //             label: "Speed",
    //             data: perSecondData.map((point) => point.speed),
    //             borderColor: "rgba(75, 192, 192, 1)",
    //             borderWidth: 2,
    //         },
    //     ],
    // };

    const chartOptions = {
        title: {
            text: 'Speed (m/s)',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            data: perSecondData.map((point) => point.time),
        },
        series: [
            {
                name: 'Speed',
                type: 'line',
                data: perSecondData.map((point) => point.speed),
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
            },
        ],
        yAxis: {
            type: 'value',
        },

    };

    return (
        <div>
            {/* Dropdown for user time interval
            <select onChange={(e) => setSelectedDay(e.target.value)}>
                <option value={null} />
            </select>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error {error.message}</p>
            ) : (
                <ReactEcharts option={chartOptions} />
                //<ReactEcharts option={chartData} /> */}
            {/* Date picker for selecting day */}
            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />

            {/* Dropdown for selecting time interval */}
            <select onChange={(e) => setSelectedInterval(parseInt(e.target.value))}>
                <option value={null}>Select Interval</option>
                {timeIntervals.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                        {interval.label}
                    </option>
                ))}
            </select>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <ReactEcharts option={chartOptions} />
            )}
        </div>
    );
};

export default HistoricalVisualization;
