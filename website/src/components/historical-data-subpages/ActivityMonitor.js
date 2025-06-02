// ActivityMonitor.js
import React, { useState, useEffect, useCallback } from 'react';
import ReactEcharts from "echarts-for-react";
import { motion } from 'framer-motion';

// MemoryUsageChart component
const MemoryUsageChart = ({ data }) => {
  const option = {
    title: {
      text: 'ML Model Memory Usage',
      textStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
      },
      left: 'center',
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let tooltip = `Time: ${params[0].axisValue}<br/>`;
        params.forEach(param => {
          tooltip += `${param.seriesName}: ${param.value.toFixed(2)} MB<br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      data: ['Peak Memory', 'Average Memory', 'Current Memory'],
      textStyle: { color: 'white' },
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisLabel: { color: 'white', rotate: 45, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: 'Memory (MB)',
      nameTextStyle: { color: 'white' },
      axisLabel: { color: 'white' },
    },
    series: [
      {
        name: 'Peak Memory',
        data: data.map(item => item.peakMemory),
        type: 'line',
        smooth: true,
      },
      {
        name: 'Average Memory',
        data: data.map(item => item.averageMemory),
        type: 'line',
        smooth: true,
      },
      {
        name: 'Current Memory',
        data: data.map(item => item.currentMemory),
        type: 'line',
        smooth: true,
      }
    ],
    color: ['#FF6384', '#36A2EB', '#FFCE56'],
  };

  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
};

// ActivityMonitor component
const ActivityMonitor = () => {
  const [mlMemoryUsage, setMlMemoryUsage] = useState([]);

  const updateMlMemoryUsage = useCallback(() => {
    // Placeholder for real data fetching
    const newMemoryData = {
      time: new Date().toLocaleTimeString(),
      peakMemory: Math.random() * 1000,
      averageMemory: Math.random() * 800,
      currentMemory: Math.random() * 600
    };

    setMlMemoryUsage(prevData => [...prevData, newMemoryData].slice(-60));
  }, []);

  useEffect(() => {
    const memoryUpdateInterval = setInterval(updateMlMemoryUsage, 1000);
    return () => clearInterval(memoryUpdateInterval);
  }, [updateMlMemoryUsage]);

  return (
    <div className="ActivityMonitorSection">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Activity Monitor
      </motion.h1>
      <div className="container-fluid d-flex flex-column align-items-center">
        <div className="row row-cols-1 g-3 w-100">
          <div className="col">
            <motion.div
              className="box"
              style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '15px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>ML Model Memory Usage</h2>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <MemoryUsageChart data={mlMemoryUsage} />
              </div>
              <p className="small-text" style={{ marginTop: '10px', fontSize: '12px' }}>
                Shows the memory usage of the ML model over time.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitor;
