import ReactEcharts from "echarts-for-react";
import React from "react";

const HeatMapHist = ({ data }) => {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `Time: ${params.value[0]}<br>Density: ${params.value[2]}`;
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
        data: data.map((_, index) => `Time ${index}`),
        splitArea: {
          show: true
        },
        axisLabel: {
          show: false // Hide the axis labels
        },
        axisTick: {
          show: false // Hide the axis ticks
        }
      },
      yAxis: {
        type: 'category',
        data: [], // Removing the dummy category
        splitArea: {
          show: true
        },
        axisLabel: {
          show: false // Hide the axis labels
        },
        axisTick: {
          show: false // Hide the axis ticks
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(item => item.value)), // Using actual data range
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        color: ['#d94e5d','#eac736','#50a3ba'], // Example color range
      },
      series: [{
        name: 'Density',
        type: 'heatmap',
        data: data.map((item, index) => [index, 0, item.value]),
        label: {
          show: false // Hide the labels in the cells
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  
    return <ReactEcharts option={option} style={{ height: '400px', width: '100%' }} />;
};

export default HeatMapHist;
