import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import data from "./data.js"

const Bar2 = () => {
  const [chartData, setChartData] = useState(data);
  const [xAxisData, setXAxisData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    // Update the xAxis and series data when chartData changes
    setXAxisData(chartData.map(item => item.hour));
    setSeriesData(chartData.map(item => item.speed));
  }, [chartData]);
  
  var option = {
    title: {
      text: "Speed",
      textStyle: {
        color: "white",
      },
    },
    tooltip: {},
    legend: {
      data: [''],
    },
    xAxis: {
      name: "Hour",
      nameTextStyle: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
      },
      axisLine: {
        lineStyle: {
          color: "white",
        },
      },
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: ' ',
        data: seriesData,
        type: "bar",
      },
    ],
  };

  return <ReactEcharts option={option} />;
};

export default Bar2;
