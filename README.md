# Real-Time Traffic Monitoring (RTTM) System

## Table of Contents

- [About the Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Features](#features)
- [Contributing](#contributing)

## About the Project

Vehicle detection is crucial for analyzing traffic flow data to enhance planning in intelligent transportation systems. Machine Learning technology has increasingly been utilized for vehicle detection in both 2D real-time traffic flow videos and 3D point clouds. However, adverse weather conditions such as fog, rain, snow, extreme wind, and others pose challenges for 2D vehicle detection. 3D LiDAR point clouds offer more resistance to these conditions. While much research on 3D vehicle detection has focused on autonomous driving with LiDAR cameras on vehicles, there is a research gap in real-time vehicle detection for intelligent transportation with stationary LiDAR cameras on highways/freeways. This project aims to develop a system that collects real-time traffic flow data through 3D LiDAR cameras, processes the data for vehicle detection and classification, and provides a web-based service that enables real-time vehicle tracking, classification, and statistical traffic flow data visualization.

### Built With

- React
- Bootstrap

## Getting Started

### Prerequisites

- Node.js
- Firebase

### Installation

#### Quick Setup Guide

This guide is designed to help developers quickly set up their project environment and database. Ensure all prerequisites listed in the "Getting Started" section are completed before proceeding.

##### Prerequisites

- Python 3
- PostgreSQL
- Command line access

##### Database Setup

1. **Start PostgreSQL**: Ensure your PostgreSQL server is running. If not, start it using your system's service management tool.

2. **Connect to PostgreSQL**: Open your terminal and connect to your PostgreSQL database using the command:

psql -U jim2 -h localhost -d RTTM

Enter the password for `jim2` when prompted.

3. **Initialize Database**: At the PostgreSQL prompt, initialize the database schema with:

\i website/server/init-db.sql

##### Environment Preparation

1. Navigate to the website directory:

cd website

2. Execute scripts to set up the environment:

- Generate the initial data frame:

python 3DGenerateDataFrameMod.py

- Populate the database:

python ProcessHistoricalData.py

Note: `3DGenerateDataFrameMod.py` must be run before `ProcessHistoricalData.py`.

#### Running the Application

1. Clone the repo:

git clone https://github.com/CalTransProject/rttm.git

2. Install packages:

npm install

3. Navigate into the website directory:

cd website

4. Start the web server:

npm start

## Features

- Traffic Camera Management
- Real-Time Data Processing
- Predictive Traffic Analysis
- Historical Data Visualization
- User-friendly Interface and Responsive Design
- User Management
- Real-Time Traffic Notifications

## Contributing

Interested in contributing to the RTTM project? Here's how you can help:

1. Fork the Project

2. Create a feature branch:

git checkout -b feature/ANewFeature

3. Commit your changes:

git commit -m 'Added ANewFeature'

4. Push to the branch:

git push origin feature/ANewFeature

5. Open a Pull Request