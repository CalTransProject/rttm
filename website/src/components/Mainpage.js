import React, { useReducer, useEffect, useRef, useCallback } from "react";
import { MemoizedStackedArea, MemoizedBar, MemoizedPieChart, MemoizedStackedBar, MemoizedDensity } from "./MemoizedChartComponents";
import ErrorBoundary from "./ErrorBoundary";
import { io } from "socket.io-client";
import { debounce } from 'lodash';
import "./subcomponents/sub-graph/charts.css";
import "./subcomponents/sub-s3-components/videoPlayer.css";
import "../index.css";
import { motion } from 'framer-motion';

const initialState = {
  vehicleData: [],
  currentCounts: {},
  frameUrl: null,
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
        <div className="row row-cols-1 row-cols-md-2 gy-2 gx-2">
          <div className="col">
            <motion.h4
              className="camText gradient-label"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Camera 1
            </motion.h4>
            <motion.div
              className="video-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Video content for Camera 1 */}
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
