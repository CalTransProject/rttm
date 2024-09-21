import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import PropTypes from 'prop-types';

const PieChart = React.memo(({ data }) => {
  console.log("PieChart received data:", data);
  const option = useMemo(() => ({
    title: {
      text: 'Current Vehicle and Pedestrian Distribution',
      textStyle: { color: 'white' },
      top: 0,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      data: ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'],
      textStyle: { color: "#fff" },
    },
    series: [{
      name: 'Distribution',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: { show: false },
      data: [
        { value: data.car || 0, name: 'Car' },
        { value: data.SUV || 0, name: 'SUV' },
        { value: data.pickup || 0, name: 'Pickup' },
        { value: data.truck || 0, name: 'Truck' },
        { value: data.van || 0, name: 'Van' },
        { value: data.bus || 0, name: 'Bus' },
        { value: data.motorcycle || 0, name: 'Motorcycle' },
        { value: data.pedestrian || 0, name: 'Pedestrian' }
      ]
    }]
  }), [data]);

  return <ReactEcharts option={option} style={{ height: '300px', width: '100%' }} />;
}, (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data));

PieChart.propTypes = {
  data: PropTypes.shape({
    car: PropTypes.number,
    SUV: PropTypes.number,
    pickup: PropTypes.number,
    truck: PropTypes.number,
    van: PropTypes.number,
    bus: PropTypes.number,
    motorcycle: PropTypes.number,
    pedestrian: PropTypes.number
  }).isRequired,
};

PieChart.defaultProps = { data: {} };

export default PieChart;