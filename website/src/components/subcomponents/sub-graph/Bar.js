import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import initialSpeedData from "./bardata.js";
import mockData from "./barDataDy.js";

const Bar = () => {
  const [speedData, setSpeedData] = useState(initialSpeedData);
  const [count, setCount] = useState(0);

  const updateSpeedData = () => {
    const newData = mockData(speedData);
    setSpeedData([...newData]);
    setCount(count => count + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (count >= 50) {
        setSpeedData([...initialSpeedData]);
        setCount(0);
      } else {
        updateSpeedData();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [speedData, count]);

  var option = {
    title: {
      text: "Average Speed Per Second",
      textStyle: {
        color: "white",
      },
    },
    tooltip: {},
    legend: {
      data: [""],
    },
    xAxis: {
      name: "Time (Seconds)",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
      },
      axisLine: {
        lineStyle: {
          color: "white",
        },
      },
      data: speedData.map((item) => item.time.toString()),
    },
    yAxis: {
      type: "value",
      name: "Speed",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 18,
        fontWeight: "bold",
      },
    },
    series: [
      {
        name: "",
        data: speedData.map((item) => item.speed),
        type: "bar",
      },
    ],
    textStyle: {
      color: "#fff",
    },
  };

  return <ReactEcharts option={option} />;
};

export default Bar;
