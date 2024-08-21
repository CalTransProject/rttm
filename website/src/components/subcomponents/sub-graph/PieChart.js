import React from "react";
import ReactEcharts from "echarts-for-react";

const PieChart = ({ data }) => {
  const option = {
    title: {
      text: 'Current Vehicle and Pedestrian Distribution',
      left: 'center',
      textStyle: {
        color: 'white'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: 'white'
      }
    },
    series: [
      {
        name: 'Type',
        type: 'pie',
        radius: '50%',
        data: [
          { value: data.car, name: 'Car' },
          { value: data.SUV, name: 'SUV' },
          { value: data.pickup, name: 'Pickup' },
          { value: data.truck, name: 'Truck' },
          { value: data.van, name: 'Van' },
          { value: data.bus, name: 'Bus' },
          { value: data.motorcycle, name: 'Motorcycle' },
          { value: data.pedestrian, name: 'Pedestrian' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '225px', width: '100%' }} />;
};

export default PieChart;