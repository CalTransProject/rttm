import ReactEcharts from "echarts-for-react";
import React from "react";

const StackedBarHist = ({ data }) => {
  console.log("StackedBarHist received data:", JSON.stringify(data, null, 2));
  if (!data || Object.keys(data).length === 0) {
    return <p>No data available for the chart.</p>;
  }
  const lanes = Object.keys(data);
  const hours = [...Array(24).keys()];
  const series = lanes.map(lane => ({
    name: `Lane ${lane}`,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    data: hours.map(hour => data[lane][hour].Total || 0)
  }));
  const totalVehicles = series.reduce((sum, serie) => 
    sum + serie.data.reduce((laneSum, count) => laneSum + count, 0), 0);
  console.log("Total vehicles across all lanes:", totalVehicles);
  if (totalVehicles === 0) {
    return (
      <div>
        <p>No vehicle data available for the chart.</p>
        <p>Debug info:</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }
  const option = {
    title: {
      text: 'Hourly Vehicle Counts by Lane',
      textStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
      },
      left: 'center',
      top: 0,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        let tooltip = `<strong>Hour: ${params[0].axisValue}</strong><br/>`;
        let total = 0;
        params.forEach(param => {
          tooltip += `${param.seriesName}: ${param.value}<br/>`;
          total += param.value;
        });
        tooltip += `<strong>Total: ${total}</strong>`;
        return tooltip;
      }
    },
    legend: {
      data: lanes.map(lane => `Lane ${lane}`),
      textStyle: { color: "#fff" },
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
      top: 70,
    },
    xAxis: {
      type: 'category',
      data: hours.map(hour => `${hour.toString().padStart(2, '0')}:00`),
      axisLabel: {
        color: "white",
        rotate: 45,
        interval: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Vehicle Count',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: "white",
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLabel: { color: "white" },
      splitLine: { lineStyle: { color: '#333' } },
    },
    series: series,
    color: ['#83bff6', '#188df0', '#c4ccd3', '#32c5e9', '#7bd3f6'],
  };
  return (
    <ReactEcharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
};

export default StackedBarHist;