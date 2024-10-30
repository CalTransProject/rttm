import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Box, Button, Typography, Slider } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';

const CameraControls = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.up.set(0, 0, 1); // Set Z-up coordinate system like VeloView
  }, [camera]);

  return (
    <OrbitControls
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      panSpeed={0.8}
      minDistance={1}
      maxDistance={1000}
      maxPolarAngle={Math.PI * 0.85}
      target={new THREE.Vector3(0, 0, 0)}
    />
  );
};

const CustomGrid = () => {
  const gridSize = 50;
  const divisions = 50;
  
  return (
    <group>
      {/* XY plane grid (ground) */}
      <gridHelper 
        args={[gridSize, divisions, '#202040', '#101030']}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* XZ plane grid */}
      <gridHelper 
        args={[gridSize, divisions, '#202040', '#101030']}
      />
      {/* YZ plane grid */}
      <gridHelper 
        args={[gridSize, divisions, '#202040', '#101030']}
        rotation={[0, Math.PI / 2, 0]}
      />
      
      {/* Coordinate axes */}
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, 0, 0)]
        }} />
        <lineBasicMaterial attach="material" color="#FF2222" linewidth={3} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 20, 0)]
        }} />
        <lineBasicMaterial attach="material" color="#22FF22" linewidth={3} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 20)]
        }} />
        <lineBasicMaterial attach="material" color="#2222FF" linewidth={3} />
      </line>
    </group>
  );
};

