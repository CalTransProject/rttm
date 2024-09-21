import ReactEcharts from "echarts-for-react";
import React from "react";

const DensityHist = ({ data }) => {
  const option = {
    title: {
      text: 'Density Over Time',
      left: 'center',
      textStyle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function (params) {
        return params.map(param => {
          return `${param.seriesName}<br/>${param.marker}Time: ${param.axisValueLabel} | Density: ${param.value}`;
        }).join('');
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((_, index) => `Time ${index}`), // Labeling each time point more clearly
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: 'white'
        }
      },
      axisLabel: {
        textStyle: {
          color: 'white'
        }
      },
    },
    yAxis: {
      name: 'Density (vehicles/km²)',
      type: 'value',
      nameLocation: 'end',
      nameTextStyle: {
        color: 'white',
        fontSize: 14
      },
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: 'white'
        }
      },
      axisLabel: {
        textStyle: {
          color: 'white'
        }
      }
    },
    series: [
      {
        name: 'Density',
        data: data.map((item) => item.value),
        type: 'line',
        smooth: true, // Adding smoothing to the line chart
        symbol: 'none', // Hides the symbol points
        areaStyle: {}, // Optional: add area style under the line
        lineStyle: {
          width: 2,
          color: '#36A2EB'  // Adding a custom color to the line
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  const chartStyle = {
    height: '300px', // Increased height for better visibility
    width: '100%'
  };

  return <ReactEcharts option={option} style={chartStyle} />;
};

export default DensityHist;
