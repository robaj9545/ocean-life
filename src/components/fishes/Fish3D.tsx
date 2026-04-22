

import { useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { FishEntity, useGameStore } from '../../store/useGameStore';
import { getSandHeight } from '../scene/Environment3D';

// Scenery collision mapping (absolute world coordinates accounting for Environment3D group offsets)
const SCENERY_OBSTACLES = [
  { x: 3.5, y: -3.1, z: -1.0, r: 1.5 },   // Treasure Chest
  { x: -4.0, y: -3.0, z: -1.5, r: 1.8 },  // Dark Rock Left
  { x: 7.0, y: -3.0, z: -1.0, r: 1.6 },   // Dark Rock Right
  { x: -2.5, y: -3.0, z: -2.5, r: 1.2 },  // Coral Left
  { x: 5.5, y: -2.7, z: -2.5, r: 1.6 },   // Coral Right
];

interface Fish3DProps {
  fish: FishEntity;
  setSelectedFish: (fish: any) => void;
  hungryRefs?: React.MutableRefObject<any>;
}

// Hyper-glossy material mirroring the reference image
const GlossyMaterial = ({ color }: { color: string }) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={0.2} 
    metalness={0.0} 
    clearcoat={1.0} 
    clearcoatRoughness={0.1}
  />
);

const BodyMaterial = ({ color, species }: { color: string, species: string }) => {
  if (species === 'ghostshark') {
    return <meshPhysicalMaterial color={color} roughness={0.1} clearcoat={1.0} transparent opacity={0.6} />
  }
  if (species === 'leviathan') {
    return <meshPhysicalMaterial color={color} roughness={0.4} metalness={0.8} clearcoat={1.0} emissive={color} emissiveIntensity={0.5} />
  }
  if (species === 'dragonfish') {
    return <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.4} clearcoat={1.0} emissive={color} emissiveIntensity={0.3} />
  }
  return <GlossyMaterial color={color} />
};