const LidarPointCloud = ({ points, size = 0.02, intensityFactor = 2.0 }) => {
  const meshRef = useRef();
  const pointsRef = useRef([]);
  const spatialIndexRef = useRef(new Map());
  const maxPoints = 1000000; // Increased point capacity
  const gridSize = 0.05; // Spatial indexing grid size

  const colors = useMemo(() => {
    const pointsToProcess = pointsRef.current;
    if (!pointsToProcess || pointsToProcess.length === 0) return null;
    
    const colorArray = new Float32Array(pointsToProcess.length);
    
    for (let i = 0; i < pointsToProcess.length; i += 3) {
      const x = pointsToProcess[i];
      const y = pointsToProcess[i + 1];
      const z = pointsToProcess[i + 2];
      
      const distance = Math.sqrt(x * x + y * y + z * z);
      const height = z; // Use Z as height for VeloView-like visualization
      const normalizedDistance = Math.min(distance / 150, 1);
      const distanceFactor = Math.pow(1 - normalizedDistance, 0.5) * intensityFactor;
      
      // Enhanced VeloView-like color scheme
      if (height < -2) {
        // Ground - dark blue
        colorArray[i] = 0;
        colorArray[i + 1] = 0;
        colorArray[i + 2] = 0.7 * distanceFactor;
      } else if (height < -0.5) {
        // Low objects - blue to cyan
        const t = (height + 2) / 1.5;
        colorArray[i] = 0;
        colorArray[i + 1] = 0.5 * t * distanceFactor;
        colorArray[i + 2] = (0.7 + 0.3 * t) * distanceFactor;
      } else if (height < 1) {
        // Mid-low objects - cyan to light blue
        const t = (height + 0.5) / 1.5;
        colorArray[i] = 0.2 * t * distanceFactor;
        colorArray[i + 1] = (0.5 + 0.3 * t) * distanceFactor;
        colorArray[i + 2] = (1.0 - 0.2 * t) * distanceFactor;
      } else if (height < 3) {
        // Mid-high objects - light blue to green
        const t = (height - 1) / 2;
        colorArray[i] = (0.2 + 0.3 * t) * distanceFactor;
        colorArray[i + 1] = (0.8 + 0.2 * t) * distanceFactor;
        colorArray[i + 2] = (0.8 - 0.4 * t) * distanceFactor;
      } else {
        // High objects - green to yellow
        const t = Math.min((height - 3) / 2, 1);
        colorArray[i] = (0.5 + 0.5 * t) * distanceFactor;
        colorArray[i + 1] = 1.0 * distanceFactor;
        colorArray[i + 2] = (0.4 - 0.4 * t) * distanceFactor;
      }
    }
    return colorArray;
  }, [pointsRef.current, intensityFactor]);

  // Process and accumulate points with spatial indexing
  useEffect(() => {
    if (!points || points.length === 0) return;

    const processPoints = () => {
      for (let i = 0; i < points.length; i += 3) {
        const x = points[i];
        const y = points[i + 1];
        const z = points[i + 2];

        // Create grid cell key for spatial indexing
        const cellX = Math.floor(x / gridSize);
        const cellY = Math.floor(y / gridSize);
        const cellZ = Math.floor(z / gridSize);
        const cellKey = `${cellX},${cellY},${cellZ}`;

        if (!spatialIndexRef.current.has(cellKey)) {
          spatialIndexRef.current.set(cellKey, pointsRef.current.length / 3);
          pointsRef.current.push(x, y, z);
        }
      }

      // Limit total points while maintaining density
      if (pointsRef.current.length > maxPoints * 3) {
        const stride = Math.ceil(pointsRef.current.length / (maxPoints * 3));
        pointsRef.current = pointsRef.current.filter((_, index) => index % stride === 0);
        
        // Rebuild spatial index
        spatialIndexRef.current.clear();
        for (let i = 0; i < pointsRef.current.length; i += 3) {
          const x = pointsRef.current[i];
          const y = pointsRef.current[i + 1];
          const z = pointsRef.current[i + 2];
          const cellX = Math.floor(x / gridSize);
          const cellY = Math.floor(y / gridSize);
          const cellZ = Math.floor(z / gridSize);
          const cellKey = `${cellX},${cellY},${cellZ}`;
          spatialIndexRef.current.set(cellKey, i / 3);
        }
      }
    };

    processPoints();
  }, [points]);

  // Update geometry when points change
  useEffect(() => {
    if (meshRef.current && pointsRef.current.length > 0) {
      const geometry = meshRef.current.geometry;
      const positions = new Float32Array(pointsRef.current);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      if (colors) {
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  }, [colors, pointsRef.current]);

  return (
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
  );
};

const LidarViewer = ({ points = [], title = "", height = "400px" }) => {
  const [showStats, setShowStats] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [intensityFactor, setIntensityFactor] = useState(2.0);
  const [pointSize, setPointSize] = useState(0.02);
  
  return (
    <Box sx={{ 
      bgcolor: '#000000', 
      borderRadius: 1,
      overflow: 'hidden',
      boxShadow: 3
    }}>
      <Box sx={{ p: 2, bgcolor: '#1a1a1a' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {title || "LiDAR Visualization"}
          </Typography>
          <Typography variant="body2" sx={{ color: '#888888' }}>
            Points: {Math.floor(points.length / 3)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button 
            variant="outlined"
            size="small"
            onClick={() => setIsPaused(!isPaused)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button 
            variant="outlined"
            size="small"
            onClick={() => setShowStats(!showStats)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
          <Button 
            variant="outlined"
            size="small"
            onClick={() => setShowGrid(!showGrid)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </Button>
        </Box>
        <Box sx={{ px: 2 }}>
          <Typography variant="caption" sx={{ color: 'white', mb: 1 }}>
            Point Size
          </Typography>
          <Slider
            value={pointSize}
            onChange={(_, value) => setPointSize(value)}
            min={0.01}
            max={0.05}
            step={0.001}
            sx={{ color: 'white' }}
          />
          <Typography variant="caption" sx={{ color: 'white', mb: 1 }}>
            Intensity
          </Typography>
          <Slider
            value={intensityFactor}
            onChange={(_, value) => setIntensityFactor(value)}
            min={0.5}
            max={5}
            step={0.1}
            sx={{ color: 'white' }}
          />
        </Box>
      </Box>

      <Box sx={{ width: '100%', height, position: 'relative' }}>
        <Canvas
          camera={{ 
            position: [30, 30, 30],
            fov: 45,
            near: 0.1,
            far: 2000
          }}
          onCreated={({ gl, camera }) => {
            gl.setPixelRatio(window.devicePixelRatio);
            gl.setClearColor(new THREE.Color('#000033'), 1);
            camera.up.set(0, 0, 1); // Set Z-up coordinate system
            camera.lookAt(0, 0, 0);
          }}
        >
          {showStats && <Stats />}
          <fog attach="fog" args={['#000033', 100, 400]} />
          
          {showGrid && <CustomGrid />}
          
          <ErrorBoundary>
            <LidarPointCloud 
              points={isPaused ? [] : points}
              size={pointSize}
              intensityFactor={intensityFactor}
            />
          </ErrorBoundary>

          <CameraControls />
        </Canvas>
      </Box>
    </Box>
  );
};

export default LidarViewer;