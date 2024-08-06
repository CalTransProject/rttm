import React, { useState, useEffect } from 'react';
import './styling/general.css';
import ReactEcharts from "echarts-for-react";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const DataTypeSelector = ({ dataType, onDataTypeClick, onTableClick, showTable }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      {['per-day', 'per-week', 'per-month', 'per-year'].map((type) => (
        <button
          key={type}
          className={`button ${dataType === type ? 'button-active' : ''}`}
          onClick={() => onDataTypeClick(type)}
          style={{
            backgroundColor: getButtonColor(type),
            color: 'white',
            fontSize: '16px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
            transition: 'background-color 0.3s',
          }}
        >
          Past {type.split('-')[1].charAt(0).toUpperCase() + type.split('-')[1].slice(1)}
        </button>
      ))}
    </div>
    <button
      className={`button button-table ${showTable ? 'button-active' : ''}`}
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

const getButtonColor = (type) => {
  switch (type) {
    case 'per-day': return '#4CAF50';
    case 'per-week': return '#2196F3';
    case 'per-month': return '#FFC107';
    case 'per-year': return '#F44336';
    default: return '#4CAF50';
  }
};

const getStackedAreaData = (data, key) => ({
  labels: data.map((item) => new Date(item.Timestamp * 1000).toLocaleString()),
  datasets: [{
    label: key === 'TotalVehicles' ? 'Vehicle Count' : 'Average Speed',
    data: data.map((item) => item[key]),
  }], 
});

const getPieChartData = (data) => {
  const vehicleTypeCounts = data.reduce((acc, item) => {
    Object.entries(item.VehicleTypeCounts || {}).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + count;
    });
    return acc;
  }, {});

  return {
    labels: Object.keys(vehicleTypeCounts),
    datasets: [{ data: Object.values(vehicleTypeCounts) }]
  };
};

const getStackedBarData = (data, dataType) => {
  const processedData = {};
  
  data.forEach((item, index) => {
    let key;
    switch(dataType) {
      case 'per-day':
        key = `Day ${index + 1}`;
        break;
      case 'per-week':
        key = `Week ${index + 1}`;
        break;
      case 'per-month':
        key = `Day ${index + 1}`;
        break;
      case 'per-year':
        key = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index];
        break;
      default:
        key = `Day ${index + 1}`;
    }
    
    Object.entries(item.LaneVehicleCounts).forEach(([lane, count]) => {
      if (!processedData[lane]) {
        processedData[lane] = {};
      }
      processedData[lane][key] = count;
    });
  });
  
  return processedData;
};

const getDensityData = (data) =>
  data.map((item, index) => ({
    value: item.Density,
    time: new Date(item.Timestamp * 1000).toLocaleString(),
    index: index
  }));

const ChartBox = ({ title, description, Component, data, dataType, key }) => (
  <div className="col" key={key || title}>
    <div className="box" style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '15px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>{title}</h2>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Component data={data} dataType={dataType} />
      </div>
      <p className="small-text" style={{ marginTop: '10px', fontSize: '12px' }}>{description}</p> 
    </div>
  </div>
);

const TableDisplay = ({ data, dataType }) => {
  const downloadData = (format) => {
    const filename = `historical_data_${dataType}.${format}`;
    const tableData = data.map(item => ({
      Timestamp: new Date(item.Timestamp * 1000).toLocaleString(),
      TotalVehicles: item.TotalVehicles.toFixed(2),
      AverageSpeed: item.AverageSpeed.toFixed(2),
      Density: item.Density.toFixed(2)
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
        head: [['Timestamp', 'Total Vehicles', 'Average Speed', 'Density']],
        body: tableData.map(Object.values)
      });
      doc.save(filename);
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
        Showing data for the past {dataType.split('-')[1]}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => downloadData('csv')} style={{ marginRight: '10px' }}>Download CSV</button>
        <button onClick={() => downloadData('xlsx')} style={{ marginRight: '10px' }}>Download XLSX</button>
        <button onClick={() => downloadData('pdf')}>Download PDF</button>
      </div>
      <table style={{ border: '1px solid black', marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ fontSize: '12px', padding: '8px' }}>Timestamp</th>
            <th style={{ fontSize: '12px', padding: '8px' }}>Total Vehicles</th>
            <th style={{ fontSize: '12px', padding: '8px' }}>Average Speed</th>
            <th style={{ fontSize: '12px', padding: '8px' }}>Density</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ fontSize: '12px', padding: '8px' }}>{new Date(item.Timestamp * 1000).toLocaleString()}</td>
              <td style={{ fontSize: '12px', padding: '8px' }}>{item.TotalVehicles.toFixed(2)}</td>  
              <td style={{ fontSize: '12px', padding: '8px' }}>{item.AverageSpeed.toFixed(2)}</td>
              <td style={{ fontSize: '12px', padding: '8px' }}>{item.Density.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>  
  );
};

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
            url = 'http://localhost:3008/api/per-day-data';
            limit = 30; // 30 days
            break;
          case 'per-week':
            url = 'http://localhost:3008/api/per-week-data';
            limit = 52; // 52 weeks
            break;
          case 'per-month':
            url = 'http://localhost:3008/api/per-month-data';  
            limit = 30; // 30 days in a month
            break;
          case 'per-year':
            url = 'http://localhost:3008/api/per-year-data';
            limit = 12; // 12 months in a year
            break;
          default:
            throw new Error('Invalid data type');
        }

        const response = await fetch(`${url}?limit=${limit}`, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let fetchedData = await response.json();
        setData(fetchedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to fetch ${dataType} data. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType]);

  return { data, error, loading };
};

