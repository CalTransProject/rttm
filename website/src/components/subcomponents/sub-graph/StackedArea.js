import React from "react";
import ReactEcharts from "echarts-for-react";

const StackedArea = ({ data }) => {
  console.log("StackedArea received data:", data);  // Add this line for logging

  const option = {
    title: {
      text: 'Vehicle and Pedestrian Count Over Time',
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
      data: ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'],
      textStyle: {
        color: "#fff",
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.time),
        axisLabel: {
          color: 'white',
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: 'white',
        },
      }
    ],
    series: [
      {
        name: 'Car',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.car)
      },
      {
        name: 'SUV',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.SUV)
      },
      {
        name: 'Pickup',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.pickup)
      },
      {
        name: 'Truck',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.truck)
      },
      {
        name: 'Van',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.van)
      },
      {
        name: 'Bus',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.bus)
      },
      {
        name: 'Motorcycle',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.motorcycle)
      },
      {
        name: 'Pedestrian',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.pedestrian)
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '225px', width: '100%' }} />;
};

export default StackedArea;