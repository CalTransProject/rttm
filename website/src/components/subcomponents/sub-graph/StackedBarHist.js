import ReactEcharts from "echarts-for-react";
import React from "react";

const StackedBar = ({ data }) => {
  if (!data) {
    return <p>Data is loading...</p>;  // Display loading or error message if data is not available
  }

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `${params[0].axisValueLabel}<br/>${params.map(param => `${param.marker}${param.seriesName}: ${param.value}`).join('<br/>')}`;
      }
    },
    legend: {
      textStyle: {
        color: "#fff",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        color: "white",
      },
    },
    yAxis: {
      type: "category",
      data: Object.keys(data),
      axisLabel: {
        color: "white",
      },
    },
    series: Object.entries(data).map(([category, value]) => ({
      name: category,
      type: "bar",
      stack: "total",
      label: {
        show: true,
        color: "#fff",
      },
      emphasis: {
        focus: "series",
      },
      data: [value],  // Ensure the data is an array
    })),
  };

  const chartStyle = {
    height: "225px",
    width: "100%",
  };

  return (
    <ReactEcharts
      option={option}
      style={chartStyle}
      notMerge={true}  // This prop ensures that the chart does not merge with the previous state
      lazyUpdate={true}  // This prop ensures that the chart only updates when necessary
    />
  );
};

export default StackedBar;
