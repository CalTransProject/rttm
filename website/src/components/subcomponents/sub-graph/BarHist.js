// Bar.js
import React from "react";
import ReactEcharts from "echarts-for-react";

const BarHist = ({ data }) => {
  const option = {
    title: {
      text: "Average Speed Per hour",
      textStyle: {
        color: "white",
      },
    },
    tooltip: {},
    legend: {
      data: [""],
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.time),
      axisLine: {
        lineStyle: {
          color: "white",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Speed",
      axisLine: {
        lineStyle: {
          color: "white",
        },
      },
      axisLabel: {
        textStyle: {
          color: "white",
        },
      },
    },
    series: [
      {
        name: "",
        data: data.map((item) => item.speed),
        type: "bar",
      },
    ],
    textStyle: {
      color: "#fff",
    },
  };

  const chartStyle = {
    height: '225px',
    width: '100%',
  };

  return <ReactEcharts option={option} style={chartStyle} />;
};

export default BarHist;