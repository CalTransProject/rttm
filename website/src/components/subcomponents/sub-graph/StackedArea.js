import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import PropTypes from 'prop-types';

const StackedArea = React.memo(({ data }) => {
  console.log("StackedArea received data:", data);
  const option = useMemo(() => ({
    title: {
      text: 'Vehicle and Pedestrian Count Over Time',
      textStyle: { color: 'white' },
      top: 0,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' }
      }
    },
    legend: {
      data: ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'],
      textStyle: { color: "#fff" },
      top: 25
    },
    toolbox: {
      feature: { saveAsImage: {} }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.time),
      axisLabel: { color: 'white' },
    }],
    yAxis: [{
      type: 'value',
      axisLabel: { color: 'white' },
    }],
    series: [
      'Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'
    ].map(vehicle => ({
      name: vehicle,
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: { focus: 'series' },
      data: data.map(item => item[vehicle.toLowerCase()])
    }))
  }), [data]);

  return <ReactEcharts option={option} style={{ height: '300px', width: '100%' }} />;
}, (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data));

StackedArea.propTypes = {
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

StackedArea.defaultProps = { data: [] };

export default StackedArea;