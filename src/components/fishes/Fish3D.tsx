import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FishEntity, useGameStore } from '../../store/useGameStore';

interface Fish3DProps {
  fish: FishEntity;
  setSelectedFish: (fish: any) => void;
}

// Hyper-glossy material mirroring the reference image
const GlossyMaterial = ({ color }: { color: string }) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={0.2} 
    metalness={0.0} 
    clearcoat={1.0} 
    clearcoatRoughness={0.1} 
    transmission={0.0}
  />
);

export default function Fish3D({ fish, setSelectedFish }: Fish3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const fin1Ref = useRef<THREE.Mesh>(null);
  const fin2Ref = useRef<THREE.Mesh>(null);

  const initialZ = useRef((Math.random() - 0.5) * 3);
  const randomTarget = () => new THREE.Vector3(
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 6 + 1.5,
    initialZ.current
  );

  const [targetPos, setTargetPos] = useState(randomTarget());
  
  const { bodyColor, stripeColor, finColor } = useMemo(() => {
    // Math reference image #4 (Yellow and green striped)
    if (fish.species === 'striped') return { bodyColor: '#FFD700', stripeColor: '#32CD32', finColor: '#32CD32' };
    if (fish.species === 'bluetang') return { bodyColor: '#1E90FF', stripeColor: '#00008B', finColor: '#FFD700' };
    if (fish.species === 'clownfish') return { bodyColor: '#FF4500', stripeColor: '#FFFFFF', finColor: '#FF4500' };
    if (fish.species === 'puffer') return { bodyColor: '#F4D03F', stripeColor: '#F1C40F', finColor: '#F4D03F' };
    if (fish.species === 'fantasy') return { bodyColor: '#FF69B4', stripeColor: '#FF1493', finColor: '#FF69B4' };
    return { bodyColor: '#3498DB', stripeColor: '#2980B9', finColor: '#F1C40F' };
  }, [fish.species]);

  const baseScale = fish.stage === 'baby' ? 0.7 : 1.3;
  const speedScale = useRef(Math.random() * 0.4 + 0.6);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    const currentSpeed = (delta * 1.5) * (1 + Math.sin(time * 3 * speedScale.current) * 0.3);
    groupRef.current.position.lerp(targetPos, currentSpeed);
    groupRef.current.position.y += Math.sin(time * 2 + speedScale.current * 10) * 0.003;

    // Strict 2.5D Sideways swimming ("só podem nadas de lado")
    // Face right (0 deg) if target is to the right. Face left (180 deg) if target is to the left.
    const currentPos = groupRef.current.position.clone();
    const isMovingRight = targetPos.x > currentPos.x;
    const targetYRot = isMovingRight ? 0 : Math.PI;

    // Smoothly interpolate exactly on the Y axis
    const currentY = groupRef.current.rotation.y;
    // Handle wrap-around for smooth flipping
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentY, targetYRot, delta * 4);
    
    // Lock X and Z axes (only organic wiggle allowed on Z)
    groupRef.current.rotation.x = 0;
    groupRef.current.rotation.z = Math.sin(time * 12 * speedScale.current) * 0.1;

    if (tailRef.current) tailRef.current.rotation.y = Math.sin(time * 12 * speedScale.current) * 0.5;
    if (fin1Ref.current) fin1Ref.current.rotation.x = Math.sin(time * 10 * speedScale.current) * 0.4;
    if (fin2Ref.current) fin2Ref.current.rotation.x = -Math.sin(time * 10 * speedScale.current) * 0.4;

    if (currentPos.distanceTo(targetPos) < 1.0) {
      setTargetPos(randomTarget());
      speedScale.current = Math.random() * 0.4 + 0.6;
    }
  });

  return (
    <group ref={groupRef} scale={[baseScale, baseScale, baseScale]} onPointerDown={(e) => { e.stopPropagation(); setSelectedFish(fish); }}>
      
      {/* 1. Main Organic Body (Smoother Capsule Contour) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0, 0, 1.57]} scale={[1.2, 1.4, 0.9]}>
        <capsuleGeometry args={[0.4, 0.3, 32, 32]} />
        <GlossyMaterial color={bodyColor} />
      </mesh>

      {/* 2. Seamless Stripes integrated tightly */}
      <mesh castShadow receiveShadow position={[0.2, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.0, 0.9, 0.4]}>
         <torusGeometry args={[0.45, 0.08, 32, 64]} />
         <GlossyMaterial color={stripeColor} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.2, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[0.85, 0.8, 0.4]}>
         <torusGeometry args={[0.4, 0.08, 32, 64]} />
         <GlossyMaterial color={stripeColor} />
      </mesh>

      {/* 3. Huge Anime Glossy Eyes */}
      <group position={[0.45, 0.15, 0.35]} rotation={[0, 0.5, -0.2]}>
        {/* Sclera */}
        <mesh position={[0,0,0]}><sphereGeometry args={[0.22, 32, 32]} /><meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} /></mesh>
        {/* Iris */}
        <mesh position={[0.1, 0, 0.12]}><sphereGeometry args={[0.12, 32, 32]} /><meshPhysicalMaterial color="#00CED1" roughness={0.1} clearcoat={1.0} /></mesh>
        {/* Pupil */}
        <mesh position={[0.16, 0, 0.16]}><sphereGeometry args={[0.08, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
        {/* Giant Specular Glint */}
        <mesh position={[0.18, 0.08, 0.18]}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[0.22, -0.04, 0.18]}><sphereGeometry args={[0.015, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>
      
      <group position={[0.45, 0.15, -0.35]} rotation={[0, -0.5, -0.2]}>
        <mesh position={[0,0,0]}><sphereGeometry args={[0.22, 32, 32]} /><meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} /></mesh>
        <mesh position={[0.1, 0, -0.12]}><sphereGeometry args={[0.12, 32, 32]} /><meshPhysicalMaterial color="#00CED1" roughness={0.1} clearcoat={1.0} /></mesh>
        <mesh position={[0.16, 0, -0.16]}><sphereGeometry args={[0.08, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh position={[0.18, 0.08, -0.18]}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[0.22, -0.04, -0.18]}><sphereGeometry args={[0.015, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>

      {/* 4. Cute V-shaped Smile (Embedded flush with face) */}
      <mesh position={[0.55, -0.15, 0]} rotation={[0.4, 1.57, 0]}>
         <torusGeometry args={[0.06, 0.02, 16, 32, 3.14]} />
         <meshBasicMaterial color="#8B0000" />
      </mesh>
      
      {/* Pink Rosy Cheeks */}
      <mesh position={[0.45, -0.05, 0.35]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#FF69B4" transparent opacity={0.6} /></mesh>
      <mesh position={[0.45, -0.05, -0.35]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#FF69B4" transparent opacity={0.6} /></mesh>

      {/* 5. Smooth Tail Fin */}
      <mesh castShadow receiveShadow ref={tailRef} position={[-0.65, 0, 0]}>
         <mesh castShadow receiveShadow position={[-0.2, 0, 0]} scale={[0.8, 1.2, 0.2]}>
           <capsuleGeometry args={[0.2, 0.2, 16, 16]} />
           <GlossyMaterial color={finColor} />
         </mesh>
      </mesh>

      {/* 6. Top Dorsal Fin */}
      <mesh castShadow receiveShadow position={[-0.1, 0.5, 0]} rotation={[0, 0, -0.3]} scale={[1, 0.8, 0.3]}>
         <sphereGeometry args={[0.25, 32, 32]} />
         <GlossyMaterial color={finColor} />
      </mesh>

      {/* 7. Wiggling Side Fins */}
      <mesh castShadow receiveShadow ref={fin1Ref} position={[0.1, -0.3, 0.4]} rotation={[0.4, 0.2, -0.8]} scale={[1.2, 0.8, 0.3]}>
         <sphereGeometry args={[0.15, 32, 32]} />
         <GlossyMaterial color={finColor} />
      </mesh>
      <mesh castShadow receiveShadow ref={fin2Ref} position={[0.1, -0.3, -0.4]} rotation={[-0.4, -0.2, -0.8]} scale={[1.2, 0.8, 0.3]}>
         <sphereGeometry args={[0.15, 32, 32]} />
         <GlossyMaterial color={finColor} />
      </mesh>

    </group>
  );
}
