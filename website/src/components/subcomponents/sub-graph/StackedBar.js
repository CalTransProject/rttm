import React from "react";
import ReactEcharts from "echarts-for-react";

const StackedBar = ({ data }) => {
  // Assuming data includes lane information
  const lanes = ['Lane 1', 'Lane 2', 'Lane 3', 'Lane 4', 'Lane 5', 'Lane 6'];
  
  const option = {
    title: {
      text: 'Vehicle and Pedestrian Distribution by Lane',
      textStyle: {
        color: 'white'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'],
      textStyle: {
        color: 'white'
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: 'white'
      }
    },
    yAxis: {
      type: 'category',
      data: lanes,
      axisLabel: {
        color: 'white'
      }
    },
    series: [
      {
        name: 'Car',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_car`] || 0)
      },
      {
        name: 'SUV',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_SUV`] || 0)
      },
      {
        name: 'Pickup',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_pickup`] || 0)
      },
      {
        name: 'Truck',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_truck`] || 0)
      },
      {
        name: 'Van',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_van`] || 0)
      },
      {
        name: 'Bus',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_bus`] || 0)
      },
      {
        name: 'Motorcycle',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_motorcycle`] || 0)
      },
      {
        name: 'Pedestrian',
        type: 'bar',
        stack: 'total',
        data: lanes.map(lane => data[`${lane}_pedestrian`] || 0)
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '225px', width: '100%' }} />;
};

export default StackedBar;