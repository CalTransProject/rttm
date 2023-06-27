import ReactEcharts from "echarts-for-react"; 
import React, { useState, useEffect } from "react";

const StackedBar = () => {
    const [data, setData] = useState({
        car: [],
        suv:[],
        pickup: [],
        truck: [],
        sedan: [],
    });

    useEffect(() => {
      const interval = setInterval(() => {
        setData({
            car: generateRandomValues(),
            suv: generateRandomValues(),
            pickup: generateRandomValues(),
            truck: generateRandomValues(),
            sedan: generateRandomValues(),
        });
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);
    const generateRandomValues = () => {
        return [      Math.floor(Math.random() * 5),      Math.floor(Math.random() * 5),      Math.floor(Math.random() * 5),      Math.floor(Math.random() * 5),      Math.floor(Math.random() * 5),      Math.floor(Math.random() * 5)    ];
      };



    const option = {
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
        },
        },
        legend: {      
            textStyle: {
                color: "#fff"
          }
        },
        grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
        },
        xAxis: {
        type: 'value',
        axisLabel: {
            color: 'white' // add this line to set the color of the y-axis labels to white
          }
        },
        yAxis: {
        type: 'category',
        data: ['Lane 1', 'Lane 2', 'Lane 3', 'Lane 4', 'Lane 5', 'Lane 6'],
        axisLabel: {
            color: 'white' // add this line to set the color of the y-axis labels to white
          }
        },
        series: [
        {
            name: 'Car',
            type: 'bar',
            stack: 'total',
            label: {
            show: true,  
            color: '#fff',
            },
            textStyle: {
                color: 'white',
            },
            emphasis: {
            focus: 'series'
            },
            data: data.car
        },
        {
            name: 'SUV',
            type: 'bar',
            stack: 'total',
            label: {
            show: true
            },
            textStyle: {
                color: 'white'
            },
            emphasis: {
            focus: 'series'
            },
            data: data.suv
        },
        {
            name: 'Pickup',
            type: 'bar',
            stack: 'total',
            label: {
            show: true
            },
            textStyle: {
                color: 'white',
            },
            emphasis: {
            focus: 'series'
            },
            data: data.pickup
        },
        {
            name: 'Truck',
            type: 'bar',
            stack: 'total',
            label: {
            show: true
            },
            textStyle: {
                color: 'white',
            },
            emphasis: {
            focus: 'series'
            },
            data: data.truck
        },
        {
            name: 'Sedan',
            type: 'bar',
            stack: 'total',
            label: {
            show: true
            },
            textStyle: {
                color: 'white',
            },
            emphasis: {
            focus: 'series'
            },
            data: data.sedan
        }
        ]
    };
  return <ReactEcharts option={option} />;
}
export default StackedBar;