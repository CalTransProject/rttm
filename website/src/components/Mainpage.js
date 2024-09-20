import React, { useReducer, useEffect, useRef, useCallback } from "react";
import { MemoizedStackedArea, MemoizedBar, MemoizedPieChart, MemoizedStackedBar, MemoizedDensity } from "./MemoizedChartComponents";
import ErrorBoundary from "./ErrorBoundary";
import { io } from "socket.io-client";
import { debounce } from 'lodash';
import "./subcomponents/sub-graph/charts.css";
import "./subcomponents/sub-s3-components/videoPlayer.css";
import "../index.css";
import LidarViewer from './LidarViewer';

const initialState = {
  vehicleData: [],
  currentCounts: {},
  frameUrl: null,
  lidarPoints: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DATA':
      return {
        ...state,
        vehicleData: [...state.vehicleData, action.payload].slice(-60),
        currentCounts: action.payload.counts,
      };
    case 'UPDATE_FRAME':
      return {
        ...state,
        frameUrl: action.payload,
      };
    case 'UPDATE_LIDAR':
      return {
        ...state,
        lidarPoints: action.payload,
      };
    default:
      return state;
  }
}

const transformData = (rawData) => {
  return rawData.map(item => ({
    time: item.timestamp,
    ...item.counts
  }));
};

const Mainpage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);

  const debouncedDispatch = useCallback(
    debounce((action) => dispatch(action), 100),
    []
  );

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socketRef.current.on('update', (data) => {
      console.log('Received data:', data);
      const parsedData = JSON.parse(data);
      debouncedDispatch({ type: 'UPDATE_DATA', payload: parsedData });
    });

    socketRef.current.on('frame', (frameData) => {
      const blob = new Blob([frameData], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      dispatch({ type: 'UPDATE_FRAME', payload: url });
    });

    socketRef.current.on('lidar_data', (lidarData) => {
      dispatch({ type: 'UPDATE_LIDAR', payload: lidarData });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [debouncedDispatch]);

  const transformedData = transformData(state.vehicleData);

  console.log('Transformed data:', transformedData);

  return (
    <section>
      <div className="container-fluid">
        <div className="row row-cols-2">
          <div className="col">
            <h4 className="camText gradient-label">Camera 1 (3D LiDAR)</h4>
            <div className="video-box">
              <LidarViewer points={state.lidarPoints} />
            </div>
          </div>
          <div className="col">
            <h4 className="camText gradient-label">Camera 2 (2D)</h4>
            <div className="video-box" style={{ position: 'relative', overflow: 'hidden' }}>
              {state.frameUrl && (
                <img
                  src={state.frameUrl}
                  alt="webcam"
                  className="webcam-image"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="row row-cols-2 row-cols-xxl-3 gy-2 gx-2">
          <div className="col">
            <div className="box">
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedStackedArea data={transformedData} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedBar data={transformedData} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedPieChart data={state.currentCounts} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedStackedBar data={transformedData} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="box">
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedDensity data={transformedData} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mainpage;