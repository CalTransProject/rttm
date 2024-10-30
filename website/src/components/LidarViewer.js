import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Box, Button, Typography } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';

const CameraControls = () => (
  <OrbitControls
    enableDamping={false}
    rotateSpeed={0.3}
    panSpeed={0.5}
    minDistance={5}
    maxDistance={500}
    maxPolarAngle={Math.PI * 0.75}
  />
);

const CustomGrid = () => {
  const gridHelper = new THREE.GridHelper(200, 40, '#202040', '#101030');
  return (
    <>
      <primitive object={gridHelper} position={[0, -2, 0]} />
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, 0, 0)]
        }} />
        <lineBasicMaterial attach="material" color="#FF2222" linewidth={2} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 20, 0)]
        }} />
        <lineBasicMaterial attach="material" color="#22FF22" linewidth={2} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 20)]
        }} />
        <lineBasicMaterial attach="material" color="#2222FF" linewidth={2} />
      </line>
    </>
  );
};

const LidarPointCloud = ({ points, size = 0.05 }) => {
  const meshRef = useRef();
  const accumulatedPointsRef = useRef([]);
  const [isAccumulating, setIsAccumulating] = useState(true);
  const maxPoints = 100000; // Maximum points to accumulate

  const colors = useMemo(() => {
    const pointsToProcess = accumulatedPointsRef.current;
    if (!pointsToProcess || pointsToProcess.length === 0) return null;
    
    const colorArray = new Float32Array(pointsToProcess.length);
    for (let i = 0; i < pointsToProcess.length; i += 3) {
      const x = pointsToProcess[i];
      const y = pointsToProcess[i + 1];
      const z = pointsToProcess[i + 2];
      
      const height = y;
      const distance = Math.sqrt(x * x + z * z);
      const normalizedDistance = Math.min(distance / 100, 1);
      const distanceFactor = Math.pow(1 - normalizedDistance, 0.3);
      
      // Color calculation remains the same
      if (height < -1.5) {
        colorArray[i] = 0;
        colorArray[i + 1] = 0;
        colorArray[i + 2] = 0.5 * distanceFactor;
      } else if (height < 0) {
        const t = (height + 1.5) / 1.5;
        colorArray[i] = 0;
        colorArray[i + 1] = 0.2 * t * distanceFactor;
        colorArray[i + 2] = (0.5 + 0.3 * t) * distanceFactor;
      } else if (height < 2) {
        const t = height / 2;
        colorArray[i] = 0;
        colorArray[i + 1] = (0.2 + 0.4 * t) * distanceFactor;
        colorArray[i + 2] = (0.8 - 0.3 * t) * distanceFactor;
      } else if (height < 5) {
        const t = (height - 2) / 3;
        colorArray[i] = 0.2 * t * distanceFactor;
        colorArray[i + 1] = (0.6 + 0.4 * t) * distanceFactor;
        colorArray[i + 2] = (0.5 - 0.5 * t) * distanceFactor;
      } else {
        const t = Math.min((height - 5) / 3, 1);
        colorArray[i] = (0.2 + 0.8 * t) * distanceFactor;
        colorArray[i + 1] = 1.0 * distanceFactor;
        colorArray[i + 2] = 0;
      }
    }
    return colorArray;
  }, [accumulatedPointsRef.current]);

  useEffect(() => {
    if (!isAccumulating || !points || points.length === 0) return;

    // Accumulate points with duplicate removal
    const newPoints = [...points];
    const existingPoints = new Set(
      Array.from({ length: accumulatedPointsRef.current.length / 3 }, (_, i) => {
        const idx = i * 3;
        return `${accumulatedPointsRef.current[idx]},${accumulatedPointsRef.current[idx + 1]},${accumulatedPointsRef.current[idx + 2]}`;
      })
    );

    for (let i = 0; i < newPoints.length; i += 3) {
      const pointKey = `${newPoints[i]},${newPoints[i + 1]},${newPoints[i + 2]}`;
      if (!existingPoints.has(pointKey)) {
        accumulatedPointsRef.current.push(newPoints[i], newPoints[i + 1], newPoints[i + 2]);
        existingPoints.add(pointKey);
      }
    }

    // Limit total points
    if (accumulatedPointsRef.current.length > maxPoints * 3) {
      accumulatedPointsRef.current = accumulatedPointsRef.current.slice(-maxPoints * 3);
    }
  }, [points, isAccumulating]);

  useEffect(() => {
    if (meshRef.current && accumulatedPointsRef.current.length > 0) {
      const geometry = meshRef.current.geometry;
      const positions = new Float32Array(accumulatedPointsRef.current);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      if (colors) {
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  }, [colors, accumulatedPointsRef.current]);

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial 
        size={size}
        vertexColors
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

const LidarViewer = ({ points = [], title = "", height = "400px" }) => {
  const [showStats, setShowStats] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isAccumulating, setIsAccumulating] = useState(true);
  
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
            Points: {points.length / 3}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            onClick={() => setIsAccumulating(!isAccumulating)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {isAccumulating ? 'Stop Accumulating' : 'Start Accumulating'}
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
      </Box>

      <Box sx={{ width: '100%', height, position: 'relative' }}>
        <Canvas
          camera={{ 
            position: [0, 15, 50],
            fov: 45,
            near: 0.1,
            far: 2000
          }}
          onCreated={({ gl, camera }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.setClearColor(new THREE.Color('#000022'), 1);
            camera.lookAt(0, 0, 0);
          }}
        >
          {showStats && <Stats />}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 20, 10]} intensity={0.5} />
          <fog attach="fog" args={['#000022', 80, 300]} />
          
          {showGrid && <CustomGrid />}
          
          <ErrorBoundary>
            <LidarPointCloud 
              points={isPaused ? [] : points}
              size={0.05}
              isAccumulating={isAccumulating}
            />
          </ErrorBoundary>

          <CameraControls />
        </Canvas>
      </Box>
    </Box>
  );
};

export default LidarViewer;