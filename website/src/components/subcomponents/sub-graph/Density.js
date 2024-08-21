import React from "react";
import ReactEcharts from "echarts-for-react";

const Density = ({ data }) => {
  const option = {
    title: {
      text: 'Vehicle and Pedestrian Density Over Time',
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
      }
    },
    legend: {
      data: ['Vehicles', 'Pedestrians'],
      textStyle: {
        color: 'white'
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.time),
      axisLabel: {
        color: 'white'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Count per km',
      axisLabel: {
        color: 'white'
      }
    },
    series: [
      {
        name: 'Vehicles',
        type: 'line',
        areaStyle: {},
        data: data.map(item => item.car + item.SUV + item.pickup + item.truck + item.van + item.bus + item.motorcycle)
      },
      {
        name: 'Pedestrians',
        type: 'line',
        areaStyle: {},
        data: data.map(item => item.pedestrian)
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '225px', width: '100%' }} />;
};

export default Density;