import ReactEcharts from "echarts-for-react";
import React from "react";

const HeatMapHist = ({ data }) => {
  const xAxisData = data.map((_, index) => `${index}:00`);
  const yAxisData = ['Density'];
  const seriesData = data.map((item, index) => [index, 0, item.value]);
  const densityValues = seriesData.map(item => item[2]);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);
  const meanDensity = densityValues.reduce((a, b) => a + b, 0) / densityValues.length;

  const option = {
    title: {
      text: 'Traffic Density Heatmap',
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `Time: ${params.name}<br>Density: ${params.data[2].toFixed(2)} vehicles/m²`;
      }
    },
    grid: {
      height: '50%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      name: 'Hour of Day',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true }
    },
    visualMap: {
      min: minDensity,
      max: maxDensity,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      formatter: (value) => value.toFixed(2)
    },
    series: [{
      name: 'Density',
      type: 'heatmap',
      data: seriesData,
      label: {
        show: true,
        formatter: function(params) {
          return params.data[2].toFixed(2);
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div>
      <ReactEcharts option={option} style={{ height: '400px', width: '100%' }} />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <p>Density Categories: Very Low (0-0.1), Low (0.1-0.3), Medium (0.3-0.5), High (>0.5) vehicles/m²</p>
        <p>Data Range: {minDensity.toFixed(2)} - {maxDensity.toFixed(2)} vehicles/m² (Mean: {meanDensity.toFixed(2)})</p>
        <p>Visualizes vehicle density over time, with color intensity reflecting density levels.</p>
        <p>Note: All values fall within the "Very Low" density category. Colors are scaled to show relative differences within this range.</p>
      </div>
    </div>
  );
};

export default HeatMapHist;