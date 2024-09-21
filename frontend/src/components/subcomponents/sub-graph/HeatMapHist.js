import ReactEcharts from "echarts-for-react";
import React from "react";

const HeatMapHist = ({ data }) => {
  // Process data to aggregate by hour
  const hourlyData = Array(24).fill(0).map(() => ({ count: 0, sum: 0 }));
  data.forEach(item => {
    const hour = new Date(item.time).getHours();
    hourlyData[hour].count++;
    hourlyData[hour].sum += item.value;
  });

  const processedData = hourlyData.map((item, hour) => [
    hour,
    0,
    item.count > 0 ? item.sum / item.count : 0
  ]);

  const xAxisData = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const yAxisData = ['Avg Density'];

  const densityValues = processedData.map(item => item[2]);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);

  const option = {
    title: {
      text: 'Average Hourly Traffic Density',
      left: 'center',
      top: 0,
      textStyle: { color: 'white', fontSize: 16 }
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `Time: ${params.name}<br>Avg Density: ${params.data[2].toFixed(4)} vehicles/m²`;
      }
    },
    grid: {
      height: '70%',  // Increased height
      top: '15%',
      bottom: '15%',  // Reduced bottom margin
      left: '10%',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      axisLabel: { 
        color: 'white', 
        rotate: 45, 
        fontSize: 10,
        margin: 8
      },
      axisLine: { lineStyle: { color: 'white' } }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true },
      axisLabel: { color: 'white' },
      axisLine: { lineStyle: { color: 'white' } }
    },
    visualMap: {
      min: minDensity,
      max: maxDensity,
      calculable: false,  // Disables the slider
      show: false,  // Hides the visualMap component
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    series: [{
      name: 'Avg Density',
      type: 'heatmap',
      data: processedData,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ReactEcharts option={option} style={{ flex: 1 }} />
    </div>
  );
};

export default HeatMapHist;