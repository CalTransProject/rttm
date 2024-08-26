import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import PropTypes from 'prop-types';

const StackedBar = React.memo(({ data }) => {
  console.log("StackedBar received data:", data);
  const option = useMemo(() => ({
    title: {
      text: 'Vehicle and Pedestrian Count Over Time (Stacked)',
      textStyle: { color: 'white' },
      top: 0,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'],
      textStyle: { color: "#fff" },
      top: 25
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisLabel: {
        color: 'white',
        rotate: 45,
        interval: Math.floor(data.length / 10)
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'white' },
    },
    series: [
      'Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'
    ].map(vehicle => ({
      name: vehicle,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: data.map(item => item[vehicle.toLowerCase()])
    }))
  }), [data]);

  return <ReactEcharts option={option} style={{ height: '300px', width: '100%' }} />;
}, (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data));

StackedBar.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.string,
    car: PropTypes.number,
    SUV: PropTypes.number,
    pickup: PropTypes.number,
    truck: PropTypes.number,
    van: PropTypes.number,
    bus: PropTypes.number,
    motorcycle: PropTypes.number,
    pedestrian: PropTypes.number
  })).isRequired,
};

StackedBar.defaultProps = { data: [] };

export default StackedBar;