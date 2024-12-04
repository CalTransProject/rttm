import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import ErrorBoundary from './ErrorBoundary';
import './lidarViewer.css';

const COLOR_MODES = {
  INTENSITY: 'intensity',
  HEIGHT: 'height',
  DISTANCE: 'distance'
};

const VEHICLE_COLORS = {
  car: 0x00ff00,      // Green
  truck: 0xff0000,    // Red
  bus: 0x0000ff,      // Blue
  motorcycle: 0xffff00 // Yellow
};

const CameraController = ({ onZoomChange }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const initialDistance = 20;
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
      
      {/* Coordinate axes */}
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

const LidarPointCloud = ({ points, intensities, size = 0.02, colorMode = COLOR_MODES.INTENSITY, vehicles }) => {
  const meshRef = useRef();
  const maxPoints = 1000000;

  const processedData = useMemo(() => {
    if (!points || points.length === 0) return null;

    const positions = new Float32Array(points);
    const colors = new Float32Array(points.length);
    const numPoints = points.length / 3;

    for (let i = 0; i < numPoints; i++) {
      const x = points[i * 3];
      const y = points[i * 3 + 1];
      const z = points[i * 3 + 2];
      const intensity = intensities ? intensities[i] : 0;
      
      let color;
      switch (colorMode) {
        case COLOR_MODES.INTENSITY:
          // VeloView-like intensity coloring
          const normalizedIntensity = Math.min(intensity / 255, 1);
          color = new THREE.Color().setHSL(
            0.6 - normalizedIntensity * 0.5,  // Hue: blue to red
            0.8,                              // Saturation
            0.3 + normalizedIntensity * 0.4   // Lightness
          );
          break;
          
        case COLOR_MODES.HEIGHT:
          // Height-based coloring
          const height = z;
          const heightColor = new THREE.Color();
          if (height < -2) {
            heightColor.setRGB(0, 0, 0.7);
          } else if (height < 0) {
            heightColor.setRGB(0, 0.5, 0.9);
          } else if (height < 2) {
            heightColor.setRGB(0.3, 0.8, 0.5);
          } else if (height < 5) {
            heightColor.setRGB(0.8, 0.9, 0.3);
          } else {
            heightColor.setRGB(1, 0.8, 0.2);
          }
          color = heightColor;
          break;
          
        case COLOR_MODES.DISTANCE:
          // Distance-based coloring
          const distance = Math.sqrt(x * x + y * y + z * z);
          const normalizedDist = Math.min(distance / 50, 1);
          color = new THREE.Color().setHSL(
            0.7 - normalizedDist * 0.7,  // Hue
            0.9,                         // Saturation
            0.5                          // Lightness
          );
          break;
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [points, intensities, colorMode]);

  useEffect(() => {
    if (meshRef.current && processedData) {
      const geometry = meshRef.current.geometry;
      
      geometry.setAttribute('position', new THREE.BufferAttribute(processedData.positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(processedData.colors, 3));
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  }, [processedData]);

  return (
    <group>
      <points ref={meshRef}>
        <bufferGeometry />
        <pointsMaterial
          size={size}
          vertexColors={true}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
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

const LidarViewer = ({ data = { points: [], intensities: [] }, title = "", height = "100%" }) => {
  const [zoomLevel, setZoomLevel] = useState(50);
  const [colorMode, setColorMode] = useState(COLOR_MODES.INTENSITY);
  const [pointSize, setPointSize] = useState(0.02);
  const [showStats, setShowStats] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [vehicles, setVehicles] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(data.points);
  const [currentIntensities, setCurrentIntensities] = useState(data.intensities);

  const canvasContainerStyle = {
    position: 'relative',
    width: '100%',
    height: 'calc(100% - 60px)',
    backgroundColor: '#000033',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const handleKeyPress = (event) => {
    switch(event.key) {
      case '1':
        setColorMode(COLOR_MODES.INTENSITY);
        break;
      case '2':
        setColorMode(COLOR_MODES.HEIGHT);
        break;
      case '3':
        setColorMode(COLOR_MODES.DISTANCE);
        break;
      case '+':
        setPointSize(prev => Math.min(prev + 0.01, 0.2));
        break;
      case '-':
        setPointSize(prev => Math.max(prev - 0.01, 0.01));
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
            if (data.intensities) {
              setCurrentIntensities(data.intensities);
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
            onClick={() => setIsPaused(!isPaused)}
            aria-label="Toggle pause"
            aria-pressed={isPaused}
          >
            
          </button>
          <button 
            className="settings-button" 
            onClick={() => setShowStats(!showStats)}
            aria-label="Toggle stats"
            aria-pressed={showStats}
          >
            
          </button>
          <button 
            className="settings-button" 
            onClick={() => setShowGrid(!showGrid)}
            aria-label="Toggle grid"
            aria-pressed={showGrid}
          >
            
          </button>
        </div>
      </div>
      
      <div style={canvasContainerStyle}>
        <Canvas
          camera={{ position: [20, 20, 20], fov: 60 }}
          style={{ background: '#000011' }}
        >
          {showStats && <Stats />}
          <fog attach="fog" args={['#000033', 150, 500]} />
          
          {showGrid && <CustomGrid />}
          
          <ErrorBoundary>
            <LidarPointCloud 
              points={isPaused ? [] : currentPoints}
              intensities={isPaused ? [] : currentIntensities}
              size={pointSize}
              colorMode={colorMode}
              vehicles={vehicles}
            />
          </ErrorBoundary>

          <CameraController onZoomChange={setZoomLevel} />
        </Canvas>
      </div>
    </div>
  );
};

export default LidarViewer;
