import ReactEcharts from "echarts-for-react"; 
import React, { useState, useEffect } from "react";

const Density = () => {
    const option = {
        title: {
            text: 'Density Chart',
            textStyle: {
                color: 'white'
            }

        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line'
            }
        ]
    };
    return <ReactEcharts option={option} />;
}

export default Density;
