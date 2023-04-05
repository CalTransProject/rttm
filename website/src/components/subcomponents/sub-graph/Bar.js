import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import initialSpeedData from "./bardata.js"
import mockData from "./barDataDy.js";

const Bar = () => {
  const [speedData, setSpeedData] = useState(initialSpeedData);

  const updateSpeedData = () => {
    const newData = mockData(speedData)
    setSpeedData([...newData])
  }
  useEffect(() => {
    const interval = setInterval(() => {
      return updateSpeedData()
    },1000);
    return () => clearInterval(interval);
  }, [speedData]);
  
  var option = {
    title: {
      text: "Average Speed Per Minute",
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
      data: speedData.map(item => item.time.toString()),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: ' ',
        data: speedData.map(item => item.speed),
        type: "bar",
      },
    ],
  };

  return <ReactEcharts option={option} />;
};

export default Bar;
