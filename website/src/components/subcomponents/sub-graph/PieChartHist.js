import ReactEcharts from "echarts-for-react";
import React from "react";

const PieChart = ({ data }) => {
  const option = {
    title: {
      text: 'Percentage of Vehicles by Type',
      left: 'center',
      textStyle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
      backgroundColor: 'rgba(50, 50, 50, 0.7)', // Semi-transparent dark background
      textStyle: {
        color: 'white'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: 'white'
      },
      formatter: name => {
        return `${name} - {d}%`;
      }
    },
    series: [
      {
        name: 'Vehicle Type',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: data.datasets[0].data.map((value, index) => ({
          value: value,
          name: data.labels[index],
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          color: 'white',
          formatter: '{b}: {d}%'
        },
        labelLine: {
          lineStyle: {
            color: 'white'
          }
        }
      }
    ],
    color: ['#FF6384', '#36A2EB', '#FFCE56', '#8B4513', '#32c5e9', '#7bd3f6', '#90ed7d', '#f7a35c', '#8085e9'] // Custom color palette
  };

  const chartStyle = {
    height: '400px', // Increased height for better visibility
    width: '100%'
  };

  return <ReactEcharts option={option} style={chartStyle} />;
}

export default PieChart;
