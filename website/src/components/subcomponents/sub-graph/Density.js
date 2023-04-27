import ReactEcharts from "echarts-for-react"; 
import React, { useState, useEffect } from "react";

const Density = () => {
    const[data , setData] = useState([]);
    const[time, setTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const newData = Math.floor(Math.random() * 10) + 1; // random data between 100 and 300
            setData(data => [...data, newData]); // add new data to the state
            setTime(time => time + 1); // increment time by 1 second
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
            min: 0,
            max: time,
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
            }
        },
        yAxis: {
            type: 'value',
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
            }
        },
        series: [
            {
                data: data.map((d , i) => [i,d]),
                type: 'line'
            }
        ]
    };
    return <ReactEcharts option={option} />;
}

export default Density;
