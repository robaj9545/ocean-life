

import { OrthographicCamera } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import Fish3D from '../fishes/Fish3D';
import Environment3D from './Environment3D';

// Simple fallback shown while 3D textures load
const SuspenseFallback = () => {
  return (
    <mesh>
      <planeGeometry args={[20, 14]} />
      <meshBasicMaterial color="#061a33" />
    </mesh>
  );
};

interface AquariumSceneProps {
  setSelectedFish: (fish: any) => void;
  hungryRefs?: React.MutableRefObject<any>;
}

const ResponsiveCamera = () => {
  const { size, camera } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      // Adjust zoom based on screen width to ensure the aquarium fits nicely
      const baseWidth = 400; // assumed mobile width
      const scale = size.width / baseWidth;
      const newZoom = 55 * scale;
      camera.zoom = Math.max(40, Math.min(newZoom, 80)); // Clamp between 40 and 80
      camera.updateProjectionMatrix();
    }
  }, [size, camera]);
  return null;
}

export default function AquariumScene3D({ setSelectedFish, hungryRefs }: AquariumSceneProps) {
  const fishes = useGameStore(state => state.fishes);

  return (
    <Canvas shadows dpr={[1, 2]}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={55} />
      <ResponsiveCamera />
      
      <React.Suspense fallback={<SuspenseFallback />}>
        <group>
          <Environment3D />
        </group>

        {fishes.map((fish) => (
          <Fish3D 
            key={fish.id} 
            fish={fish} 
            setSelectedFish={setSelectedFish} 
            hungryRefs={hungryRefs}
          />
        ))}
      </React.Suspense>
    </Canvas>
  );
}
