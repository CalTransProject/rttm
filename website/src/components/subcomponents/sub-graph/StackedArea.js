import ReactEcharts from "echarts-for-react";
import React, { useState, useEffect } from "react";

const mockData = (lastItem) => {
  const categories = ["suv", "car", "bus", "pickup", "truck", "sedan"];
  const newItem = { time: lastItem.time + 1, suv: lastItem.suv, car: lastItem.car, bus: lastItem.bus, pickup: lastItem.pickup, truck: lastItem.truck, sedan: lastItem.sedan };
  const num = Math.floor(Math.random() * 10);

  if (num < 6) {
    const category = categories[num];
    const num1 = Math.floor(Math.random() * 10);

    if (num1 % 2 === 0) {
      newItem[category] += 1;
    } else if (newItem[category] > 0) {
      newItem[category] -= 1;
    }
  }

  return newItem;
};

const StackedArea = () => {
  const [vehicleData, setVehicleData] = useState([{ time: 0, suv: Math.floor(Math.random() * 10), car: Math.floor(Math.random() * 10), bus: Math.floor(Math.random() * 10), pickup: Math.floor(Math.random() * 10), truck: Math.floor(Math.random() * 10), sedan: Math.floor(Math.random() * 10) }]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleData(prevData => {
        const newData = [...prevData, mockData(prevData[prevData.length - 1])];
        return newData.slice(-60);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const option = {
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data: ["Car", "SUV", "Pickup", "Truck", "Sedan"],
      textStyle: {
        color: "#fff",
      },
    },
    xAxis: {
      name: 'Time (Seconds)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
      data: Array.from({ length: 61 }, (_, i) => i.toString()),
    },
    yAxis: {
      name: 'Number of Vehicles',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
      nameRotate: 90,
      type: "value",
      axisLabel: {
        formatter: '{value}'
      }
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

  const chartStyle = {
    height: '225px',
    width: '100%',
  };

  return <ReactEcharts option={option} style={chartStyle} />;
};

export default StackedArea;