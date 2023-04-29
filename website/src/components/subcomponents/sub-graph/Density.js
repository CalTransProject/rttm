import ReactEcharts from "echarts-for-react"; 
import React, { useState, useEffect } from "react";

const Density = () => {
    const[data , setData] = useState([]);
    const[time, setTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const newData = Math.floor(Math.random() * 10) + 1; 
            setData(data => [...data, newData]);
            setTime(time => time + 1); 
        }, 60000);
        const resetInterval = setInterval(() => {
            setData([]);
            setTime(0);
        }, 3600000);
        return () => {
            clearInterval(interval);
            clearInterval(resetInterval);
        };
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
            name: 'Time (Minutes)',
            nameLocation:'middle',
            nameGap:30,
            nameTextStyle:{
                fontSize:18,
                fontWeight:'bold'
            },
            min: 1,
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
                interval: 1,
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
                data: data.map((d , i) => [i + 1,d]),
                type: 'line'
            }
        ]
    };
    return <ReactEcharts option={option} />;
}

export default Density;