const StackedAreaHist = ({ data, dataType }) => {
  const getXAxisFormatter = (dataType) => {
    switch(dataType) {
      case 'per-day':
        return (value) => `Day ${new Date(value).getDate()}`;
      case 'per-week':
        return (value) => `Week ${Math.ceil((new Date(value).getDate()) / 7)}`;
      case 'per-month':
        return (value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'per-year':
        return (value) => new Date(value).toLocaleDateString([], { month: 'short' });
      default:
        return (value) => new Date(value).toLocaleString();
    }
  };

  const getXAxisInterval = (dataType) => {
    switch(dataType) {
      case 'per-day': return 1;
      case 'per-week': return 1;
      case 'per-month': return 3;
      case 'per-year': return 1;
      default: return 'auto';
    }
  };

  const option = {
    title: {
      text: data.datasets[0].label === 'Vehicle Count' ? 'Vehicle Count Over Time' : 'Average Speed Over Time',
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
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: function (params) {
        const date = new Date(params[0].axisValue);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        return `
          <div>
            <p><strong>Time:</strong> ${formattedDate}</p>
            ${params.map(param => `
              <p style="color: ${param.color};">
                <strong>${param.seriesName}:</strong> ${param.value}
              </p>
            `).join('')}
          </div>
        `;
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
        formatter: getXAxisFormatter(dataType),
        rotate: 45,
        textStyle: {
          fontSize: 10,
        },
        interval: getXAxisInterval(dataType),
        showMaxLabel: true,
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
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
  };

  return <ReactEcharts option={option} style={{ height: '400px', width: '100%' }} />;
};

const PieChartHist = ({ data }) => {
  const formattedData = data.datasets[0].data.map((value, index) => ({
    value: value,
    name: data.labels[index]
  }));
  const total = formattedData.reduce((sum, curr) => sum + curr.value, 0);
  const option = {
    title: {
      text: 'Percentage of Vehicles by Type',left: 'center',
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
      formatter: function (name) {
        const item = formattedData.find(item => item.name === name);
        if (item) {
          const percentage = ((item.value / total) * 100).toFixed(2);
          return `${name}: ${percentage}%`;
        }
        return name;
      }
    },
    series: [
      {
        name: 'Vehicle Type',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        data: formattedData,
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
  const lanes = Object.keys(data);
  const xAxisData = (() => {
    switch(dataType) {
      case 'per-day':
        return Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
      case 'per-week':
        return Array.from({length: 52}, (_, i) => `Week ${i + 1}`);
      case 'per-month':
        return Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
      case 'per-year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
    }
  })();

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
      formatter: function(params) {
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
        rotate: 45,
        interval: 0,
        fontSize: 10,
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
  const getXAxisData = () => {
    switch(dataType) {
      case 'per-day':
        return Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
      case 'per-week':
        return Array.from({length: 52}, (_, i) => `Week ${i + 1}`);
      case 'per-month':
        return Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
      case 'per-year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
    }
  };

  const xAxisData = getXAxisData();
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
        rotate: 45, 
        fontSize: 10,
        margin: 8
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

const HistoricalGeneral = () => {
  const [dataType, setDataType] = useState('per-day');
  const [showTable, setShowTable] = useState(false);
  const { data, error, loading } = useHistoricalData(dataType);

  const handleDataTypeClick = (type) => {
    setDataType(type);
    setShowTable(false);
  };

  const handleTableClick = () => {
    setShowTable(!showTable);  
  };

  return (
    <div className="GeneralSection">
      <h1>Historical Data</h1>
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
                description="Depicts vehicle counts over time, highlighting temporal trends. Use mouse wheel to zoom."
                Component={StackedAreaHist}
                data={getStackedAreaData(data, 'TotalVehicles')}
                dataType={dataType}
              />
              <ChartBox 
                title="Average Speed vs. Time"
                description="Shows average speed over time, useful for identifying traffic flow patterns. Use mouse wheel to zoom."
                Component={StackedAreaHist}
                data={getStackedAreaData(data, 'AverageSpeed')}
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
                data={getDensityData(data)}  
                dataType={dataType}
              />
            </div>
          </div>
        )  
      )}
    </div>
  );
};

export default HistoricalGeneral;