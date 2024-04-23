import ReactEcharts from "echarts-for-react";
import React from "react";

const HeatMapHist = ({ data }) => {
  const xAxisData = data.map((_, index) => `Time ${index}`);
  const yAxisData = ['Density'];
  const seriesData = data.map((item, index) => [index, 0, item.value]);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const value = params.value;
        // Adjust the tooltip content as per your data structure and requirement
        return `Time: ${xAxisData[value[0]]}<br>Density: ${value[2]}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
    visualMap: {
      min: 0,
      max: Math.max(...seriesData.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      color: ['#d94e5d','#eac736','#50a3ba'], // Color gradient for the heatmap
    },
    series: [{
      name: 'Density',
      type: 'heatmap',
      data: seriesData,
      label: { show: false },
      itemStyle: {
        emphasis: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };

  return <ReactEcharts option={option} style={{ height: '400px', width: '100%' }} />;
};

export default HeatMapHist;
