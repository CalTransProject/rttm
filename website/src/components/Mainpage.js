import React, { useReducer, useEffect, useRef, useCallback } from "react";
import { MemoizedStackedArea, MemoizedBar, MemoizedPieChart, MemoizedStackedBar, MemoizedDensity } from "./MemoizedChartComponents";
import ErrorBoundary from "./ErrorBoundary";
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
  connectionStatus: 'disconnected', // Add connection status
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
        lidarPoints: action.payload.data || [],
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
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
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const debouncedDispatch = useCallback(
    debounce((action) => dispatch(action), 100),
    []
  );

  const setupWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8765');

      wsRef.current.onopen = () => {
        console.log('WebSocket Connected');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message type:', message.type);

          switch (message.type) {
            case 'lidar_data':
              if (message.data && Array.isArray(message.data)) {
                dispatch({ 
                  type: 'UPDATE_LIDAR', 
                  payload: message 
                });
                console.log(`Processed ${message.data.length / 3} LiDAR points`);
              }
              break;

            case 'frame':
              if (message.data) {
                const blob = new Blob([message.data], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                dispatch({ type: 'UPDATE_FRAME', payload: url });
              }
              break;

            case 'update':
              if (message.data) {
                debouncedDispatch({ 
                  type: 'UPDATE_DATA', 
                  payload: message.data 
                });
              }
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          setupWebSocket();
        }, 5000);
      };

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
    }
  }, [debouncedDispatch]);

  useEffect(() => {
    setupWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setupWebSocket]);

  const transformedData = transformData(state.vehicleData);

  // Connection status indicator styles
  const getConnectionStatusColor = () => {
    switch (state.connectionStatus) {
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
        <div className={`text-sm mb-2 ${getConnectionStatusColor()}`}>
          Status: {state.connectionStatus}
        </div>

        <div className="row row-cols-1 row-cols-md-2 gy-2 gx-2">
          <div className="col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h4
                className="camText gradient-label"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Camera 1 (LiDAR)
              </motion.h4>
              <ErrorBoundary>
                <LidarViewer 
                  points={state.lidarPoints}
                  title=""
                  height="400px"
                  showControls={true}
                />
              </ErrorBoundary>
            </motion.div>
          </div>

          <div className="col">
            <motion.h4
              className="camText gradient-label"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Camera 2 (2D)
            </motion.h4>
            <motion.div
              className="video-box"
              style={{ position: 'relative', overflow: 'hidden' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-3 gy-2 gx-2">
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