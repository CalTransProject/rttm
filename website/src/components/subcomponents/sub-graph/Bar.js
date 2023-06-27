import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";

const generateData = (lastItem, speedData) => {
  const num = Math.floor(Math.random() * 10);
  const newTime = lastItem.time + 1;
  const item = { time: newTime, speed: lastItem.speed };
  if (num < 6) {
    const num1 = Math.floor(Math.random() * 10);
    if (num1 % 2 === 0) {
      item.speed += 1;
    } else if (item.speed > 0) {
      item.speed -= 1;
    }
  }
  if (speedData.length === 60) {
    return [...speedData.slice(1), item];
  }
  return [...speedData, item];
};

const Bar = () => {
  const [speedData, setSpeedData] = useState([]);

  useEffect(() => {
    const initialData = {
      time: 0,
      speed: Math.floor(Math.random() * 90) + 10,
    };
    setSpeedData([initialData]);
    const interval = setInterval(() => {
      setSpeedData((speedData) => {
        const newData = generateData(speedData[speedData.length - 1], speedData);
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      data: Array.from({ length: 61 }, (_, i) => i.toString()),
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
