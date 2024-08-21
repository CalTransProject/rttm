import React from "react";
import ReactEcharts from "echarts-for-react";

const Bar = ({ data }) => {
  // Calculate average speed for each vehicle type
  const averageSpeeds = {
    car: data.reduce((sum, item) => sum + item.car_speed, 0) / data.length,
    SUV: data.reduce((sum, item) => sum + item.SUV_speed, 0) / data.length,
    pickup: data.reduce((sum, item) => sum + item.pickup_speed, 0) / data.length,
    truck: data.reduce((sum, item) => sum + item.truck_speed, 0) / data.length,
    sedan: data.reduce((sum, item) => sum + item.sedan_speed, 0) / data.length,
  };

  const option = {
    title: {
      text: 'Average Speed by Vehicle Type',
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
    xAxis: {
      type: 'category',
      data: ['Car', 'SUV', 'Pickup', 'Truck', 'Sedan'],
      axisLabel: {
        color: 'white',
      },
    },
    yAxis: {
      type: 'value',
      name: 'Speed (km/h)',
      axisLabel: {
        color: 'white',
      },
    },
    series: [{
      data: [
        averageSpeeds.car,
        averageSpeeds.SUV,
        averageSpeeds.pickup,
        averageSpeeds.truck,
        averageSpeeds.sedan
      ],
      type: 'bar'
    }]
  };

  return <ReactEcharts option={option} style={{ height: '225px', width: '100%' }} />;
};

export default Bar;