import ReactEcharts from "echarts-for-react"; 
import initialPercentageData from "./PieChartData";
import React, { useState, useEffect } from "react";
import mockPercentageData from "./PieChartDataDy";

const PieChart = () =>{
  const [percentageData, setPercentageData] = useState(initialPercentageData);

  const updatePercentageData = () => {
    const newData = mockPercentageData(percentageData);
    setPercentageData([...newData])
  }

  useEffect(() => {
    const interval = setInterval(() => {
      return updatePercentageData()
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
        color: 'White'
      }
    },
    series: [
      {
        name: 'Vehicle Type',
        type: 'pie',
        radius: '50%',
        data: percentageData.map((value,index) => ({
          value
          //name: percentageData.labels[index]
        })),
        label: {
          formatter: '{b}: {d}%'
        }
      }
    ]
  };
return( <ReactEcharts option={option} />);
} 
export default PieChart;