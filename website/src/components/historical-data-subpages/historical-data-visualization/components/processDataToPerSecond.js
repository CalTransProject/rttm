// utility function to process per-frame data into per-second data
// based on time intervals assuming data points use the time properties
//import UnitManager from "unit-manager"

export const processDataToPerSecond = async (
    rawData,
    selectedDay,
    selectedInterval
) => {
    const processedData = [];
    const timeIntervals = [1, 5, 60]; // per second and per hour

    if (!selectedDay || selectedInterval) {
        return processedData;
    }

    const data = filterDataByDay(rawData, selectedDay);

    for (const timeInterval of timeIntervals) {
        const filteredData = filterDataByTimeInterval(data, timeInterval);

        if (filteredData.length === 0) {
            continue;
        }

        //Assuming .time is in attribute of per-frame data assuming unix timestamp (ms) * 1000 = 1 second
        const timeToPer =
            (filteredData[filteredData.length - 1].time -
                filteredData[0].time) *
            1000;

        const processedPoint = {
            time: timeInterval,
            numberOfVehles: filteredData.reduce(
                (sum, point) => sum + point.numberOfVehles,
                0
            ),
            speed:
                filteredData.reduce((sum, point) => sum + point.speed, 0) /
                filteredData.length, // Avg speed
            density: filteredData.length / timeToPer,
            vehicleByType: filteredData.reduce((acc, point) => {
                for (const type in point.vehicleByType) {
                    acc[type] = (acc[type || 0] || 0) + point.vehicleByType[type];
                }
                return acc;
            }, {}),
            vehicleByLane: filteredData.reduce((acc, point) => {
                for (const lane in point.vehicleByLane) {
                    acc[lane] = (acc[lane] || 0) + point.vehicleByLane[lane];
                }
                return acc;
            }, {}),
        };

        processedData.push(processedPoint);
    }

    //save data to history_data table assuming an API endpoint
    /*
    await axios.post('/api/history_data_endpoint', { processedData, selectedDay });
    */

    return processedData;
};

// Filters the raw data based on the selected day
function filterDataByDay(data, selectedDay) {
    return data.filter((point) => point.day === selectedDay.format("YYYY-MM-DD"));
}

// Filters the raw data based on the selected time interval
function filterDataByTimeInterval(data, timeInterval) {
    return data.filter((point) => point.time >= timeInterval && point.time < timeInterval + 1);
}

async function fetchHistoricalData(date, interval) {
    const response = await fetch(`/mockData/${date}_${interval}.json`);

    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }

    return response.json();
}

export default processDataToPerSecond;
export { fetchHistoricalData };