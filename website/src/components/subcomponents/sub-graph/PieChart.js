import ReactEcharts from "echarts-for-react"; 
import initialPercentageData from "./PieChartData";
import React, { useState, useEffect } from "react";
import mockPercentageData from "./PieChartDataDy";
// import { color } from "echarts";

const PieChart = () =>{
  const [percentageData, setPercentageData] = useState(initialPercentageData);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = mockPercentageData(percentageData);
      setPercentageData([...newData]);
    },1000);
    return () => clearInterval(interval);
  }, [percentageData]);

  const option = {
    title: {
      text: 'Percentage of vehicles',
      left: 'center',
      textStyle:{
        color: 'white'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle:{
        color: 'white'
      }
    },
    series: [
      {
        name: 'Vehicle Type',
        type: 'pie',
        radius: '50%',
        data: percentageData,
          //name: percentageData.labels[index]),
        label: {
          formatter: '{b}: {d}%',
          color: "white",
          borderWidth: 0,
        }
      }
    ]
  };
  const chartStyle = {
    height: '225px', // Set the desired height
    width: '100%',   // Set the desired width
  };

  return <ReactEcharts option={option} style={chartStyle} />;
} 
export default PieChart;