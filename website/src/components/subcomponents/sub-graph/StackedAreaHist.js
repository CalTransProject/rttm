import ReactEcharts from "echarts-for-react";
import React from "react";

const StackedArea = ({ data }) => {
  const option = {
    title: {
      text: 'Vehicle Count and Average Speed',
      textStyle: {
        color: 'white'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function (params) {
        return params.map(param => {
          return `${param.seriesName}: ${param.value}<br/>Time: ${param.axisValueLabel}`;
        }).join('');
      }
    },
    legend: {
      data: ['Vehicle Count', 'Average Speed'],
      textStyle: {
        color: "#ccc",
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.labels,
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Vehicle Count',
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          formatter: '{value}'
        },
      },
      {
        type: 'value',
        name: 'Average Speed',
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          formatter: '{value} km/h'
        },
      }
    ],
    series: data.datasets.map((dataset) => ({
      name: dataset.label,
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: dataset.data
    })),
    color: ['#83bff6', '#188df0', '#c4ccd3'],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  const chartStyle = {
    height: '225px',
    width: '100%',
  };

  return <ReactEcharts option={option} style={chartStyle} />;
};

export default StackedArea;
