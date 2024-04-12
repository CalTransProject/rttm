import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './styling/general.css';

const HistoricalGeneral = () => {
    const fixedDates = [
        '2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01',
        '2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01',
        '2023-09-01', '2023-10-01', '2023-11-01', '2023-12-01'
    ];

    const [dates] = useState(fixedDates);
    const [selectedDate, setSelectedDate] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const buttonStyle = {
        cursor: 'pointer',
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        borderRadius: '5px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '10px 0'
    };

    const generateFakeData = () => {
        return dates.map(date => ({
            date,
            avgVehiclesPeak: Math.floor(Math.random() * 100 + 100),
            avgVehiclesLow: Math.floor(Math.random() * 100),
            avgSpeedPeak: Math.floor(Math.random() * 20 + 60),
            avgSpeedLow: Math.floor(Math.random() * 20 + 40),
            highestAvgVehiclePercent: Math.floor(Math.random() * 100),
            density: Math.floor(Math.random() * 1000)
        }));
    };

    const fakeData = generateFakeData();

    const handleDateSelect = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleDownload = () => {
        if (selectedDate) {
            const blob = new Blob([''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data_${selectedDate}.txt`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        }
    };

    const handleUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        axios.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            setUploadedFile(file);
            setUploadStatus('File uploaded successfully');
        })
        .catch(error => {
            setUploadStatus('Error uploading file');
        });
    };

    const handleView = (data) => {
        console.log('View data:', data);
    };

    const chartData = {
        labels: fakeData.map(data => data.date),
        datasets: [
            {
                label: 'Avg Vehicles Peak',
                data: fakeData.map(data => data.avgVehiclesPeak),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Avg Vehicles Low',
                data: fakeData.map(data => data.avgVehiclesLow),
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }
        ]
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className='GeneralSection'>
            <h3></h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                    <label htmlFor='date-select'>Select Date:</label>
                    <br />
                    <select id='date-select' onChange={handleDateSelect} style={{ width: '200px' }}>
                        <option value=''>Choose a date</option>
                        {dates.map((date, index) => (
                            <option key={index} value={date}>{date}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleDownload} style={buttonStyle}>Download</button>
                    <label htmlFor="upload-file" style={buttonStyle}>Upload Data</label>
                    <input
                        type="file"
                        id="upload-file"
                        accept=".json"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            {uploadStatus && <p>{uploadStatus}</p>}
            {/* Table */}
            <table style={{ border: '1px solid black', marginTop: '20px', borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    <tr>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Date</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Average Vehicles (Peak)</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Average Vehicles (Low)</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Average Speed (Peak)</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Average Speed (Low)</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Highest Average Vehicle %</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>Density</th>
                        <th style={{ fontSize: '12px', padding: '8px' }}>View Data</th>
                    </tr>
                    {fakeData.map((data, index) => (
                        <tr key={index}>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.date}</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.avgVehiclesPeak}</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.avgVehiclesLow}</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.avgSpeedPeak}</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.avgSpeedLow}</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.highestAvgVehiclePercent}%</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>{data.density}</td>
                            <td style={{ fontSize: '12px', padding: '8px' }}>
                                <button onClick={() => handleView(data)} style={{ padding: '5px 10px' }}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoricalGeneral;
