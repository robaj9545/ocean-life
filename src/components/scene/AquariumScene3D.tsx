import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import Fish3D from '../fishes/Fish3D';
import Environment3D from './Environment3D';
import * as THREE from 'three';

interface AquariumSceneProps {
  setSelectedFish: (fish: any) => void;
}

export default function AquariumScene3D({ setSelectedFish }: AquariumSceneProps) {
  const fishes = useGameStore(state => state.fishes);
  const [foods, setFoods] = useState<{ id: string, position: [number, number, number] }[]>([]);

  // Function to drop food where the user taps on the background (ocean floor/water)
  const dropFood = (e: any) => {
    e.stopPropagation();
    const uniqueId = 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newFood = {
      id: uniqueId,
      position: [e.point.x, 5, e.point.z] as [number, number, number], // Drop from the top of the tank
    };
    setFoods([...foods, newFood]);
    
    // Auto-remove food after 10 seconds if not eaten (since we removed 2D CollisionSystem)
    setTimeout(() => {
      setFoods(current => current.filter(f => f.id !== newFood.id));
    }, 10000);
  };

  return (
    <Canvas shadows dpr={[1, 2]}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={55} />
      {/* 1. Environment */}
      <group onPointerDown={dropFood}>
        <Environment3D />
      </group>

      {/* 2. Fishes */}
      {fishes.map((fish, index) => (
        <Fish3D key={`${fish.id}_${index}`} fish={fish} setSelectedFish={setSelectedFish} />
      ))}

      {/* 3. Dropped Food */}
      {foods.map((food, index) => (
         <mesh key={`${food.id}_${index}`} position={food.position}>
           <sphereGeometry args={[0.2, 8, 8]} />
           <meshLambertMaterial color="#8B4513" />
         </mesh>
      ))}
    </Canvas>
  );
}
