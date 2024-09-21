import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import PropTypes from 'prop-types';

const Bar = React.memo(({ data }) => {
  console.log("Bar received data:", data);
  
  const categories = ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'];
  
  const option = useMemo(() => ({
    title: {
      text: 'Current Vehicle and Pedestrian Count',
      textStyle: { color: 'white' },
      top: 0,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: 'white' },
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: 'white' },
    },
    series: [{
      name: 'Count',
      type: 'bar',
      data: categories.map(category => data[data.length - 1]?.[category.toLowerCase()] || 0),
      itemStyle: {
        color: '#3398DB'  // You can change this color to match your design
      }
    }]
  }), [data]);

  return <ReactEcharts option={option} style={{ height: '300px', width: '100%' }} />;
}, (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data));

Bar.propTypes = {
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

Bar.defaultProps = { data: [] };

export default Bar;