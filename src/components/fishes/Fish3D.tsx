

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
    if (fish.species === 'clownfish') return { bodyColor: '#FF6B1A', stripeColor: '#FFFFFF', finColor: '#FF8C00' };
    if (fish.species === 'bluetang') return { bodyColor: '#1A7DE8', stripeColor: '#0A1A66', finColor: '#FFD700' };
    if (fish.species === 'spiderfish') return { bodyColor: '#9C7B5A', stripeColor: '#3D2B1A', finColor: '#7A5C3A' };
    if (fish.species === 'lionfish') return { bodyColor: '#7A2E1A', stripeColor: '#F5E6D0', finColor: '#8B3A22' };
    if (fish.species === 'dragonfish') return { bodyColor: '#120820', stripeColor: '#00BFFF', finColor: '#1A0A3A' };
    if (fish.species === 'ghostshark') return { bodyColor: '#D8E8F4', stripeColor: '#A8C0D4', finColor: '#C0D8EC' };
    if (fish.species === 'leviathan') return { bodyColor: '#0A5C38', stripeColor: '#00D4AA', finColor: '#0A7A4A' };
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

  const sp = fish.species;
  const isClown = sp === 'clownfish';
  const isBluetang = sp === 'bluetang';
  const isSpider = sp === 'spiderfish';
  const isLion = sp === 'lionfish';
  const isDragon = sp === 'dragonfish';
  const isGhost = sp === 'ghostshark';
  const isLevi = sp === 'leviathan';

  let modelScale = baseScale;
  if (isLevi) modelScale = baseScale * 2.0;
  else if (isDragon) modelScale = baseScale * 1.5;
  else if (isGhost) modelScale = baseScale * 1.4;
  else if (isLion) modelScale = baseScale * 1.1;

  let bodyScale: [number, number, number] = [1.2, 1.1, 0.85]; // clownfish: rounder/chubbier
  if (isBluetang) bodyScale = [1.1, 1.4, 0.5]; // oval, flatter sides
  else if (isSpider) bodyScale = [1.6, 0.85, 0.65]; // compact scorpionfish
  else if (isLion) bodyScale = [1.2, 1.0, 0.8]; // stocky
  else if (isDragon) bodyScale = [2.6, 0.7, 0.55]; // long and thin
  else if (isGhost) bodyScale = [2.4, 0.8, 0.6]; // elongated shark
  else if (isLevi) bodyScale = [3.5, 0.95, 0.85]; // long sea serpent

  const aFin = isBluetang ? '#FFD700' : finColor;
  const eyeX = isDragon ? 0.88 : isLevi ? 1.1 : isGhost ? 0.9 : isSpider ? 0.62 : isLion ? 0.45 : 0.5;
  const eyeY = isDragon ? 0.1 : isLevi ? 0.22 : isGhost ? 0.05 : isLion ? 0.14 : 0.14;
  const eyeSize = isLevi ? 0.18 : isDragon ? 0.16 : isGhost ? 0.22 : isSpider ? 0.19 : 0.24;

  return (
    <group ref={groupRef} scale={[modelScale, modelScale, modelScale]} onPointerDown={(e) => { e.stopPropagation(); setSelectedFish(fish); }}>
      {/* === BODY OUTLINE (cartoon contour) === */}
      <group scale={[bodyScale[0]*1.06, bodyScale[1]*1.06, bodyScale[2]*1.06]}>
        <mesh rotation={[0, 0, -1.57]}>
          <capsuleGeometry args={[0.41, 0.32, 32, 32]} />
          <meshBasicMaterial color={isGhost?'#607080':isLevi?'#042818':isDragon?'#050210':'#1A1A1A'} side={1} />
        </mesh>
      </group>

      {/* === BODY FILL === */}
      <group scale={bodyScale}>
        <mesh castShadow receiveShadow rotation={[0, 0, -1.57]}>
          <capsuleGeometry args={[0.4, 0.3, 32, 32]} />
          <BodyMaterial color={bodyColor} species={sp} />
        </mesh>
      </group>

      {/* === TOP SPECULAR HIGHLIGHT (glossy cartoon sheen) === */}
      <mesh position={[isDragon?0.0:isLevi?0.0:0.0, bodyScale[1]*0.22, 0]}
        scale={[bodyScale[0]*0.75, 0.15, bodyScale[2]*0.55]} rotation={[0,0,-1.57]}>
        <capsuleGeometry args={[0.28, 0.22, 16, 16]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.0} clearcoat={1.0}
          transparent opacity={isGhost?0.1:isLevi?0.08:0.18} />
      </mesh>

      {/* === SCALE TEXTURE ROWS (horizontal ridges for body texture) === */}
      {!isGhost && !isDragon && (
        <group>
          {[-0.12, 0.0, 0.12].map((yOff, si) => (
            <mesh key={`sc-${si}`} position={[0, yOff, 0]}
              rotation={[0, 1.57, 1.57]}
              scale={[bodyScale[1]*0.85 - si*0.08, bodyScale[0]*0.8 - si*0.06, bodyScale[2]*0.95]}>
              <torusGeometry args={[0.35, 0.012, 8, 48]} />
              <meshBasicMaterial color={isLevi?'#063D25':isClown?'#CC5500':isBluetang?'#0E5AAA':isLion?'#5A1A0A':isSpider?'#5A3A1A':'#333333'}
                transparent opacity={0.25} />
            </mesh>
          ))}
        </group>
      )}

      {/* === BELLY GRADIENT (lighter underside) === */}
      {!isGhost && !isLevi && (
        <mesh position={[isDragon?0.1:0, -bodyScale[1]*0.24, 0]}
          scale={[bodyScale[0]*0.72, 0.28, bodyScale[2]*0.62]} rotation={[0,0,-1.57]}>
          <capsuleGeometry args={[0.3, 0.2, 16, 16]} />
          <meshPhysicalMaterial
            color={isClown?'#FFCC88':isBluetang?'#8EC8FF':isDragon?'#1A0A4A':'#FFFFFF'}
            roughness={0.3} clearcoat={1.0} transparent
            opacity={isClown?0.25:isBluetang?0.2:0.15} />
        </mesh>
      )}

      {/* Snout / nose cone for non-basic species */}
      {(isDragon || isGhost || isLevi) && (<group>
        {/* Snout outline */}
        <mesh position={[isDragon?0.9:isGhost?0.85:1.2, isDragon?-0.05:0, 0]} rotation={[0, 0, -1.57]}>
          <coneGeometry args={[(isDragon?0.22:isGhost?0.28:0.35)*1.12, (isDragon?0.7:isGhost?0.8:1.0)*1.06, 16]} />
          <meshBasicMaterial color={isGhost?'#607080':isLevi?'#042818':'#050210'} side={1} />
        </mesh>
        {/* Snout fill */}
        <mesh position={[isDragon?0.9:isGhost?0.85:1.2, isDragon?-0.05:0, 0]} rotation={[0, 0, -1.57]}>
          <coneGeometry args={[isDragon?0.22:isGhost?0.28:0.35, isDragon?0.7:isGhost?0.8:1.0, 16]} />
          <BodyMaterial color={bodyColor} species={sp} />
        </mesh>
      </group>)}

      {/* CLOWNFISH: 3 bold white stripes with black outlines + prominent dorsal fin */}
      {isClown && <>
        {/* 3 white stripes with thick black border — cartoon style */}
        {[0.25, -0.02, -0.28].map((x, i) => (
          <group key={`cs-${i}`}>
            {/* Black border ring */}
            <mesh position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.05 - i * 0.05, 1.0 - i * 0.04, 0.5]}>
              <torusGeometry args={[0.44, 0.13, 32, 64]} /><meshBasicMaterial color="#111111" />
            </mesh>
            {/* White fill ring */}
            <mesh position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.02 - i * 0.05, 0.97 - i * 0.04, 0.48]}>
              <torusGeometry args={[0.44, 0.09, 32, 64]} /><GlossyMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))}
        {/* Tall triangular dorsal fin */}
        <mesh position={[-0.05, 0.52, 0]} rotation={[0,0,-0.15]} scale={[0.7, 0.65, 0.15]}>
          <coneGeometry args={[0.28, 0.9, 4]} /><GlossyMaterial color="#FF8C00" />
        </mesh>
        {/* Small ventral fin */}
        <mesh position={[0.05, -0.48, 0]} rotation={[0,0,0.15]} scale={[0.45, 0.35, 0.12]}>
          <coneGeometry args={[0.22, 0.6, 4]} /><GlossyMaterial color="#FF8C00" />
        </mesh>
        {/* Pectoral fins */}
        <mesh position={[0.1, -0.1, 0.38]} rotation={[0.5, 0.1, -0.6]} scale={[0.7, 0.5, 0.12]}>
          <sphereGeometry args={[0.2, 16, 16]} /><GlossyMaterial color="#FF8C00" />
        </mesh>
        <mesh position={[0.1, -0.1, -0.38]} rotation={[-0.5, -0.1, -0.6]} scale={[0.7, 0.5, 0.12]}>
          <sphereGeometry args={[0.2, 16, 16]} /><GlossyMaterial color="#FF8C00" />
        </mesh>
      </>}

      {/* BLUETANG: black curved mask + yellow rear/tail accent + dorsal/anal fins */}
      {isBluetang && <>
        {/* Dark black curved pattern (the signature mask) */}
        <mesh position={[0.05, 0.05, 0]} rotation={[0, 1.57, 1.57]} scale={[1.0, 0.85, 0.52]}>
          <torusGeometry args={[0.45, 0.07, 16, 32, 3.8]} /><meshBasicMaterial color="#0A0A33" />
        </mesh>
        {/* Yellow spine/caudal accent on rear body */}
        <mesh position={[-0.42, 0.0, 0]} rotation={[0, 0, 0]} scale={[0.18, 0.55, 0.35]}>
          <sphereGeometry args={[0.3, 16, 16]} /><GlossyMaterial color="#FFD700" />
        </mesh>
        {/* Yellow pectoral fin */}
        <mesh position={[0.2, -0.08, 0.3]} rotation={[0.4, 0.2, -0.5]} scale={[0.55, 0.35, 0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} /><GlossyMaterial color="#FFD700" />
        </mesh>
        <mesh position={[0.2, -0.08, -0.3]} rotation={[-0.4, -0.2, -0.5]} scale={[0.55, 0.35, 0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} /><GlossyMaterial color="#FFD700" />
        </mesh>
        {/* Dorsal fin */}
        <mesh position={[-0.05, 0.62, 0]} rotation={[0,0,-0.1]} scale={[1.1, 0.7, 0.1]}>
          <coneGeometry args={[0.28, 0.85, 4]} /><GlossyMaterial color="#1A7DE8" />
        </mesh>
        {/* Anal fin */}
        <mesh position={[-0.05, -0.6, 0]} rotation={[0,0,0.1]} scale={[0.9, 0.6, 0.1]}>
          <coneGeometry args={[0.22, 0.7, 4]} /><GlossyMaterial color="#1A7DE8" />
        </mesh>
      </>}

      {/* SPIDERFISH: compact scorpionfish body, dark horizontal stripes, short dorsal spines */}
      {isSpider && <group>
        {/* Horizontal dark stripes across body */}
        {[-0.25, -0.05, 0.18, 0.38].map((x, i) => (
          <mesh key={`sstr-${i}`} position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[0.95 - i * 0.04, 0.82 - i * 0.03, 0.7]}>
            <torusGeometry args={[0.38, 0.055, 16, 32]} />
            <meshBasicMaterial color="#3D2B1A" />
          </mesh>
        ))}
        {/* Short thick dorsal spines in a row */}
        {[-0.35,-0.2,-0.05,0.1,0.25,0.4].map((x,i) => (
          <mesh key={`dsp-${i}`} position={[x, 0.42, 0]} rotation={[0,0,-0.05+i*0.02]}>
            <cylinderGeometry args={[0.018, 0.008, 0.45+i*0.04]} />
            <GlossyMaterial color="#5A3A22" />
          </mesh>
        ))}
        {/* Pectoral fins — wide fan style */}
        <mesh position={[0.05, -0.1, 0.38]} rotation={[0.3, 0.1, -0.5]} scale={[0.9, 0.55, 0.12]}>
          <sphereGeometry args={[0.22, 16, 16]} /><GlossyMaterial color="#7A5C3A" />
        </mesh>
        <mesh position={[0.05, -0.1, -0.38]} rotation={[-0.3, -0.1, -0.5]} scale={[0.9, 0.55, 0.12]}>
          <sphereGeometry args={[0.22, 16, 16]} /><GlossyMaterial color="#7A5C3A" />
        </mesh>
      </group>}

      {/* LIONFISH: bold stripes + dramatic fan dorsal spines + large wing pectorals */}
      {isLion && <group>
        {/* Vertical body stripes — alternating cream/dark brown */}
        {[0.22, 0.04, -0.14, -0.3].map((x, i) => (
          <mesh key={`ls-${i}`} position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.0-i*0.04, 0.92-i*0.03, 0.45]}>
            <torusGeometry args={[0.42, 0.065, 16, 32]} />
            <GlossyMaterial color={i%2===0 ? '#F5E6D0' : '#7A2E1A'} />
          </mesh>
        ))}
        {/* Dramatic dorsal fan: 14 spines spread in arc */}
        {Array.from({length:14}).map((_,i) => {
          const t = (i-6.5)/7;
          return <mesh key={`dfs-${i}`} position={[-0.4+i*0.065, 0.45, 0]} rotation={[0, 0, t*0.9-0.1]}>
            <cylinderGeometry args={[0.007, 0.018, 1.1-Math.abs(t)*0.3]} />
            <GlossyMaterial color="#8B3A22" />
          </mesh>;
        })}
        {/* Fan membrane between spines — two flat lobes */}
        <mesh position={[-0.15, 0.75, 0]} rotation={[0,0,0]} scale={[0.9, 0.35, 0.06]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshPhysicalMaterial color="#7A2E1A" transparent opacity={0.55} roughness={0.4} />
        </mesh>
        {/* Large wing pectoral fins */}
        {[-1,1].map(s => (
          <mesh key={`wpf-${s}`} position={[0.0, -0.1, s*0.38]} rotation={[s*0.5, 0, -0.3]} scale={[1.0, 0.6, 0.09]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshPhysicalMaterial color="#8B3A22" transparent opacity={0.65} roughness={0.3} />
          </mesh>
        ))}
        {/* Pectoral spines */}
        {[-1,1].map(s => [0,1,2,3].map(j => (
          <mesh key={`ps-${s}-${j}`} position={[-0.05+j*0.06, -0.18, s*(0.28+j*0.06)]} rotation={[s*(0.4+j*0.08), 0, -(0.4+j*0.1)]}>
            <cylinderGeometry args={[0.006, 0.013, 0.75-j*0.04]} />
            <GlossyMaterial color="#8B3A22" />
          </mesh>
        )))}
      </group>}

      {/* DRAGONFISH: bioluminescent lure, large fang teeth, long dark body, glowing dots */}
      {isDragon && <group>
        {/* Lure stalk */}
        <mesh position={[1.0, 0.32, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.007, 0.014, 0.65]} />
          <GlossyMaterial color="#3A006A" />
        </mesh>
        {/* Lure bulb — large glowing */}
        <mesh position={[1.22, 0.62, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshPhysicalMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={4.0} />
        </mesh>
        {/* Fang teeth — bottom jaw */}
        {[-0.14,-0.07,0.0,0.07,0.14].map((z,i) => (
          <mesh key={`bt-${i}`} position={[0.88,-0.14,z]} rotation={[0,0,0.15]}>
            <coneGeometry args={[0.025, 0.14, 4]} />
            <meshBasicMaterial color="#F0F0F0" />
          </mesh>
        ))}
        {/* Fang teeth — top jaw */}
        {[-0.1,-0.03,0.04,0.11].map((z,i) => (
          <mesh key={`tt-${i}`} position={[0.88, 0.06, z]} rotation={[0,0,3.0]}>
            <coneGeometry args={[0.022, 0.11, 4]} />
            <meshBasicMaterial color="#F0F0F0" />
          </mesh>
        ))}
        {/* Bioluminescent body dots */}
        {[-0.8,-0.5,-0.2,0.1,0.4,0.7].map((x,i) => (
          <mesh key={`bd-${i}`} position={[x, i%2===0?0.15:-0.12, 0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshPhysicalMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={2.5} />
          </mesh>
        ))}
        {/* Side wing fins */}
        {[1,-1].map(s => (
          <mesh key={`dw-${s}`} position={[-0.3, 0.0, s*0.32]} rotation={[s*0.45, 0, -0.55]} scale={[1.3, 0.5, 0.07]}>
            <sphereGeometry args={[0.42, 16, 16]} />
            <BodyMaterial color="#1A0A3A" species="dragonfish" />
          </mesh>
        ))}
        {/* Dragonfish scale ridges (dark overlapping arcs) */}
        {[-0.6,-0.3,0.0,0.3,0.6].map((x,i) => (
          <mesh key={`dsr-${i}`} position={[x, 0, 0]} rotation={[0, 1.57, 1.57]}
            scale={[0.55-i*0.02, 0.5-i*0.02, 0.55]}>
            <torusGeometry args={[0.3, 0.015, 8, 32]} />
            <meshBasicMaterial color="#2A0A50" transparent opacity={0.35} />
          </mesh>
        ))}
        {/* Lure glow halo */}
        <mesh position={[1.22, 0.62, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshPhysicalMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1.0} transparent opacity={0.15} />
        </mesh>
      </group>}

      {/* GHOSTSHARK: pearl-white translucent body, pronounced triangular dorsal, gill slits */}
      {isGhost && <group>
        {/* Lateral line (faint) */}
        {[-0.6,-0.3,0.0,0.3,0.6].map((x,i) => (
          <mesh key={`ll-${i}`} position={[x, 0.05, 0.28]} scale={[0.12, 0.04, 0.04]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#B0C8DC" transparent opacity={0.4} />
          </mesh>
        ))}
        {/* Gill slits — visible lines */}
        {[0.0, 0.08, 0.16].map((dx,i) => (
          <mesh key={`gs-${i}`} position={[0.55+dx, 0.0, 0.28]} rotation={[0, 0.3, 0]} scale={[0.018, 0.18, 0.015]}>
            <capsuleGeometry args={[0.2, 0.2, 4, 8]} />
            <meshBasicMaterial color="#90A8BC" />
          </mesh>
        ))}
        {[0.0, 0.08, 0.16].map((dx,i) => (
          <mesh key={`gs2-${i}`} position={[0.55+dx, 0.0, -0.28]} rotation={[0, -0.3, 0]} scale={[0.018, 0.18, 0.015]}>
            <capsuleGeometry args={[0.2, 0.2, 4, 8]} />
            <meshBasicMaterial color="#90A8BC" />
          </mesh>
        ))}
        {/* Inner glow highlight */}
        <mesh position={[0.1, 0.05, 0]} scale={[1.8, 0.5, 0.5]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshPhysicalMaterial color="#FFFFFF" transparent opacity={0.12} roughness={0.0} />
        </mesh>
      </group>}

      {/* LEVIATHAN: emerald green sea dragon, curved horns, body crests, golden eyes, large wings */}
      {isLevi && <group>
        {/* Head horns — large curved */}
        {[0.28,-0.28].map((z,i) => (
          <mesh key={`h-${i}`} position={[1.1, 0.5, z]} rotation={[i===0?0.4:-0.4, 0, -0.5]}>
            <coneGeometry args={[0.08, 0.7, 6]} />
            <BodyMaterial color="#0A7A4A" species="leviathan" />
          </mesh>
        ))}
        {/* Dorsal crests along body — alternating heights */}
        {[-1.4,-1.1,-0.8,-0.5,-0.2,0.1,0.4,0.7,1.0,1.3].map((x,i) => (
          <mesh key={`cr-${i}`} position={[x, 0.5, 0]}>
            <coneGeometry args={[0.06, i%2===0?0.55:0.35, 4]} />
            <BodyMaterial color="#0A5C38" species="leviathan" />
          </mesh>
        ))}
        {/* Glowing teal ring markings */}
        {[-1.2,-0.5,0.2,0.9].map((x,i) => (
          <mesh key={`rg-${i}`} position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[0.85, 0.7, 0.22]}>
            <torusGeometry args={[0.4, 0.025, 16, 32]} />
            <meshPhysicalMaterial color="#00D4AA" emissive="#00D4AA" emissiveIntensity={2.5} />
          </mesh>
        ))}
        {/* Large dragon wings */}
        {[1,-1].map(s => (
          <mesh key={`lw-${s}`} position={[-0.2, 0.1, s*0.6]} rotation={[s*0.4, 0, -0.35]} scale={[1.5, 0.65, 0.07]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <BodyMaterial color="#0A7A4A" species="leviathan" />
          </mesh>
        ))}
        {/* Belly glow patches */}
        {[-0.8,-0.2,0.4,1.0].map((x,i) => (
          <mesh key={`bg-${i}`} position={[x, -0.18, 0.3]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshPhysicalMaterial color="#40E0D0" emissive="#40E0D0" emissiveIntensity={2.0} />
          </mesh>
        ))}
        {/* Leviathan armored scale ridges */}
        {[-1.0,-0.5,0.0,0.5,1.0].map((x,i) => (
          <mesh key={`asr-${i}`} position={[x, -0.05, 0]} rotation={[0, 1.57, 1.57]}
            scale={[0.75-i*0.02, 0.7-i*0.02, 0.8]}>
            <torusGeometry args={[0.38, 0.018, 8, 32]} />
            <meshBasicMaterial color="#063D25" transparent opacity={0.3} />
          </mesh>
        ))}
        {/* Belly glow line */}
        <mesh position={[0.0, -0.32, 0]} scale={[2.8, 0.08, 0.6]} rotation={[0,0,-1.57]}>
          <capsuleGeometry args={[0.2, 0.15, 8, 16]} />
          <meshPhysicalMaterial color="#00D4AA" emissive="#00D4AA" emissiveIntensity={1.2} transparent opacity={0.2} />
        </mesh>
      </group>}

      {/* EYES — large cartoon-style with bright catchlights + dark outline */}
      {[0.34,-0.34].map((z,ei) => (
        <group key={`eye-${ei}`} position={[eyeX,eyeY,z]} rotation={[0,z>0?0.45:-0.45,-0.1]}>
          {/* Eye outline ring */}
          <mesh><sphereGeometry args={[eyeSize*1.15,32,32]} />
            <meshBasicMaterial color={isGhost?'#4A6070':isLevi?'#3A2800':'#111111'} />
          </mesh>
          {/* Sclera */}
          <mesh><sphereGeometry args={[eyeSize,32,32]} />
            <meshPhysicalMaterial
              color={isLevi?'#FFD700':isGhost?'#E0EEF8':'#FFFFFF'}
              roughness={0.05} clearcoat={1.0}
              emissive={isLevi?'#FFB800':'#000'}
              emissiveIntensity={isLevi?1.8:0} />
          </mesh>
          {!isLevi && <>
            {/* Iris */}
            <mesh position={[0.08,0,z>0?0.10:-0.10]}><sphereGeometry args={[eyeSize*0.58,32,32]} />
              <meshPhysicalMaterial color={
                isGhost?'#7AAED0':isDragon?'#5A0090':isSpider?'#7A5A10':isLion?'#8B4500':'#00B8D9'
              } roughness={0.05} clearcoat={1.0} /></mesh>
            {/* Pupil */}
            <mesh position={[0.13,0,z>0?0.13:-0.13]}><sphereGeometry args={[eyeSize*0.32,32,32]} />
              <meshBasicMaterial color={isDragon?'#1A0030':'#000000'} /></mesh>
            {/* Main catchlight */}
            <mesh position={[0.15,0.06,z>0?0.15:-0.15]}><sphereGeometry args={[eyeSize*0.18,16,16]} />
              <meshBasicMaterial color="#FFFFFF" /></mesh>
            {/* Secondary catchlight */}
            <mesh position={[0.16,-0.04,z>0?0.13:-0.13]}><sphereGeometry args={[eyeSize*0.09,8,8]} />
              <meshBasicMaterial color="#FFFFFF" /></mesh>
          </>}
        </group>
      ))}

      {/* Mouth - friendly species only */}
      {!isLevi && !isGhost && !isDragon && (
        <mesh position={[0.55,-0.15,0]} rotation={[0.4,1.57,0]}><torusGeometry args={[0.06,0.02,16,32,3.14]} /><meshBasicMaterial color="#8B0000" /></mesh>
      )}

      {/* Cheeks - friendly species */}
      {(isClown || isBluetang) && <>
        <mesh position={[0.42,-0.05,0.33]}><sphereGeometry args={[0.07,16,16]} /><meshBasicMaterial color="#FF69B4" transparent opacity={0.5} /></mesh>
        <mesh position={[0.42,-0.05,-0.33]}><sphereGeometry args={[0.07,16,16]} /><meshBasicMaterial color="#FF69B4" transparent opacity={0.5} /></mesh>
      </>}

      {/* Tail */}
      <group ref={tailRef} position={[isDragon?-1.2:isLevi?-1.8:isGhost?-1.0:isBluetang?-0.52:-0.65,0,0]}>
        {/* Tail outline */}
        <group position={[-0.2,0,0]} scale={isLevi?[1.35,1.88,0.3]:isGhost?[0.78,1.36,0.14]:isBluetang?[0.58,1.04,0.14]:isDragon?[0.63,0.94,0.14]:[0.88,1.36,0.22]}>
          <mesh>
            {(isGhost||isDragon) ? <coneGeometry args={[0.32, 0.88, 4]} /> : <capsuleGeometry args={[0.22,0.22,16,16]} />}
            <meshBasicMaterial color={isGhost?'#607080':isLevi?'#042818':isDragon?'#050210':'#1A1A1A'} side={1} />
          </mesh>
        </group>
        {/* Tail fill */}
        <group position={[-0.2,0,0]} scale={isLevi?[1.3,1.8,0.28]:isGhost?[0.75,1.3,0.12]:isBluetang?[0.55,1.0,0.12]:isDragon?[0.6,0.9,0.12]:[0.85,1.3,0.2]}>
          <mesh castShadow>
            {(isGhost||isDragon) ? <coneGeometry args={[0.3, 0.85, 4]} /> : <capsuleGeometry args={[0.2,0.2,16,16]} />}
            <BodyMaterial color={aFin} species={sp} />
          </mesh>
          {/* Fin ray lines on tail */}
          {!isGhost && !isDragon && [-0.08, 0.0, 0.08].map((yy, ri) => (
            <mesh key={`tr-${ri}`} position={[-0.05, yy, 0]} rotation={[0,0,1.57]} scale={[0.5, 0.6, 0.8]}>
              <torusGeometry args={[0.15, 0.008, 4, 16]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.12} />
            </mesh>
          ))}
        </group>
        {/* Upper tail lobe — ghostshark heterocercal tail */}
        {isGhost && <mesh position={[-0.4,0.5,0]} rotation={[0,0,-0.4]} scale={[0.32,0.9,0.08]}>
          <coneGeometry args={[0.2,0.65,4]} /><BodyMaterial color={aFin} species="ghostshark" />
        </mesh>}
        {/* Dragonfish forked tail lobes */}
        {isDragon && <>
          <mesh position={[-0.35,0.32,0]} rotation={[0,0,-0.45]} scale={[0.28,0.75,0.08]}>
            <coneGeometry args={[0.18,0.6,4]} /><meshPhysicalMaterial color="#1A4A8A" emissive="#002266" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.35,-0.32,0]} rotation={[0,0,0.45]} scale={[0.28,0.75,0.08]}>
            <coneGeometry args={[0.18,0.6,4]} /><meshPhysicalMaterial color="#1A4A8A" emissive="#002266" emissiveIntensity={0.8} />
          </mesh>
        </>}
      </group>

      {/* Dorsal fin — species-tuned with outline */}
      {!isLion && (<>
        {/* Dorsal outline */}
        <mesh
          position={[isGhost?0.18:isDragon?-0.25:isLevi?0.0:-0.08, isGhost?0.48:isLevi?0.6:0.52, 0]}
          rotation={[0, 0, isGhost?-0.05:isLevi?0.0:-0.25]}
          scale={isGhost?[0.9,1.68,0.12]:isLevi?[1.16,1.26,0.14]:isDragon?[0.74,0.54,0.17]:[1.0,0.9,0.28]}>
          {(isGhost||isLevi) ? <coneGeometry args={[0.32, 1.04, 4]} /> : <sphereGeometry args={[0.27, 32, 32]} />}
          <meshBasicMaterial color={isGhost?'#607080':isLevi?'#042818':isDragon?'#050210':'#1A1A1A'} side={1} />
        </mesh>
        {/* Dorsal fill */}
        <mesh castShadow
          position={[isGhost?0.18:isDragon?-0.25:isLevi?0.0:-0.08, isGhost?0.48:isLevi?0.6:0.52, 0]}
          rotation={[0, 0, isGhost?-0.05:isLevi?0.0:-0.25]}
          scale={isGhost?[0.85,1.6,0.1]:isLevi?[1.1,1.2,0.12]:isDragon?[0.7,0.5,0.15]:[0.95,0.85,0.25]}>
          {(isGhost||isLevi) ? <coneGeometry args={[0.3, 1.0, 4]} /> : <sphereGeometry args={[0.25, 32, 32]} />}
          <BodyMaterial color={aFin} species={sp} />
        </mesh>
      </>)}

      {/* Side fins with outlines */}
      {!isLion && <>
        {/* Fin 1 outline */}
        <mesh position={[isDragon?0.2:0.1,-0.25,0.4]} rotation={[0.4,0.2,-0.7]} scale={isGhost?[1.16,0.54,0.12]:isDragon?[1.06,0.64,0.17]:[1.26,0.86,0.33]}>
          {isGhost ? <coneGeometry args={[0.24,0.68,4]} /> : <sphereGeometry args={[0.17,32,32]} />}
          <meshBasicMaterial color={isGhost?'#607080':isLevi?'#042818':isDragon?'#050210':'#1A1A1A'} side={1} />
        </mesh>
        {/* Fin 1 fill */}
        <mesh castShadow ref={fin1Ref} position={[isDragon?0.2:0.1,-0.25,0.4]} rotation={[0.4,0.2,-0.7]} scale={isGhost?[1.1,0.5,0.1]:isDragon?[1.0,0.6,0.15]:[1.2,0.8,0.3]}>
          {isGhost ? <coneGeometry args={[0.22,0.65,4]} /> : <sphereGeometry args={[0.15,32,32]} />}
          <BodyMaterial color={aFin} species={sp} />
        </mesh>
        {/* Fin 2 outline */}
        <mesh position={[isDragon?0.2:0.1,-0.25,-0.4]} rotation={[-0.4,-0.2,-0.7]} scale={isGhost?[1.16,0.54,0.12]:isDragon?[1.06,0.64,0.17]:[1.26,0.86,0.33]}>
          {isGhost ? <coneGeometry args={[0.24,0.68,4]} /> : <sphereGeometry args={[0.17,32,32]} />}
          <meshBasicMaterial color={isGhost?'#607080':isLevi?'#042818':isDragon?'#050210':'#1A1A1A'} side={1} />
        </mesh>
        {/* Fin 2 fill */}
        <mesh castShadow ref={fin2Ref} position={[isDragon?0.2:0.1,-0.25,-0.4]} rotation={[-0.4,-0.2,-0.7]} scale={isGhost?[1.1,0.5,0.1]:isDragon?[1.0,0.6,0.15]:[1.2,0.8,0.3]}>
          {isGhost ? <coneGeometry args={[0.22,0.65,4]} /> : <sphereGeometry args={[0.15,32,32]} />}
          <BodyMaterial color={aFin} species={sp} />
        </mesh>
      </>}

    </group>
  );
}

