import React, { useReducer, useEffect, useRef, useCallback } from "react";
import { MemoizedStackedArea, MemoizedBar, MemoizedPieChart, MemoizedStackedBar, MemoizedDensity } from "./MemoizedChartComponents";
import ErrorBoundary from "./ErrorBoundary";
import { io } from "socket.io-client";
import { debounce } from 'lodash';
import "./subcomponents/sub-graph/charts.css";
import "./subcomponents/sub-s3-components/videoPlayer.css";
import "../index.css";
import { motion } from 'framer-motion';
import LidarViewer from './LidarViewer';

const initialState = {
  vehicleData: [],
  currentCounts: {},
  frameUrl: null,
  lidarPoints: [],
  lidarConnectionStatus: 'disconnected',
  socketioConnectionStatus: 'disconnected',
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
      if (state.frameUrl) {
        URL.revokeObjectURL(state.frameUrl);
      }
      return {
        ...state,
        frameUrl: action.payload,
      };
    case 'UPDATE_LIDAR':
      return {
        ...state,
        lidarPoints: action.payload.data || [],
      };
    case 'SET_SOCKETIO_STATUS':
      return {
        ...state,
        socketioConnectionStatus: action.payload,
      };
    case 'SET_LIDAR_STATUS':
      return {
        ...state,
        lidarConnectionStatus: action.payload,
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
  const socketioRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const debouncedDispatch = useCallback(
    debounce((action) => dispatch(action), 100),
    []
  );

  // Socket.IO setup for 2D camera and vehicle data
  useEffect(() => {
    socketioRef.current = io('http://localhost:5001', {
      transports: ['websocket'],
      cors: {
        origin: "*"
      }
    });

    socketioRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      dispatch({ type: 'SET_SOCKETIO_STATUS', payload: 'connected' });
    });

    socketioRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      dispatch({ type: 'SET_SOCKETIO_STATUS', payload: 'disconnected' });
    });

    socketioRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      dispatch({ type: 'SET_SOCKETIO_STATUS', payload: 'error' });
    });

    socketioRef.current.on('update', (data) => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        debouncedDispatch({ 
          type: 'UPDATE_DATA', 
          payload: parsedData 
        });
      } catch (error) {
        console.error('Error processing update data:', error);
      }
    });

    socketioRef.current.on('frame', (frameData) => {
      try {
        const blob = new Blob([frameData], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        dispatch({ type: 'UPDATE_FRAME', payload: url });
      } catch (error) {
        console.error('Error processing frame data:', error);
      }
    });

    return () => {
      if (socketioRef.current) {
        socketioRef.current.disconnect();
      }
      if (state.frameUrl) {
        URL.revokeObjectURL(state.frameUrl);
      }
    };
  }, [debouncedDispatch]);

  // WebSocket setup for LiDAR data
  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8765');

      wsRef.current.onopen = () => {
        console.log('Connected to LiDAR WebSocket');
        dispatch({ type: 'SET_LIDAR_STATUS', payload: 'connected' });
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onclose = () => {
        console.log('LiDAR WebSocket connection closed');
        dispatch({ type: 'SET_LIDAR_STATUS', payload: 'disconnected' });
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect to LiDAR...');
          connectWebSocket();
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('LiDAR WebSocket error:', error);
        dispatch({ type: 'SET_LIDAR_STATUS', payload: 'error' });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'lidar_data' && Array.isArray(message.data)) {
            dispatch({ 
              type: 'UPDATE_LIDAR',
              payload: message
            });
          }
        } catch (error) {
          console.error('Error processing LiDAR data:', error);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const transformedData = transformData(state.vehicleData);

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'error': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <section>
      <div className="container-fluid">
        {/* Connection Status */}
        <div className="flex gap-4 mb-2">
          <div className={`text-sm ${getConnectionStatusColor(state.socketioConnectionStatus)}`}>
            2D Camera Status: {state.socketioConnectionStatus}
          </div>
          <div className={`text-sm ${getConnectionStatusColor(state.lidarConnectionStatus)}`}>
            LiDAR Status: {state.lidarConnectionStatus}
          </div>
        </div>

        {/* Camera Views */}
        <div className="row row-cols-1 row-cols-md-2 gy-2 gx-2">
          {/* LiDAR Camera */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <motion.h4 className="camText gradient-label mb-2">
                Camera 1 (LiDAR)
              </motion.h4>
              <motion.div
                className="video-box"
                style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  height: '400px',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <ErrorBoundary>
                  <LidarViewer 
                    points={state.lidarPoints}
                    title=""
                    height="100%"
                    showControls={true}
                  />
                </ErrorBoundary>
              </motion.div>
            </motion.div>
          </div>

          {/* 2D Camera */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <motion.h4 className="camText gradient-label mb-2">
                Camera 2 (2D)
              </motion.h4>
              <motion.div
                className="video-box"
                style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  height: '400px',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px'
                }}
              >
                {state.frameUrl && (
                  <motion.img
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row row-cols-1 row-cols-md-3 gy-2 gx-2 mt-4">
          <div className="col">
            <motion.div
              className="box gradient-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedStackedArea data={transformedData} />
                </ErrorBoundary>
              </div>
            </motion.div>
          </div>

          <div className="col">
            <motion.div
              className="box gradient-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedBar data={transformedData} />
                </ErrorBoundary>
              </div>
            </motion.div>
          </div>

          <div className="col">
            <motion.div
              className="box gradient-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedPieChart data={state.currentCounts} />
                </ErrorBoundary>
              </div>
            </motion.div>
          </div>

          <div className="col">
            <motion.div
              className="box gradient-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedStackedBar data={transformedData} />
                </ErrorBoundary>
              </div>
            </motion.div>
          </div>

          <div className="col">
            <motion.div
              className="box gradient-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="chart">
                <ErrorBoundary>
                  <MemoizedDensity data={transformedData} />
                </ErrorBoundary>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mainpage;