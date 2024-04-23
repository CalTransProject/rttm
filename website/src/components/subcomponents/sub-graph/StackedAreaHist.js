import ReactEcharts from "echarts-for-react";
import React from "react";

const StackedAreaHist = ({ data }) => {
  const option = {
    title: {
      text: 'Vehicle Count and Average Speed Over Time',
      textStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
      },
      left: 'center',
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: function (params) {
        const date = new Date(params[0].axisValue);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        return `
          <div>
            <p><strong>Time:</strong> ${formattedDate}</p>
            ${params.map(param => `
              <p style="color: ${param.color};">
                <strong>${param.seriesName}:</strong> ${param.value}
              </p>
            `).join('')}
          </div>
        `;
      },
    },
    legend: {
      data: ['Vehicle Count', 'Average Speed'],
      textStyle: {
        color: "#ccc",
      },
      top: 60,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.labels,
      axisLine: {
        lineStyle: {
          color: '#ccc',
        },
      },
      axisLabel: {
        formatter: function (value) {
          const date = new Date(value);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
        rotate: 45,
        textStyle: {
          fontSize: 12,
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Vehicle Count',
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          formatter: '{value}',
        },
        splitLine: {
          lineStyle: {
            color: '#333',
          },
        },
      },
      {
        type: 'value',
        name: 'Average Speed (km/h)',
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          formatter: '{value}',
        },
        splitLine: {
          lineStyle: {
            color: '#333',
          },
        },
      },
    ],
    series: data.datasets.map((dataset) => ({
      name: dataset.label,
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: dataset.data,
    })),
    color: ['#83bff6', '#188df0', '#c4ccd3'],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
  };

  const chartStyle = {
    height: '400px',
    width: '100%',
  };

  return <ReactEcharts option={option} style={chartStyle} />;
};

export default StackedAreaHist;