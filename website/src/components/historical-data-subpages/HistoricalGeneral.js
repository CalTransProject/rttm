// HistoricalGeneral.js
import React, { useState, useEffect } from 'react';
import './styling/general.css';
import ReactEcharts from "echarts-for-react";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { motion } from 'framer-motion'; // Import Framer Motion

// DataTypeSelector component
const DataTypeSelector = ({ dataType, onDataTypeClick, onTableClick, showTable }) => {
  const getButtonColor = (type) => {
    switch (type) {
      case 'per-day': return '#4CAF50';
      case 'per-week': return '#2196F3';
      case 'per-month': return '#FFC107';
      case 'per-year': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const buttonStyle = (type) => ({
    backgroundColor: dataType === type ? getButtonColor(type) : '#555',
    color: 'white',
    fontSize: '16px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'all 0.3s',
    boxShadow: dataType === type ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
    transform: dataType === type ? 'scale(1.05)' : 'scale(1)',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div>
        {['per-day', 'per-week', 'per-month', 'per-year'].map((type) => (
          <button
            key={type}
            onClick={() => onDataTypeClick(type)}
            style={buttonStyle(type)}
          >
            Past {type.split('-')[1].charAt(0).toUpperCase() + type.split('-')[1].slice(1)}
          </button>
        ))}
      </div>
      <button
        onClick={onTableClick}
        style={{
          backgroundColor: showTable ? '#888' : '#555',
          color: '#fff',
          fontSize: '16px',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
      >
        {showTable ? 'Hide Table' : 'Show Table'}
      </button>
    </div>
  );
};

// Helper functions
const getStackedAreaData = (data, key, dataType) => {
  console.log(`Processing ${key} data for ${dataType}:`, data);
  let labels;
  let processedData;

  switch (dataType) {
    case 'per-day':
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      processedData = data.slice(0, 24).map(item => parseFloat(item[key]) || 0);
      break;
    case 'per-week':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      processedData = data.slice(0, 7).map(item => parseFloat(item[key]) || 0);
      break;
    case 'per-month':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      processedData = data.slice(0, 4).map(item => parseFloat(item[key]) || 0);
      break;
    case 'per-year':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      processedData = data.slice(0, 12).map(item => parseFloat(item[key]) || 0);
      break;
    default:
      labels = data.map((_, index) => `Data ${index + 1}`);
      processedData = data.map(item => parseFloat(item[key]) || 0);
  }

  return {
    labels: labels,
    datasets: [{
      label: key === 'TotalVehicles' ? 'Vehicle Count' : 'Average Speed',
      data: processedData,
    }],
  };
};

const getPieChartData = (data) => {
  console.log('Processing pie chart data:', data);
  const vehicleTypeCounts = data.reduce((acc, item) => {
    Object.entries(item.VehicleTypeCounts || {}).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + parseFloat(count) || 0;
    });
    return acc;
  }, {});

  return {
    labels: Object.keys(vehicleTypeCounts),
    datasets: [{ data: Object.values(vehicleTypeCounts) }]
  };
};

const getStackedBarData = (data, dataType) => {
  console.log('Processing stacked bar data:', data);
  const processedData = {};
  let labels;

  switch (dataType) {
    case 'per-day':
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      break;
    case 'per-week':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      break;
    case 'per-month':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      break;
    case 'per-year':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      break;
    default:
      labels = data.map((_, index) => `Data ${index + 1}`);
  }

  data.forEach((item, index) => {
    if (index >= labels.length) return;

    Object.entries(item.LaneVehicleCounts || {}).forEach(([lane, count]) => {
      if (!processedData[lane]) {
        processedData[lane] = {};
      }
      processedData[lane][labels[index]] = parseFloat(count) || 0;
    });
  });

  return processedData;
};

const getDensityData = (data, dataType) => {
  console.log('Processing density data:', data);
  let labels;

  switch (dataType) {
    case 'per-day':
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      break;
    case 'per-week':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      break;
    case 'per-month':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      break;
    case 'per-year':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      break;
    default:
      labels = data.map((_, index) => `Data ${index + 1}`);
  }

  return data.slice(0, labels.length).map((item, index) => ({
    value: parseFloat(item.Density) || 0,
    time: labels[index],
    index: index
  }));
};

// ChartBox component with animation
const ChartBox = ({ title, description, Component, data, dataType, key }) => (
  <div className="col" key={key || title}>
    <motion.div
      className="box"
      style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '15px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>{title}</h2>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Component data={data} dataType={dataType} />
      </div>
      <p className="small-text" style={{ marginTop: '10px', fontSize: '12px' }}>{description}</p>
    </motion.div>
  </div>
);

// TableDisplay component
const TableDisplay = ({ data, dataType }) => {
  const downloadData = (format) => {
    const filename = `historical_data_${dataType}.${format}`;
    const tableData = data.map((item, index) => ({
      Time: getTimeLabel(index, dataType),
      TotalVehicles: parseFloat(item.TotalVehicles).toFixed(2),
      AverageSpeed: parseFloat(item.AverageSpeed).toFixed(2),
      Density: parseFloat(item.Density).toFixed(2)
    }));

    if (format === 'csv') {
      const csv = tableData.map(row => Object.values(row).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Historical Data");
      XLSX.writeFile(wb, filename);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.autoTable({
        head: [['Time', 'Total Vehicles', 'Average Speed', 'Density']],
        body: tableData.map(Object.values)
      });
      doc.save(filename);
    }
  };

  const getTimeLabel = (index, dataType) => {
    switch (dataType) {
      case 'per-day':
        return `${index}:00`;
      case 'per-week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
      case 'per-month':
        return `Week ${index + 1}`;
      case 'per-year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index];
      default:
        return `Data ${index + 1}`;
    }
  };

  return (
    <div>
      <div style={{
        textAlign: 'center',
        color: 'white',
        fontSize: '18px',
        backgroundColor: '#888',
        padding: '5px',
        borderRadius: '5px',
        margin: '10px 0',
      }}>
        Showing data for {dataType.split('-')[1]}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => downloadData('csv')} style={{ marginRight: '10px' }}>Download CSV</button>
        <button onClick={() => downloadData('xlsx')} style={{ marginRight: '10px' }}>Download XLSX</button>
        <button onClick={() => downloadData('pdf')}>Download PDF</button>
      </div>
      <table style={{ border: '1px solid black', marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ fontSize: '12px', padding: '8px' }}>Time</th>
            <th style={{ fontSize: '12px', padding: '8px' }}>Total Vehicles</th>
            <th style={{ fontSize: '12px', padding: '8px' }}>Average Speed</th>
            <th style={{ fontSize: '12px', padding: '8px' }}>Density</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ fontSize: '12px', padding: '8px' }}>{getTimeLabel(index, dataType)}</td>
              <td style={{ fontSize: '12px', padding: '8px' }}>{parseFloat(item.TotalVehicles).toFixed(2)}</td>
              <td style={{ fontSize: '12px', padding: '8px' }}>{parseFloat(item.AverageSpeed).toFixed(2)}</td>
              <td style={{ fontSize: '12px', padding: '8px' }}>{parseFloat(item.Density).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// useHistoricalData hook
const useHistoricalData = (dataType) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url;
        let limit;
        switch (dataType) {
          case 'per-day':
            url = 'http://localhost:3008/api/per-hour-data';
            limit = 24;
            break;
          case 'per-week':
            url = 'http://localhost:3008/api/per-day-data';
            limit = 7;
            break;
          case 'per-month':
            url = 'http://localhost:3008/api/per-week-data';
            limit = 4;
            break;
          case 'per-year':
            url = 'http://localhost:3008/api/per-month-data';
            limit = 12;
            break;
          default:
            throw new Error('Invalid data type');
        }

        console.log(`Fetching data from: ${url}`);
        const response = await fetch(`${url}?limit=${limit}`, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let fetchedData = await response.json();
        console.log('Fetched data:', fetchedData);

        if (!Array.isArray(fetchedData) || fetchedData.length === 0) {
          throw new Error('No data available for the selected period');
        }

        setData(fetchedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to fetch ${dataType} data. ${err.message}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType]);

  return { data, error, loading };
};

// Chart components
const StackedAreaHist = ({ data, dataType }) => {
  console.log('StackedAreaHist received data:', data);

  const option = {
    title: {
      text: data.datasets[0].label,
      textStyle: {
        color: 'white',
        fontSize: 18, fontWeight: 'bold',
      },
      left: 'center',
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: [data.datasets[0].label],
      textStyle: {
        color: "#ccc",
      },
      top: 60,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.labels,
      axisLine: {
        lineStyle: {
          color: '#ccc',
        },
      },
      axisLabel: {
        textStyle: {
          fontSize: 12,
        },
        interval: 0,
        rotate: dataType === 'per-day' ? 45 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: data.datasets[0].label,
      axisLine: {
        lineStyle: {
          color: '#ccc',
        },
      },
      axisLabel: {
        formatter: '{value}',
      },
      splitLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    series: data.datasets.map((dataset) => ({
      name: dataset.label,
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: dataset.data,
    })),
    color: ['#83bff6', '#188df0', '#c4ccd3'],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
  };

  return <ReactEcharts option={option} style={{ height: '400px', width: '100%' }} />;
};

const PieChartHist = ({ data }) => {
  console.log('PieChartHist received data:', data);

  const option = {
    title: {
      text: 'Percentage of Vehicles by Type',
      left: 'center',
      top: 0,
      textStyle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
      textStyle: {
        color: 'white'
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: {
        color: 'white',
        fontSize: 10
      },
    },
    series: [
      {
        name: 'Vehicle Type',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        data: data.labels.map((label, index) => ({
          value: data.datasets[0].data[index],
          name: label
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        }
      }
    ],
    color: ['#FF6384', '#36A2EB', '#FFCE56', '#8B4513', '#32c5e9', '#7bd3f6', '#90ed7d', '#f7a35c', '#8085e9']
  };
  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
};

const StackedBarHist = ({ data, dataType }) => {
  console.log('StackedBarHist received data:', data);

  const lanes = Object.keys(data);
  const xAxisData = Object.keys(data[lanes[0]]);

  const series = lanes.map(lane => ({
    name: `Lane ${lane}`,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    data: xAxisData.map(key => data[lane][key] || 0)
  }));

  const option = {
    title: {
      text: 'Vehicle Counts by Lane',
      textStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
      },
      left: 'center',
      top: 0,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
        let total = 0;
        params.forEach(param => {
          tooltip += `${param.seriesName}: ${param.value}<br/>`;
          total += param.value;
        });
        tooltip += `<strong>Total: ${total}</strong>`;
        return tooltip;
      }
    },
    legend: {
      data: lanes.map(lane => `Lane ${lane}`),
      textStyle: { color: "#fff" },
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
      top: 70,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: "white",
        fontSize: 12,
        rotate: dataType === 'per-day' ? 45 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Vehicle Count',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: "white",
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLabel: { color: "white" },
      splitLine: { lineStyle: { color: '#333' } },
    },
    series: series,
    color: ['#83bff6', '#188df0', '#c4ccd3', '#32c5e9', '#7bd3f6'],
  };
  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
};

const HeatMapHist = ({ data, dataType }) => {
  console.log('HeatMapHist received data:', data);

  const xAxisData = data.map(item => item.time);
  const yAxisData = ['Density'];
  const processedData = data.map((item, index) => [index, 0, item.value]);

  const densityValues = data.map(item => item.value);
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);
  const meanDensity = densityValues.reduce((a, b) => a + b, 0) / densityValues.length;

  const option = {
    title: {
      text: 'Traffic Density Heatmap',
      left: 'center',
      top: 0,
      textStyle: { color: 'white', fontSize: 16 }
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${xAxisData[params.data[0]]}<br>Density: ${params.data[2].toFixed(4)} vehicles/m²`;
      }
    },
    grid: {
      height: '50%',
      top: '15%',
      bottom: '35%',
      left: '10%',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      axisLabel: {
        color: 'white',
        fontSize: 12,
        margin: 8,
        rotate: dataType === 'per-day' ? 45 : 0,
      },
      axisLine: { lineStyle: { color: 'white' } }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true },
      axisLabel: { color: 'white' },
      axisLine: { lineStyle: { color: 'white' } }
    },
    visualMap: {
      min: minDensity,
      max: maxDensity,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      formatter: (value) => value.toFixed(4),
      textStyle: { color: 'white', fontSize: 10 }
    },
    series: [{
      name: 'Density',
      type: 'heatmap',
      data: processedData,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ReactEcharts option={option} style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', fontSize: '9px', color: 'white', marginTop: '5px', lineHeight: '1.2' }}>
        <p>Density Categories: Very Low (0-0.1), Low (0.1-0.3), Medium (0.3-0.5), High (&gt;0.5) vehicles/m²</p>
        <p>Range: {minDensity.toFixed(4)} - {maxDensity.toFixed(4)} vehicles/m² (Mean: {meanDensity.toFixed(4)})</p>
        <p>Note: Colors show relative differences in density.</p>
      </div>
    </div>
  );
};

// PerformanceMetricsDisplay component
const PerformanceMetricsDisplay = ({ performanceMetrics }) => (
  <div style={{ color: 'white', fontSize: '14px', marginTop: '10px' }}>
    <p>Real-time Performance Metrics:</p>
    <ul>
      <li>Processing Time per Frame: {performanceMetrics.processingTimePerFrame.toFixed(2)} ms</li>
      <li>Latency: {performanceMetrics.latency.toFixed(2)} ms</li>
      <li>Frames Processed per Second: {performanceMetrics.framesPerSecond.toFixed(2)}</li>
      <li>Model Inference Time: {performanceMetrics.modelInferenceTime.toFixed(2)} ms</li>
    </ul>
  </div>
);

// HistoricalGeneral component
const HistoricalGeneral = () => {
  const [dataType, setDataType] = useState('per-day');
  const [showTable, setShowTable] = useState(false);
  const { data, error, loading } = useHistoricalData(dataType);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    processingTimePerFrame: 0,
    latency: 0,
    framesPerSecond: 0,
    modelInferenceTime: 0
  });

  const handleDataTypeClick = (type) => {
    setDataType(type);
    setShowTable(false);
  };

  const handleTableClick = () => {
    setShowTable(!showTable);
  };

  return (
    <div className="GeneralSection">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Historical Data
      </motion.h1>
      <DataTypeSelector
        dataType={dataType}
        onDataTypeClick={handleDataTypeClick}
        onTableClick={handleTableClick}
        showTable={showTable}
      />
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && data.length > 0 && !error && (
        showTable ? (
          <TableDisplay data={data} dataType={dataType} />
        ) : (
          <div className="container-fluid d-flex flex-column align-items-center">
            <div className="row row-cols-1 row-cols-md-2 g-3 w-100">
              <ChartBox
                title="Vehicle Count vs. Time"
                description="Depicts vehicle counts over time, highlighting temporal trends."
                Component={StackedAreaHist}
                data={getStackedAreaData(data, 'TotalVehicles', dataType)}
                dataType={dataType}
              />
              <ChartBox
                title="Average Speed vs. Time"
                description="Shows average speed over time, useful for identifying traffic flow patterns."
                Component={StackedAreaHist}
                data={getStackedAreaData(data, 'AverageSpeed', dataType)}
                dataType={dataType}
              />
              <ChartBox
                title="Vehicle Type Distribution"
                description="Breaks down vehicle counts by type, useful for spotting trends in vehicle composition."
                Component={PieChartHist}
                data={getPieChartData(data)}
                dataType={dataType}
              />
              <ChartBox
                title="Vehicle Count Per Lane"
                description="Breaks down vehicle counts by lane, useful for spotting congestion patterns."
                Component={StackedBarHist}
                data={getStackedBarData(data, dataType)}
                dataType={dataType}
              />
              <ChartBox
                title="Traffic Density Heatmap"
                description="Visualizes vehicle density over time and space, with color intensity reflecting density levels."
                Component={HeatMapHist}
                data={getDensityData(data, dataType)}
                dataType={dataType}
              />
            </div>
            <PerformanceMetricsDisplay performanceMetrics={performanceMetrics} />
          </div>
        )
      )}
    </div>
  );
};

export default HistoricalGeneral;
