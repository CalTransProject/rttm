import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import data from "./bardata.js"

const Bar = () => {
  const [chartData, setChartData] = useState(data);
  const [xAxisData, setXAxisData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setXAxisData(chartData.map(item => item.hour));
      setSeriesData(chartData.map(item => item.speed));
    },1000);
    return () => clearInterval(interval);
  }, [chartData]);
  
  var option = {
    title: {
      text: "Average Speed Per Hour",
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

export default Bar;
