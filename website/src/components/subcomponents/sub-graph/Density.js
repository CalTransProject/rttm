import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import PropTypes from 'prop-types';

const Density = React.memo(({ data }) => {
  console.log("Density received data:", data);
  const option = useMemo(() => {
    const categories = ['Car', 'SUV', 'Pickup', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pedestrian'];
    const seriesData = categories.map(category => ({
      name: category,
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {},
      data: data.map(item => item[category.toLowerCase()])
    }));
    return {
      title: {
        text: 'Vehicle and Pedestrian Density Over Time',
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
        data: categories,
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
        axisLabel: {
          color: 'white',
          rotate: 45,
          interval: Math.floor(data.length / 10)
        }
      }],
      yAxis: [{
        type: 'value',
        axisLabel: { color: 'white' },
      }],
      series: seriesData
    };
  }, [data]);

  return <ReactEcharts option={option} style={{ height: '300px', width: '100%' }} />;
}, (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data));

Density.propTypes = {
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

Density.defaultProps = { data: [] };

export default Density;