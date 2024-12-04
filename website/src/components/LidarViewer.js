import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import ErrorBoundary from './ErrorBoundary';
import './lidarViewer.css';

const VEHICLE_COLORS = {
    car: 0x00ff00,      // Green
    truck: 0xff0000,    // Red
    bus: 0x0000ff,      // Blue
    motorcycle: 0xffff00 // Yellow
};

const CameraController = ({ onZoomChange }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const initialDistance = 1;
    const direction = new THREE.Vector3(1, 1, 1).normalize();
    
    camera.up.set(0, 0, 1);
    camera.position.copy(direction.multiplyScalar(initialDistance));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    const distance = camera.position.length();
    const minDist = 1;
    const maxDist = 100;
    const percentage = Math.round(((maxDist - distance) / (maxDist - minDist)) * 100);
    onZoomChange(Math.max(0, Math.min(100, percentage)));
  });

  return (
    <OrbitControls
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      panSpeed={0.8}
      minDistance={1}
      maxDistance={100}
      maxPolarAngle={Math.PI * 0.85}
      target={new THREE.Vector3(0, 0, 0)}
    />
  );
};

const CustomGrid = () => {
  const gridSize = 120;
  const divisions = 120;
  
  return (
    <group>
      <gridHelper 
        args={[gridSize, divisions, '#404080', '#202040']}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <gridHelper 
        args={[gridSize, divisions, '#404080', '#202040']}
      />
      <gridHelper 
        args={[gridSize, divisions, '#404080', '#202040']}
        rotation={[0, Math.PI / 2, 0]}
      />
      
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(40, 0, 0)]
        }} />
        <lineBasicMaterial attach="material" color="#FF2222" linewidth={3} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 40, 0)]
        }} />
        <lineBasicMaterial attach="material" color="#22FF22" linewidth={3} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 40)]
        }} />
        <lineBasicMaterial attach="material" color="#2222FF" linewidth={3} />
      </line>
    </group>
  );
};

const LidarPointCloud = ({ points, size = 0.02, intensityFactor = 2.0, vehicles }) => {
  const meshRef = useRef();
  const maxPoints = 1000000; 
  const gridSize = 0.05; 

  const [processedPoints, setProcessedPoints] = useState([]);
  const [spatialIndex, setSpatialIndex] = useState(new Map());

  useEffect(() => {
    if (!points || points.length === 0) return;

    const newSpatialIndex = new Map();
    const newProcessedPoints = [];

    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      const cellX = Math.floor(x / gridSize);
      const cellY = Math.floor(y / gridSize);
      const cellZ = Math.floor(z / gridSize);
      const cellKey = `${cellX},${cellY},${cellZ}`;

      if (!newSpatialIndex.has(cellKey)) {
        newSpatialIndex.set(cellKey, newProcessedPoints.length / 3);
        newProcessedPoints.push(x, y, z);
      }
    }

    if (newProcessedPoints.length > maxPoints * 3) {
      const stride = Math.ceil(newProcessedPoints.length / (maxPoints * 3));
      const filteredPoints = newProcessedPoints.filter((_, index) => index % stride === 0);

      const rebuiltSpatialIndex = new Map();
      for (let i = 0; i < filteredPoints.length; i += 3) {
        const x = filteredPoints[i];
        const y = filteredPoints[i + 1];
        const z = filteredPoints[i + 2];
        const cellX = Math.floor(x / gridSize);
        const cellY = Math.floor(y / gridSize);
        const cellZ = Math.floor(z / gridSize);
        const cellKey = `${cellX},${cellY},${cellZ}`;
        rebuiltSpatialIndex.set(cellKey, i / 3);
      }

      setSpatialIndex(rebuiltSpatialIndex);
      setProcessedPoints(filteredPoints);
    } else {
      setSpatialIndex(newSpatialIndex);
      setProcessedPoints(newProcessedPoints);
    }
  }, [points, gridSize, maxPoints]);

  const colors = useMemo(() => {
    if (!processedPoints || processedPoints.length === 0) return null;

    const colorArray = new Float32Array(processedPoints.length);

    for (let i = 0; i < processedPoints.length; i += 3) {
      const x = processedPoints[i];
      const y = processedPoints[i + 1];
      const z = processedPoints[i + 2];
      
      const distance = Math.sqrt(x * x + y * y + z * z);
      const height = z; 
      const normalizedDistance = Math.min(distance / 150, 1);
      const distanceFactor = Math.pow(1 - normalizedDistance, 0.5) * intensityFactor;
      
      if (height < -2) {
        colorArray[i] = 0;
        colorArray[i + 1] = 0;
        colorArray[i + 2] = 0.7 * distanceFactor;
      } else if (height < -0.5) {
        const t = (height + 2) / 1.5;
        colorArray[i] = 0;
        colorArray[i + 1] = 0.5 * t * distanceFactor;
        colorArray[i + 2] = (0.7 + 0.3 * t) * distanceFactor;
      } else if (height < 1) {
        const t = (height + 0.5) / 1.5;
        colorArray[i] = 0.2 * t * distanceFactor;
        colorArray[i + 1] = (0.5 + 0.3 * t) * distanceFactor;
        colorArray[i + 2] = (1.0 - 0.2 * t) * distanceFactor;
      } else if (height < 3) {
        const t = (height - 1) / 2;
        colorArray[i] = (0.2 + 0.3 * t) * distanceFactor;
        colorArray[i + 1] = (0.8 + 0.2 * t) * distanceFactor;
        colorArray[i + 2] = (0.8 - 0.4 * t) * distanceFactor;
      } else {
        const t = Math.min((height - 3) / 2, 1);
        colorArray[i] = (0.5 + 0.5 * t) * distanceFactor;
        colorArray[i + 1] = 1.0 * distanceFactor;
        colorArray[i + 2] = (0.4 - 0.4 * t) * distanceFactor;
      }
    }
    return colorArray;
  }, [processedPoints, intensityFactor]);

  useEffect(() => {
    if (meshRef.current && processedPoints.length > 0) {
      const geometry = meshRef.current.geometry;
      const positions = new Float32Array(processedPoints);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      if (colors) {
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  }, [processedPoints, colors]);

  return (
    <group>
      <points ref={meshRef}>
        <bufferGeometry />
        <pointsMaterial 
          size={size}
          vertexColors
          sizeAttenuation={true}
          transparent={false}
          opacity={1}
          depthWrite={true}
          blending={THREE.NoBlending}
          toneMapped={false}
        />
      </points>
      {vehicles && vehicles.map((vehicle, index) => (
        <group key={index}>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attachObject={['attributes', 'position']}
                count={vehicle.points.length / 3}
                itemSize={3}
                array={new Float32Array(vehicle.points)}
              />
            </bufferGeometry>
            <pointsMaterial 
              size={size * 2}
              vertexColors={false}
              sizeAttenuation={true}
              transparent={false}
              opacity={1}
              depthWrite={true}
              blending={THREE.NoBlending}
              toneMapped={false}
              color={VEHICLE_COLORS[vehicle.type] || 0xffffff}
            />
          </points>
          {vehicle.speed && vehicle.direction && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attachObject={['attributes', 'position']}
                  count={2}
                  itemSize={3}
                  array={new Float32Array([
                    vehicle.position[0],
                    vehicle.position[1],
                    vehicle.position[2],
                    vehicle.position[0] + vehicle.direction[0] * vehicle.speed / 10,
                    vehicle.position[1] + vehicle.direction[1] * vehicle.speed / 10,
                    vehicle.position[2] + vehicle.direction[2] * vehicle.speed / 10
                  ])}
                />
              </bufferGeometry>
              <lineBasicMaterial 
                color={0xffff00}
                linewidth={3}
              />
            </line>
          )}
        </group>
      ))}
    </group>
  );
};

