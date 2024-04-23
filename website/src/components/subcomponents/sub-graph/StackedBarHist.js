import ReactEcharts from "echarts-for-react";
import React from "react";

const StackedBarHist = ({ data }) => {
  if (!data) {
    return <p>Data is loading...</p>; // Display loading or error message if data is not available
  }

  const option = {
    title: {
      text: 'Vehicle Counts by Lane',
      textStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
      },
      left: 'center',
      top: 1,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const lane = params[0].axisValue;
        const totalCount = params.reduce((sum, param) => sum + param.value, 0);
        return `
          <div>
            <p><strong>Lane:</strong> ${lane}</p>
            <p><strong>Total Vehicle Count:</strong> ${totalCount}</p>
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
      data: Object.keys(data).map(lane => `Vehicle Type - Lane ${lane}`),
      textStyle: {
        color: "#fff",
      },
      top: 40,
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: 'Vehicle Count',
      axisLabel: {
        color: "white",
      },
      splitLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    yAxis: {
      type: "category",
      data: Object.keys(data),
      axisLabel: {
        color: "white",
      },
    },
    series: Object.entries(data).map(([category, values]) => ({
      name: `Vehicle Type - Lane ${category}`,
      type: "bar",
      stack: "total",
      label: {
        show: true,
        color: "#fff",
        position: 'insideRight',
        formatter: '{c}',
      },
      emphasis: {
        focus: "series",
      },
      data: values,
    })),
    color: ['#83bff6', '#188df0', '#c4ccd3', '#32c5e9', '#7bd3f6'],
  };

  const chartStyle = {
    height: "400px",
    width: "100%",
  };

  return (
    <div className="chart-container" style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto" }}>
      <ReactEcharts
        option={option}
        style={chartStyle}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default StackedBarHist;