export default function Fish3D({ fish, setSelectedFish, hungryRefs }: Fish3DProps) {
  const { camera, size } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const fin1Ref = useRef<THREE.Mesh>(null);
  const fin2Ref = useRef<THREE.Mesh>(null);

  const initialZ = useRef((Math.random() - 0.5) * 3);

  const visibleWidth = size.width / camera.zoom;
  const visibleHeight = size.height / camera.zoom;
  const boundX = Math.max(2, (visibleWidth / 2) - 1.0); // Minimum bound 2
  const boundYTop = Math.max(1, (visibleHeight / 2) - 1.5);
  const boundYBottom = Math.min(-1, -(visibleHeight / 2) + 3.0); // Keep above floor

  const randomTarget = () => new THREE.Vector3(
    (Math.random() * (boundX * 2)) - boundX,
    (Math.random() * (boundYTop - boundYBottom)) + boundYBottom,
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

  const baseScale = fish.stage === 'baby' ? 0.35 : 0.65;
  const speedScale = useRef(Math.random() * 0.4 + 0.6);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Base speed influenced by genetics, made much slower and fluid for a calm swimming effect
    const baseNavSpeed = fish.speed ? fish.speed * 0.6 : 0.3; 
    // Smooth pulsing logic representing fish swimming bursts
    const currentSpeed = (delta * baseNavSpeed) * (1 + Math.sin(time * 1.5 * speedScale.current) * 0.4);
    const currentPos = groupRef.current.position.clone();

    // Bounds checking based on responsive camera size
    if (targetPos.x > boundX) targetPos.x = boundX;
    if (targetPos.x < -boundX) targetPos.x = -boundX;
    if (targetPos.y > boundYTop) targetPos.y = boundYTop;
    if (targetPos.y < boundYBottom) targetPos.y = boundYBottom;

    groupRef.current.position.lerp(targetPos, currentSpeed);
    // More natural, slower vertical drifting
    groupRef.current.position.y += Math.sin(time * 1.2 + speedScale.current * 10) * (delta * 0.08);

    // --- ROBUST PHYSICS ENGINE (Collision Avoidance) ---
    const avoidanceForce = new THREE.Vector3();
    
    // 1. Solid Static Objects Avoidance (Rocks, Corals, Chest)
    SCENERY_OBSTACLES.forEach(obs => {
        const obsPos = new THREE.Vector3(obs.x, obs.y, obs.z);
        const dist = currentPos.distanceTo(obsPos);
        const minAllowedDist = obs.r + (baseScale * 1.2); 
        
        if (dist < minAllowedDist) {
            // Apply a soft push-back force relative to penetration depth
            const pushDir = currentPos.clone().sub(obsPos).normalize();
            const pushIntensity = (minAllowedDist - dist) * 0.2;
            avoidanceForce.add(pushDir.multiplyScalar(pushIntensity));
            
            // Deflect path logic so fish swims AROUND it
            targetPos.add(pushDir.multiplyScalar(1.0));
        }
    });

    // 2. Continuous Ground Collision (Wavy Sand Floor)
    // Add 2.0 because the Environment3D parent group mounts at Y=2.0
    const absoluteGroundY = getSandHeight(currentPos.x, currentPos.z) + 2.0;
    const bottomPadding = baseScale * 1.2; 
    
    if (currentPos.y < absoluteGroundY + bottomPadding) {
       // Snap and push upwards smoothly to prevent burying
       avoidanceForce.y += (absoluteGroundY + bottomPadding - currentPos.y) * 0.3;
       // Reroute target upwards to simulate skimming the sand
       targetPos.y += 0.5;
    }

    // Apply the resultant repulsion forces dynamically
    groupRef.current.position.add(avoidanceForce);
    // ----------------------------------------------------

    // 2D Projection for hunger icon overlay
    if (hungryRefs && hungryRefs.current) {
      if (fish.hunger < 30) {
        const vec = groupRef.current.position.clone();
        // Displace the icon slightly above the fish
        vec.y += 0.6;
        vec.project(camera);
        const x = (vec.x * 0.5 + 0.5) * size.width;
        const y = -(vec.y * 0.5 - 0.5) * size.height;
        hungryRefs.current[fish.id] = { id: fish.id, x, y, isHungry: true };
      } else {
        if (hungryRefs.current[fish.id]) hungryRefs.current[fish.id].isHungry = false;
      }
    }

    // Strict 2.5D Sideways swimming ("só podem nadas de lado")
    // Face right (0 deg) if target is to the right. Face left (180 deg) if target is to the left.
    const isMovingRight = targetPos.x > currentPos.x;
    const targetYRot = isMovingRight ? 0 : Math.PI;

    // Smoothly interpolate exactly on the Y axis
    const currentY = groupRef.current.rotation.y;
    // Majestic, calm turnaround instead of instant snapping
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentY, targetYRot, delta * 1.8);
    
    // Lock X and Z axes (only organic wiggle allowed on Z)
    groupRef.current.rotation.x = 0;
    // Gentle rolling of the fish's body
    groupRef.current.rotation.z = Math.sin(time * 2 * speedScale.current) * 0.04;

    // Slower, rhythmic fin wiggling
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(time * 5 * speedScale.current) * 0.35;
    if (fin1Ref.current) fin1Ref.current.rotation.x = Math.sin(time * 4 * speedScale.current) * 0.25;
    if (fin2Ref.current) fin2Ref.current.rotation.x = -Math.sin(time * 4 * speedScale.current) * 0.25;

    // Changing target when getting close
    if (currentPos.distanceTo(targetPos) < 1.2) {
      setTargetPos(randomTarget());
      // Rerandomize their behavior rhythm slightly
      speedScale.current = Math.random() * 0.4 + 0.6;
    }
  });

  const isSpiderfish = fish.species === 'spiderfish';
  const isLionfish = fish.species === 'lionfish';
  const isDragonfish = fish.species === 'dragonfish';
  const isGhostshark = fish.species === 'ghostshark';
  const isLeviathan = fish.species === 'leviathan';

  let modelScale = baseScale;
  if (isLeviathan) modelScale = baseScale * 1.8;
  else if (isDragonfish || isGhostshark) modelScale = baseScale * 1.4;

  let bodyScale: [number, number, number] = [1.2, 1.4, 0.9];
  if (isDragonfish) bodyScale = [2.5, 1.2, 0.8];
  else if (isLeviathan) bodyScale = [2.8, 1.6, 1.1];
  else if (isGhostshark) bodyScale = [1.8, 1.2, 0.8];

  const showStripes = !isGhostshark && !isLeviathan && !isDragonfish && !isSpiderfish;

  return (
    <group ref={groupRef} scale={[modelScale, modelScale, modelScale]} onPointerDown={(e) => { e.stopPropagation(); setSelectedFish(fish); }}>
      
      {/* 1. Main Organic Body (Single Mesh Pill-Shape) */}
      <group position={[0, 0, 0]} rotation={[0, 0, 1.57]} scale={bodyScale}>
        <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.4, 0.3, 32, 32]} />
            <BodyMaterial color={bodyColor} species={fish.species} />
        </mesh>
      </group>

      {/* Spiderfish Spikes */}
      {isSpiderfish && (
        <group>
           <mesh position={[0, 0.6, 0]}><coneGeometry args={[0.1, 0.6, 8]} /><GlossyMaterial color="#000" /></mesh>
           <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, 0.5]}><coneGeometry args={[0.1, 0.6, 8]} /><GlossyMaterial color="#000" /></mesh>
           <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, -0.5]}><coneGeometry args={[0.1, 0.6, 8]} /><GlossyMaterial color="#000" /></mesh>
        </group>
      )}

      {/* Lionfish Ray Fins */}
      {isLionfish && (
        <group>
           <mesh position={[0.2, 0.6, 0.3]} rotation={[0.4, 0, -0.4]}><cylinderGeometry args={[0.02, 0.05, 1.2]} /><GlossyMaterial color={stripeColor} /></mesh>
           <mesh position={[0.2, 0.6, -0.3]} rotation={[-0.4, 0, -0.4]}><cylinderGeometry args={[0.02, 0.05, 1.2]} /><GlossyMaterial color={stripeColor} /></mesh>
           <mesh position={[-0.2, 0.6, 0.3]} rotation={[0.4, 0, 0.4]}><cylinderGeometry args={[0.02, 0.05, 1.2]} /><GlossyMaterial color={stripeColor} /></mesh>
           <mesh position={[-0.2, 0.6, -0.3]} rotation={[-0.4, 0, 0.4]}><cylinderGeometry args={[0.02, 0.05, 1.2]} /><GlossyMaterial color={stripeColor} /></mesh>
        </group>
      )}

      {/* Dragonfish Whiskers & Extra Scales */}
      {isDragonfish && (
        <group>
          <mesh position={[0.8, -0.2, 0.2]} rotation={[0, 0, 1.2]}><cylinderGeometry args={[0.02, 0.01, 0.8]} /><GlossyMaterial color={stripeColor} /></mesh>
          <mesh position={[0.8, -0.2, -0.2]} rotation={[0, 0, 1.2]}><cylinderGeometry args={[0.02, 0.01, 0.8]} /><GlossyMaterial color={stripeColor} /></mesh>
        </group>
      )}

      {/* 2. Seamless Stripes integrated tightly */}
      {showStripes && (
        <>
          <mesh castShadow receiveShadow position={[0.2, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.0, 0.9, 0.4]}>
             <torusGeometry args={[0.45, 0.08, 32, 64]} />
             <GlossyMaterial color={stripeColor} />
          </mesh>
          <mesh castShadow receiveShadow position={[-0.2, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[0.85, 0.8, 0.4]}>
             <torusGeometry args={[0.4, 0.08, 32, 64]} />
             <GlossyMaterial color={stripeColor} />
          </mesh>
        </>
      )}

      {/* 3. Huge Anime Glossy Eyes */}
      <group position={[isDragonfish || isLeviathan ? 0.7 : 0.45, 0.15, 0.35]} rotation={[0, 0.5, -0.2]}>
        <mesh position={[0,0,0]}><sphereGeometry args={[0.22, 32, 32]} /><meshPhysicalMaterial color={isLeviathan ? "#FF0000" : "#FFFFFF"} roughness={0.1} clearcoat={1.0} emissive={isLeviathan ? "#FF0000" : "#000000"} /></mesh>
        {!isLeviathan && (
          <>
            <mesh position={[0.1, 0, 0.12]}><sphereGeometry args={[0.12, 32, 32]} /><meshPhysicalMaterial color="#00CED1" roughness={0.1} clearcoat={1.0} /></mesh>
            <mesh position={[0.16, 0, 0.16]}><sphereGeometry args={[0.08, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0.18, 0.08, 0.18]}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
            <mesh position={[0.22, -0.04, 0.18]}><sphereGeometry args={[0.015, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
          </>
        )}
      </group>
      
      <group position={[isDragonfish || isLeviathan ? 0.7 : 0.45, 0.15, -0.35]} rotation={[0, -0.5, -0.2]}>
        <mesh position={[0,0,0]}><sphereGeometry args={[0.22, 32, 32]} /><meshPhysicalMaterial color={isLeviathan ? "#FF0000" : "#FFFFFF"} roughness={0.1} clearcoat={1.0} emissive={isLeviathan ? "#FF0000" : "#000000"} /></mesh>
        {!isLeviathan && (
          <>
            <mesh position={[0.1, 0, -0.12]}><sphereGeometry args={[0.12, 32, 32]} /><meshPhysicalMaterial color="#00CED1" roughness={0.1} clearcoat={1.0} /></mesh>
            <mesh position={[0.16, 0, -0.16]}><sphereGeometry args={[0.08, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0.18, 0.08, -0.18]}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
            <mesh position={[0.22, -0.04, -0.18]}><sphereGeometry args={[0.015, 16, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
          </>
        )}
      </group>

      {/* 4. Cute V-shaped Smile (Embedded flush with face) */}
      {!isLeviathan && !isGhostshark && (
        <mesh position={[isDragonfish ? 0.9 : 0.55, -0.15, 0]} rotation={[0.4, 1.57, 0]}>
           <torusGeometry args={[0.06, 0.02, 16, 32, 3.14]} />
           <meshBasicMaterial color="#8B0000" />
        </mesh>
      )}
      
      {/* Pink Rosy Cheeks */}
      {!isLeviathan && !isGhostshark && (
        <>
          <mesh position={[isDragonfish ? 0.8 : 0.45, -0.05, 0.35]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#FF69B4" transparent opacity={0.6} /></mesh>
          <mesh position={[isDragonfish ? 0.8 : 0.45, -0.05, -0.35]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#FF69B4" transparent opacity={0.6} /></mesh>
        </>
      )}

      {/* 5. Smooth Tail Fin */}
      <mesh castShadow receiveShadow ref={tailRef} position={[isDragonfish || isLeviathan ? -1.2 : -0.65, 0, 0]}>
         <group position={[-0.2, 0, 0]} scale={isLeviathan ? [1.5, 2.0, 0.4] : [0.8, 1.2, 0.2]}>
           <mesh castShadow receiveShadow>
             {isGhostshark ? <coneGeometry args={[0.3, 0.8, 4]} /> : <capsuleGeometry args={[0.2, 0.2, 16, 16]} />}
             <BodyMaterial color={finColor} species={fish.species} />
           </mesh>
         </group>
      </mesh>

      {/* 6. Top Dorsal Fin */}
      <mesh castShadow receiveShadow position={[-0.1, 0.5, 0]} rotation={[0, 0, -0.3]} scale={[1, 0.8, 0.3]}>
         {isGhostshark || isLeviathan ? <coneGeometry args={[0.4, 0.8, 4]} /> : <sphereGeometry args={[0.25, 32, 32]} />}
         <BodyMaterial color={finColor} species={fish.species} />
      </mesh>

      {/* 7. Wiggling Side Fins */}
      <mesh castShadow receiveShadow ref={fin1Ref} position={[0.1, -0.3, 0.4]} rotation={[0.4, 0.2, -0.8]} scale={[1.2, 0.8, 0.3]}>
         {isGhostshark ? <coneGeometry args={[0.2, 0.6, 4]} /> : <sphereGeometry args={[0.15, 32, 32]} />}
         <BodyMaterial color={finColor} species={fish.species} />
      </mesh>
      <mesh castShadow receiveShadow ref={fin2Ref} position={[0.1, -0.3, -0.4]} rotation={[-0.4, -0.2, -0.8]} scale={[1.2, 0.8, 0.3]}>
         {isGhostshark ? <coneGeometry args={[0.2, 0.6, 4]} /> : <sphereGeometry args={[0.15, 32, 32]} />}
         <BodyMaterial color={finColor} species={fish.species} />
      </mesh>

    </group>
  );
}