const LidarViewer = ({ points = [], title = "", height = "100%" }) => {
  const [showStats, setShowStats] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [intensityFactor, setIntensityFactor] = useState(2.0);
  const [pointSize, setPointSize] = useState(0.02);
  const [showMenu, setShowMenu] = useState(false);
  const [vehicles, setVehicles] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(points);

  const canvasContainerStyle = {
    position: 'relative',
    width: '100%',
    height: showMenu ? 'calc(100% - 180px)' : 'calc(100% - 60px)',
    backgroundColor: '#000033',
    borderRadius: '8px',
    overflow: 'hidden'
  };
  
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:8765');
      
      ws.onopen = () => {
        console.log('Connected to LiDAR WebSocket');
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from LiDAR WebSocket');
        // Try to reconnect after 2 seconds
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = (error) => {
        console.error('LiDAR WebSocket error:', error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!isPaused) {
            if (data.points) {
              setCurrentPoints(data.points);
            }
            if (data.vehicles) {
              setVehicles(data.vehicles);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isPaused]);

  return (
    <div className="lidar-viewer" style={{ height, display: 'flex', flexDirection: 'column' }}>
      <div className="lidar-header">
        <h2 className="lidar-title">{title || "LiDAR Visualization"}</h2>
        <div className="lidar-controls">
          <span className="point-count" role="status" aria-live="polite">
            Points: {Math.floor(currentPoints.length / 3).toLocaleString()}
          </span>
          <button 
            className="settings-button" 
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle settings menu"
            aria-expanded={showMenu}
          >
            
          </button>
        </div>
      </div>
      
      {showMenu && (
        <div className="controls-menu" role="menu">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            aria-pressed={isPaused}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => setShowStats(!showStats)}
            aria-pressed={showStats}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button 
            onClick={() => setShowGrid(!showGrid)}
            aria-pressed={showGrid}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          
          <div className="slider-control">
            <label htmlFor="point-size">Point Size</label>
            <input
              id="point-size"
              type="range"
              min="0.01"
              max="0.05"
              step="0.001"
              value={pointSize}
              onChange={(e) => setPointSize(parseFloat(e.target.value))}
              aria-valuemin="0.01"
              aria-valuemax="0.05"
              aria-valuenow={pointSize}
            />
          </div>
          
          <div className="slider-control">
            <label htmlFor="intensity">Intensity</label>
            <input
              id="intensity"
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={intensityFactor}
              onChange={(e) => setIntensityFactor(parseFloat(e.target.value))}
              aria-valuemin="0.5"
              aria-valuemax="5"
              aria-valuenow={intensityFactor}
            />
          </div>
        </div>
      )}

      <div style={canvasContainerStyle}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          camera={{ 
            position: [20, 20, 20],
            fov: 60,
            near: 0.1,
            far: 2000
          }}
          onCreated={({ gl, camera }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.setClearColor(new THREE.Color('#000033'), 1);
            camera.up.set(0, 0, 1);
            camera.lookAt(0, 0, 0);
          }}
        >
          {showStats && <Stats />}
          <fog attach="fog" args={['#000033', 150, 500]} />
          
          {showGrid && <CustomGrid />}
          
          <ErrorBoundary>
            <LidarPointCloud 
              points={isPaused ? [] : currentPoints}
              size={pointSize}
              intensityFactor={intensityFactor}
              vehicles={vehicles}
            />
          </ErrorBoundary>

          <CameraController onZoomChange={() => {}} />
        </Canvas>
      </div>
    </div>
  );
};

export default LidarViewer;
