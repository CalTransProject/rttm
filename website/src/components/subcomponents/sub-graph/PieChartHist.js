import ReactEcharts from "echarts-for-react";
import React, { useEffect } from "react";

const PieChartHist = ({ data }) => {
  const formattedData = data.datasets[0].data.map((value, index) => ({
    value: value,
    name: data.labels[index]
  }));

  const total = formattedData.reduce((sum, curr) => sum + curr.value, 0);

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
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
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
      formatter: function (name) {
        const item = formattedData.find(item => item.name === name);
        if (item) {
          const percentage = ((item.value / total) * 100).toFixed(2); // Calculate percentage and fix to 2 decimal places
          return `${name} - ${percentage}%`;
        }
        return name;
      }
    },
    series: [
      {
        name: 'Vehicle Type',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: formattedData,
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
};

export default PieChartHist;
