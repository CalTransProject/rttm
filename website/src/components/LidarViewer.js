import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

const CameraControls = () => (
  <OrbitControls
    enableDamping={false}
    rotateSpeed={0.3}
    panSpeed={0.5}
    minDistance={5}
    maxDistance={500} // Increased max distance to see more points
    maxPolarAngle={Math.PI * 0.75} // Increased angle for better overview
  />
);

const CustomGrid = () => {
  const gridHelper = new THREE.GridHelper(200, 40, '#202040', '#101030'); // Increased grid size and divisions
  return (
    <>
      <primitive object={gridHelper} position={[0, -2, 0]} />
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, 0, 0)] // Increased axis length
        }} />
        <lineBasicMaterial attach="material" color="#FF2222" linewidth={2} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 20, 0)] // Increased axis length
        }} />
        <lineBasicMaterial attach="material" color="#22FF22" linewidth={2} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...{
          setFromPoints: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 20)] // Increased axis length
        }} />
        <lineBasicMaterial attach="material" color="#2222FF" linewidth={2} />
      </line>
    </>
  );
};

const LidarPointCloud = ({ points, size = 0.05 }) => { // Reduced default point size
  const meshRef = useRef();

  const colors = useMemo(() => {
    if (!points || points.length === 0) return null;
    
    const colorArray = new Float32Array(points.length);
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];
      
      const height = y;
      const distance = Math.sqrt(x * x + z * z);
      const normalizedDistance = Math.min(distance / 100, 1); // Increased distance scale
      const distanceFactor = Math.pow(1 - normalizedDistance, 0.3);
      
      // VeloView color scheme
      if (height < -1.5) {
        // Ground - dark blue
        colorArray[i] = 0;
        colorArray[i + 1] = 0;
        colorArray[i + 2] = 0.5 * distanceFactor;
      } else if (height < 0) {
        // Low ground - blue to light blue
        const t = (height + 1.5) / 1.5;
        colorArray[i] = 0;
        colorArray[i + 1] = 0.2 * t * distanceFactor;
        colorArray[i + 2] = (0.5 + 0.3 * t) * distanceFactor;
      } else if (height < 2) {
        // Mid-low objects - light blue to cyan
        const t = height / 2;
        colorArray[i] = 0;
        colorArray[i + 1] = (0.2 + 0.4 * t) * distanceFactor;
        colorArray[i + 2] = (0.8 - 0.3 * t) * distanceFactor;
      } else if (height < 5) {
        // Mid-high objects - cyan to green
        const t = (height - 2) / 3;
        colorArray[i] = 0.2 * t * distanceFactor;
        colorArray[i + 1] = (0.6 + 0.4 * t) * distanceFactor;
        colorArray[i + 2] = (0.5 - 0.5 * t) * distanceFactor;
      } else {
        // High objects - green to yellow
        const t = Math.min((height - 5) / 3, 1);
        colorArray[i] = (0.2 + 0.8 * t) * distanceFactor;
        colorArray[i + 1] = 1.0 * distanceFactor;
        colorArray[i + 2] = 0;
      }
      
      // VeloView-like intensity adjustment
      const intensityBoost = 2.2;
      colorArray[i] *= intensityBoost;
      colorArray[i + 1] *= intensityBoost;
      colorArray[i + 2] *= intensityBoost;
    }
    return colorArray;
  }, [points]);

  useEffect(() => {
    if (meshRef.current && points && points.length > 0) {
      const geometry = meshRef.current.geometry;
      const positions = new Float32Array(points);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      if (colors) {
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
      
      const center = geometry.boundingSphere.center;
      meshRef.current.position.set(-center.x, -center.y, -center.z);
    }
  }, [points, colors]);

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial 
        size={size}
        vertexColors
        sizeAttenuation={true} // Enable size attenuation for better depth perception
        transparent={true}
        opacity={0.8} // Slightly reduced opacity to help with dense point clouds
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

const LidarViewer = ({ points = [], title = "", height = "400px" }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState(null);

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
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {isPlaying ? 'Pause' : 'Play'}
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

      {error && (
        <Box sx={{ m: 2, p: 2, bgcolor: 'rgba(255,0,0,0.2)', color: '#ff8888', borderRadius: 1 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box sx={{ width: '100%', height, position: 'relative' }}>
        <Canvas
          camera={{ 
            position: [0, 15, 50], // Adjusted camera position for better overview
            fov: 45,
            near: 0.1,
            far: 2000 // Increased far plane to see more distant points
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
          <fog attach="fog" args={['#000022', 80, 300]} /> // Adjusted fog distance
          
          {showGrid && <CustomGrid />}
          
          <ErrorBoundary>
            <LidarPointCloud 
              points={isPlaying ? points : []}
              size={0.05} // Reduced point size
            />
          </ErrorBoundary>

          <CameraControls />
        </Canvas>
      </Box>
    </Box>
  );
};

export default LidarViewer;