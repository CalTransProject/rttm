import ReactEcharts from "echarts-for-react"; 
import initialVehicleData from "./vehicleData";
import React, { useState, useEffect } from "react";

const mockData = (initialData, count) => {
  const num = Math.floor(Math.random() * 10)
  const catagories = ["suv", "car", "bus", "pickup", "truck" , "sedan"]
  const lastItem = initialData.at(-1)
  const newTime = lastItem.time + 1 
  const item =  { time: newTime, suv: lastItem.suv, car: lastItem.car, bus: lastItem.bus, pickup: lastItem.pickup, truck: lastItem.truck, sedan: lastItem.sedan }
  if (num < 6) {
    const catagory = catagories[num]
    const num1 = Math.floor(Math.random() * 10)
    if (num1 % 2 === 0) {
      item[catagory] += 1
    }else if (item[catagory] > 0){
      item[catagory] -= 1
    }
  }

  const newData = [...initialData, item]
  console.log(newData)
  return newData
}

const StackedArea = () =>{
  const [vehicleData, setVehicleData] = useState(initialVehicleData);
  const [count, setCount] = useState(0);

  const updateVehicleData = () => {
    const newData = mockData(vehicleData)
    setVehicleData([...newData.slice(-60)])
    setCount(count + 1);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Working");
      if(count === 60){
      updateVehicleData()
      setCount(0);
      }
      return updateVehicleData()
    },1000);
    return () => clearInterval(interval);
  }, [vehicleData,count]);


  const option = {
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data:["Car", "SUV", "Bus", "Pickup", "Truck", "Sedan"],
      textStyle:{
        color: "#fff",
      },
    },

    xAxis: {
      name:'Time (Seconds)',
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
      data: vehicleData.slice(-60).map(item => item.time.toString()),
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
        data: vehicleData.slice(-60).map(item => item.car),
      },
      {
        name: 'SUV',
        type: 'line',
        data: vehicleData.slice(-60).map(item => item.suv),
      },
      {
        name: 'Pickup',
        type: 'line',
        data: vehicleData.slice(-60).map(item => item.pickup),
      },
      {
        name: 'Truck',
        type: 'line',
        data: vehicleData.slice(-60).map(item => item.truck),
      },
      {
        name: 'Sedan',
        type: 'line',
        data: vehicleData.slice(-60).map(item => item.sedan),
      },
    ]
  };
return( <ReactEcharts option={option} />);
} 
export default StackedArea;