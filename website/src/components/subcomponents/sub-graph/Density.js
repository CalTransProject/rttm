import ReactEcharts from "echarts-for-react"; 
import React, { useState, useEffect } from "react";

const Density = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = Math.floor(Math.random() * 10) + 1;
      setData(data => {
        const updatedData = [...data, newData];
        if (updatedData.length > 60) {
          updatedData.shift();
        }
        return updatedData;
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);

  const option = {
    title: {
      text: 'Density Chart',
      textStyle: {
        color: 'white'
      }
    },
    xAxis: {
      type: 'value',
      name: 'Time (Seconds)',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
        fontSize:18,
        fontWeight:'bold'
      },
      min: 0,
      max: 60,
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
      axisTick: {
        lineStyle: {
          color: 'white'
        }
      },
      axisLabel: {
        textStyle: {
          color: 'white'
        }
      },
    },
    yAxis: {
      name: 'Density',
      type: 'value',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
        fontSize:18,
        fontWeight:'bold'
      },
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
      axisTick: {
        lineStyle: {
          color: 'white'
        }
      },
      axisLabel: {
        interval: 1,
        minInterval: 0,
        textStyle: {
        color: 'white'
        }
    }
    },
    series: [
    {
        data: data.map((d , i) => [i, d]),
        type: 'line'
    }
    ]
};
const chartStyle = {
  height: '225px', // Set the desired height
  width: '100%',   // Set the desired width
};


return <ReactEcharts option={option} style={chartStyle} />;
};

export default Density;
