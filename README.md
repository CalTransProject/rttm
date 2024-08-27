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

## Database Setup

This section provides a detailed guide for setting up the PostgreSQL database for the RTTM system.

### Prerequisites
- PostgreSQL 14.12 or higher (installed via Homebrew on macOS)
- Command line access
- User account with sudo privileges

### Steps

1. **Start PostgreSQL**
   Ensure your PostgreSQL server is running. On macOS with Homebrew installation, use:
   ```
   brew services start postgresql@14
   ```
   If it's already running and you need to restart:
   ```
   brew services restart postgresql@14
   ```

2. **Create the RTTM Database**
   Connect to PostgreSQL as the superuser. On macOS, this is typically your system username:
   ```
   psql postgres
   ```
   
   Once connected, create the RTTM database:
   ```sql
   CREATE DATABASE "RTTM";
   ```

3. **Create and Configure User**
   Still in the PostgreSQL prompt, create the 'jim2' user if it doesn't exist and grant necessary privileges:
   ```sql
   CREATE USER jim2 WITH PASSWORD 'rttm';
   ALTER USER jim2 WITH CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE "RTTM" TO jim2;
   ```

4. **Connect to the RTTM Database**
   Exit the current session and connect to the RTTM database as jim2:
   ```
   \q
   psql -U jim2 -h localhost -d RTTM
   ```
   Enter the password ('rttm') when prompted.

5. **Initialize Database Schema**
   Once connected to the RTTM database, run the initialization script:
   ```
   \i website/scriptsServer/init-db.sql
   ```
   Note: Ensure you're in the correct directory where the init-db.sql file is located, or provide the full path to the file.

6. **Verify Database Creation**
   After running the initialization script, you can verify the table creation:
   ```
   \dt
   ```
   This should display a list of tables including:
   - FramePrediction
   - HistoricalData
   - HistoricalData_LaneVehicleCount
   - HistoricalData_VehicleTypeCount
   - Lane
   - ModifiedVehicle
   - Real_Time_Traffic_Data
   - User
   - VehicleDetectionEvent
   - VehicleHistory
   - VehicleType
   - Weather

### Troubleshooting

- If you encounter permission issues, ensure the 'jim2' user has been created and granted appropriate permissions.
- If the init-db.sql file is not found, check your current directory and file path.
- For any connection issues, verify that PostgreSQL is running and that you're using the correct host, port, and credentials.

Remember to keep your database credentials secure and never commit them to version control.

##### Environment Preparation


1. Navigate to the website directory:

cd website

2. Execute scripts to set up the environment:

- Generate the initial data frame:

TO RUN IT use:
DB_NAME=RTTM DB_USER=jim2 DB_PASSWORD=rttm DB_HOST=localhost DB_PORT=5432 python3 "website/src/3DGenerateDataFrameMod.py"

- Populate the database:

Run python ProcessAggregatedData.py, then kill the terminal after 10 seconds

then ProcessPerSecondData.py when it's all done etc then ProcessPerMinuteData.py then ProcessPerHourData.py ProcessPerDayData.py then ProcessPerWeekData.py then ProcessPerMonthData.py then lastly ProcessPerYearData.py

After this is all done.

Go ahead and 'cd' to scriptsServer and run the server.js by using the command 'node server.js'

This will start the server to connect the database to the frontend.

And when you this is all done, go ahead and add another terminal and cd to website and run npm start. This will run the website. 

Note: `3DGenerateDataFrameMod.py` must be run before `ProcessAggregatedData.py`.

#### Running the Scripts/Datapoints Server
To start the scripts server which is to be done after running all the simulated data scripts do this:

1. Navigate to the server directory:
   ```
   cd website/scriptsServer
   ```

2. Install dependencies using Yarn:
   ```
   yarn add express dotenv bcrypt cors express-validator jsonwebtoken pg
   ```

3. Then do this:

```
   node server.js

```
Note: After running the scripts/datapoints server run the application

#### Running the Application

1. Clone the repo:

git clone https://github.com/CalTransProject/rttm.git

2. Install packages:
Make sure to run this command at the root
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