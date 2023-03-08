import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import axios from 'axios';

var Bar1 = () => {
  var [data, setData] = useState([]);

  useEffect(() => {
    var fetchData = async () => {
      var response = await axios.get('./data.json');
      var jsonData = response.data;
      setData(jsonData);
    };
    fetchData();
  }, []);
  
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
      data: data.speed,
    },
    yAxis: {
      type: "value",
      data: data.speed,
    },
    series: [
      {
        name: ' ',
        data: data.speed,
        type: "bar",
      },
      {
      name: ' ',
      data: data.speed,
      type: "bar",
      }
    ],
  };

  return <ReactEcharts option={option} />;
};

export default Bar1;
