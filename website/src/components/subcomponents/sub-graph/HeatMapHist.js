import ReactEcharts from "echarts-for-react";
import React from "react";

const HeatMapHist = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.time - b.time);
  const processedData = sortedData.map((item) => {
    const date = new Date(item.time);
    return [date.getHours(), 0, item.value];
  });
  const xAxisData = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const yAxisData = ['Density'];
  const densityValues = processedData.map(item => item[2]);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);
  const meanDensity = densityValues.reduce((a, b) => a + b, 0) / densityValues.length;

  const option = {
    title: {
      text: 'Traffic Density Heatmap',
      left: 'center',
      top: 0,
      textStyle: { color: 'white', fontSize: 16 }
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `Time: ${params.name}<br>Density: ${params.data[2].toFixed(4)} vehicles/m²`;
      }
    },
    grid: {
      height: '50%',
      top: '15%',
      bottom: '35%',  // Increased to make room for x-axis labels and visualMap
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
        margin: 8  // Increased margin to push labels further from axis
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
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',  // Moved up to avoid overlap with x-axis labels
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      formatter: (value) => value.toFixed(4),
      textStyle: { color: 'white', fontSize: 10 }
    },
    series: [{
      name: 'Density',
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
      <div style={{ textAlign: 'center', fontSize: '9px', color: 'white', marginTop: '5px', lineHeight: '1.2' }}>
        <p>Density Categories: Very Low (0-0.1), Low (0.1-0.3), Medium (0.3-0.5), High (&gt;0.5) vehicles/m²</p>
        <p>Range: {minDensity.toFixed(4)} - {maxDensity.toFixed(4)} vehicles/m² (Mean: {meanDensity.toFixed(4)})</p>
        <p>Note: All values in "Very Low" category. Colors show relative differences.</p>
      </div>
    </div>
  );
};

export default HeatMapHist;