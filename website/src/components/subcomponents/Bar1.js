import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import data from "./data.js"

const Bar1 = () => {
  // const [data, setData] = useState([
  //   {"StreamId":"123","Time":"1675739000","Category":"car,car,car,truck"},
  //   {"StreamId":"123","Time":"1675739001","Category":"car,car"},
  //   {"StreamId":"123","Time":"1675739002","Category":"car,car,truck"},
  //   {"StreamId":"123","Time":"1675739003","Category":"car,car,car,truck"}
  // ]);
  const [chartData, setChartData] = useState(data);
  
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
      //data: data.speed,
      //data: ["10", "20", "30", "40"],
      //dataTextStyle: {
        //color: "White",
      //},
      data: data.map(item => item.hour),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: ' ',
        data: data.map(item => item.speed),
        type: "bar",
      },
    ],
  };

  return <ReactEcharts option={option} />;
};

export default Bar1;
