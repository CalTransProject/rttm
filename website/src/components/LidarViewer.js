import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

const LidarPointCloud = ({ points }) => {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current && points.length > 0) {
      const geometry = meshRef.current.geometry;
      const positions = new Float32Array(points);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.attributes.position.needsUpdate = true;
    }
  }, [points]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color="white" />
    </points>
  );
};

const LidarViewer = ({ points }) => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <LidarPointCloud points={points} />
      </Canvas>
    </div>
  );
};

export default LidarViewer;