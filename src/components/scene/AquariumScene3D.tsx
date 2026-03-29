

import { OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import Fish3D from '../fishes/Fish3D';
import Environment3D from './Environment3D';

const Food3D = ({ food }: { food: any }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (meshRef.current) {
      meshRef.current.position.y -= 2 * dt; // Gravity
      food.position.y = meshRef.current.position.y; // Update ref for fishes to track
    }
  });

  return (
    <mesh ref={meshRef} position={[food.position.x, food.position.y, food.position.z]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshLambertMaterial color="#8B4513" />
    </mesh>
  );
};

const Coin3D = ({ coin }: { coin: any }) => {
  const meshRef = React.useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (meshRef.current && meshRef.current.position.y > -6.2) {
      meshRef.current.position.y -= 1.5 * dt; // Slower fall weight
      meshRef.current.rotation.y += 2 * dt;  // Spin animation
      coin.position.y = meshRef.current.position.y;
    }
  });

  return (
    <group 
       ref={meshRef} 
       position={[coin.position.x, coin.position.y, coin.position.z]}
       onPointerDown={(e) => {
         e.stopPropagation();
         useGameStore.getState().collectCoin(coin.id, coin.value);
       }}
    >
      <mesh rotation={[1.57, 0, 0]}>
         <cylinderGeometry args={[0.3, 0.3, 0.08, 16]} />
         <meshPhysicalMaterial color="#FFD700" metalness={0.8} roughness={0.2} clearcoat={1.0} />
      </mesh>
    </group>
  );
};

interface AquariumSceneProps {
  setSelectedFish: (fish: any) => void;
  hungryRefs?: React.MutableRefObject<any>;
}

export default function AquariumScene3D({ setSelectedFish, hungryRefs }: AquariumSceneProps) {
  const fishes = useGameStore(state => state.fishes);
  const coinsInWater = useGameStore(state => state.coinsInWater);
  const [foods, setFoods] = useState<{ id: string, position: THREE.Vector3 }[]>([]);

  const dropFood = (e: any) => {
    e.stopPropagation();
    const uniqueId = 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newFood = {
      id: uniqueId,
      position: new THREE.Vector3(e.point.x, 5, e.point.z),
    };
    setFoods(current => [...current, newFood]);
    
    // Auto-remove food after 15 seconds if not eaten
    setTimeout(() => {
      setFoods(current => current.filter(f => f.id !== newFood.id));
    }, 15000);
  };

  return (
    <Canvas shadows dpr={[1, 2]}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={55} />
      <group onPointerDown={dropFood}>
        <Environment3D />
      </group>

      {fishes.map((fish, index) => (
        <Fish3D 
          key={`${fish.id}_${index}`} 
          fish={fish} 
          setSelectedFish={setSelectedFish} 
          foods={foods}
          setFoods={setFoods}
          hungryRefs={hungryRefs}
        />
      ))}

      {/* {coinsInWater.map((coin) => (
         <Coin3D key={coin.id} coin={coin} />
      ))} */}
    </Canvas>
  );
}
