import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Container, Skeleton } from "@mui/material";
//import { Video, Graph } from '../sub-s3-components';
import '../sub-s3-components/Graph.jsx';
import '../sub-s3-components/Video.jsx';
import { fetchDataset } from '../sub-s3-components/api.js';
import { getEntries, toGraphData } from '../sub-s3-components/Body.jsx';
//import { mockData, loadData } from '../../historical-data-subpages/historical-data-visualization/mockingData.js';
import '../sub-s3-components/videoPlayer.css';
//import '../Body.css';

function HistoricalDataVisualizationFilter() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndtDate] = useState(new Date());
    const [graphData, setGraphData] = useState(null);
    const [timeInterval, setTimeInterval] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); // ?? change this bc date picker?

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndtDate(end);
    };
    const handleTimeIntervalChange = (newTimeInterval) => {
        setTimeInterval(newTimeInterval);
    };

    const loadData = async (fileName, timeInterval, address) => {
        const data = await fetchDataset(timeInterval); // fetch value for getEnteries() and toGraphData() functions
        if (data) {
            const entries = getEntries(data);
            const graphData = toGraphData(entries);
            setGraphData(graphData);  // update graph data with entries
        }
    };

    //
    //const [streamId, setStreamId] = useState('0');
    //const [dataset, setDataset] = useState('{}');   
    //

    useEffect(() => {
        // TODO other filters other params , fileName, address ,...to loadDat() also
        loadData(timeInterval);
    }, [timeInterval]);

    // const handle other filters to load

    return (
        <div className="historical-data-visualization">
            <div className="time-interval-filters">
                <label>
                    Date Range:
                    <DatePicker
                        selectsRange
                        selected={[startDate, endDate]}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateRangeChange}
                    />
                </label>
                <label>
                    Time Interval:
                    <select value={timeInterval} onChange={(e) => handleTimeIntervalChange(e.target.value.split(',').map(Number))}>
                        <option value="0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23">All Hours</option>
                        <option value="0,1,2,3">Morning</option>
                        <option value="6,7,8,9,10,11">Afternoon</option>
                        <option value="12,13,14,15,16,17">Evening</option>
                        <option value="18,19,20,21,22,23">Night</option>
                    </select>
                </label>
            </div>
            <div className="graph-container">
                <label>
                    Graph:
                    {/* <Graph data={graphData} /> */}
                </label>
            </div>
            <div className="video-container">
                <label>
                    Video:
                </label>
                {/* <Video /> */}
            </div>
        </div>
    );
};

//export default HistoricalDataVisualization;



export default HistoricalDataVisualizationFilter;