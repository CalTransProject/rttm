import ReactEcharts from "echarts-for-react"; 
import initialVehicleData from "./vehicleData";
import React, { useState, useEffect } from "react";
import mockData from "./StackedAreadata";

const StackedArea = () =>{
  const [vehicleData, setVehicleData] = useState(initialVehicleData);

  const updateVehicleData = () => {
    const newData = mockData(vehicleData)
    setVehicleData([...newData])
  }

  useEffect(() => {
    const interval = setInterval(() => {
      return updateVehicleData()
    },1000);
    return () => clearInterval(interval);
  }, [vehicleData]);


  const option = {
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data:["Car", "SUV", "Bus", "Pickup", "Truck", "Sedan"],
      textStyle: {
        color: "#fff"
      }
    },
    xAxis: {
      name:'Time',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
          fontSize:18,
          fontWeight:'bold'
      },
      axisLine:{
        lineStyle: {
          color: 'white'
        }
      },
      data: vehicleData.map(item => item.time.toString()),
    },
    yAxis: {
      name:'Number of Vehicles',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
          fontSize:18,
          fontWeight:'bold'
      },
      axisLine:{
        lineStyle: {
          color: 'white'
        }
      },
      nameRotate:90,
      type: "value"
  },
    series: [
      {
        name: 'Car',
        type: 'line',
        data: vehicleData.map(item => item.car),
      },
      {
        name: 'SUV',
        type: 'line',
        data: vehicleData.map(item => item.suv),
      },
      {
        name: 'Pickup',
        type: 'line',
        data: vehicleData.map(item => item.pickup),
      },
      {
        name: 'Truck',
        type: 'line',
        data: vehicleData.map(item => item.truck),
      },
      {
        name: 'Sedan',
        type: 'line',
        data: vehicleData.map(item => item.sedan),
      },
    ]
  };
return( <ReactEcharts option={option} />);
} 
export default StackedArea;