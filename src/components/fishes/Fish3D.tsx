

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
    if (fish.species === 'clownfish') return { bodyColor: '#FF6A00', stripeColor: '#FFFFFF', finColor: '#FF6A00' };
    if (fish.species === 'bluetang') return { bodyColor: '#1E90FF', stripeColor: '#191970', finColor: '#FFD700' };
    if (fish.species === 'spiderfish') return { bodyColor: '#8B7355', stripeColor: '#F5DEB3', finColor: '#A0826D' };
    if (fish.species === 'lionfish') return { bodyColor: '#B22222', stripeColor: '#FFFFFF', finColor: '#CD5C5C' };
    if (fish.species === 'dragonfish') return { bodyColor: '#2E0854', stripeColor: '#00BFFF', finColor: '#1A0033' };
    if (fish.species === 'ghostshark') return { bodyColor: '#E8E8F0', stripeColor: '#C0D0E0', finColor: '#D0D8E8' };
    if (fish.species === 'leviathan') return { bodyColor: '#0A3D5C', stripeColor: '#00FFFF', finColor: '#0C4A6E' };
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

  let bodyScale: [number, number, number] = [1.4, 1.2, 0.9];
  if (isBluetang) bodyScale = [1.0, 1.5, 0.45];
  else if (isSpider) bodyScale = [1.8, 0.7, 0.6];
  else if (isLion) bodyScale = [1.3, 1.1, 0.85];
  else if (isDragon) bodyScale = [2.4, 0.85, 0.7];
  else if (isGhost) bodyScale = [2.2, 0.85, 0.65];
  else if (isLevi) bodyScale = [3.2, 1.0, 0.9];

  const aFin = isBluetang ? '#FFD700' : finColor;
  const eyeX = isDragon ? 0.85 : isLevi ? 1.0 : isGhost ? 0.85 : isSpider ? 0.6 : 0.48;
  const eyeY = isDragon ? 0.08 : isLevi ? 0.18 : 0.12;
  const eyeSize = isLevi ? 0.15 : isDragon ? 0.17 : isGhost ? 0.2 : 0.22;

  return (
    <group ref={groupRef} scale={[modelScale, modelScale, modelScale]} onPointerDown={(e) => { e.stopPropagation(); setSelectedFish(fish); }}>
      {/* Body */}
      <group scale={bodyScale}>
        <mesh castShadow receiveShadow rotation={[0, 0, -1.57]}>
          <capsuleGeometry args={[0.4, 0.3, 32, 32]} />
          <BodyMaterial color={bodyColor} species={sp} />
        </mesh>
      </group>

      {/* Belly highlight - lighter underside for all */}
      {!isGhost && !isLevi && (
        <mesh position={[isDragon?0.1:0, -0.25, 0]} scale={[bodyScale[0]*0.7, 0.25, bodyScale[2]*0.6]} rotation={[0,0,-1.57]}>
          <capsuleGeometry args={[0.3, 0.2, 16, 16]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={1.0} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Snout / nose cone for non-basic species */}
      {(isDragon || isGhost || isLevi) && (
        <mesh position={[isDragon?0.9:isGhost?0.85:1.2, isDragon?-0.05:0, 0]} rotation={[0, 0, -1.57]}>
          <coneGeometry args={[isDragon?0.22:isGhost?0.28:0.35, isDragon?0.7:isGhost?0.8:1.0, 16]} />
          <BodyMaterial color={bodyColor} species={sp} />
        </mesh>
      )}

      {/* CLOWNFISH: 3 white stripes with black outlines + top/bottom fin */}
      {isClown && <>
        {[0.28, 0, -0.28].map((x, i) => (
          <group key={`cs-${i}`}>
            <mesh position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.0 - i * 0.06, 0.92 - i * 0.04, 0.42]}>
              <torusGeometry args={[0.45, 0.085, 32, 64]} /><GlossyMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[x, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.03 - i * 0.06, 0.95 - i * 0.04, 0.44]}>
              <torusGeometry args={[0.45, 0.1, 32, 64]} /><meshBasicMaterial color="#111" transparent opacity={0.35} />
            </mesh>
          </group>
        ))}
        {/* Top fin */}
        <mesh position={[-0.15, 0.55, 0]} rotation={[0,0,-0.2]} scale={[0.6, 0.5, 0.2]}>
          <sphereGeometry args={[0.3, 16, 16]} /><GlossyMaterial color="#FF8C00" />
        </mesh>
        {/* Bottom fin */}
        <mesh position={[0.0, -0.45, 0]} rotation={[0,0,0.3]} scale={[0.5, 0.35, 0.15]}>
          <sphereGeometry args={[0.25, 16, 16]} /><GlossyMaterial color="#FF8C00" />
        </mesh>
      </>}

      {/* BLUETANG: black curved marking + yellow rear accent + top/bottom fins */}
      {isBluetang && <>
        <mesh position={[-0.08, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[1.15, 1.05, 0.48]}>
          <torusGeometry args={[0.48, 0.03, 16, 32, 4.2]} /><meshBasicMaterial color="#000033" />
        </mesh>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 1.57, 1.57]} scale={[0.8, 0.7, 0.42]}>
          <torusGeometry args={[0.4, 0.07, 32, 64]} /><GlossyMaterial color="#FFD700" />
        </mesh>
        {/* Top dorsal ridge */}
        <mesh position={[-0.1, 0.6, 0]} rotation={[0,0,-0.15]} scale={[1.0, 0.6, 0.12]}>
          <sphereGeometry args={[0.3, 16, 16]} /><GlossyMaterial color="#1874CD" />
        </mesh>
        {/* Bottom anal fin */}
        <mesh position={[-0.1, -0.55, 0]} rotation={[0,0,0.15]} scale={[0.8, 0.5, 0.1]}>
          <sphereGeometry args={[0.25, 16, 16]} /><GlossyMaterial color="#1874CD" />
        </mesh>
      </>}

      {/* SPIDERFISH spots + trailing spines */}
      {isSpider && <group>
        {[[-0.3,0.15],[0.1,-0.1],[-0.1,0.05],[0.3,-0.05]].map(([x,y],i) => (
          <mesh key={`sp-${i}`} position={[x,y,0.25]} scale={[0.8,0.6,0.3]}><sphereGeometry args={[0.1,8,8]} /><GlossyMaterial color="#F5DEB3" /></mesh>
        ))}
        {[-0.4,-0.2,0,0.15,0.3].map((x,i) => (
          <mesh key={`ts-${i}`} position={[x,0.35,0]} rotation={[0,0,-0.8-i*0.1]}><cylinderGeometry args={[0.012,0.004,1.0+i*0.15]} /><GlossyMaterial color="#D2B48C" /></mesh>
        ))}
        {[-0.3,-0.1,0.1,0.25].map((x,i) => (
          <mesh key={`bs-${i}`} position={[x,-0.3,0]} rotation={[0,0,-(2.2+i*0.1)]}><cylinderGeometry args={[0.01,0.004,0.9+i*0.1]} /><GlossyMaterial color="#D2B48C" /></mesh>
        ))}
        {[-0.2,0.0,0.2].map((x,i) => <group key={`ss-${i}`}>
          <mesh position={[x,-0.1,0.3]} rotation={[0.6,0,-(1.2+i*0.15)]}><cylinderGeometry args={[0.01,0.004,0.8]} /><GlossyMaterial color="#D2B48C" /></mesh>
          <mesh position={[x,-0.1,-0.3]} rotation={[-0.6,0,-(1.2+i*0.15)]}><cylinderGeometry args={[0.01,0.004,0.8]} /><GlossyMaterial color="#D2B48C" /></mesh>
        </group>)}
      </group>}

      {/* LIONFISH stripes + fan spines */}
      {isLion && <group>
        {[0.2,0.0,-0.2].map((x,i) => (
          <mesh key={`ls-${i}`} position={[x,0,0]} rotation={[0,1.57,1.57]} scale={[1.05-i*0.05,0.95-i*0.05,0.4]}>
            <torusGeometry args={[0.44,0.045,16,32]} /><GlossyMaterial color="#FFFFFF" />
          </mesh>
        ))}
        {Array.from({length:12}).map((_,i) => (
          <mesh key={`df-${i}`} position={[-0.35+i*0.06,0.5,0]} rotation={[0,0,-0.9+i*0.15]}>
            <cylinderGeometry args={[0.008,0.02,1.3-Math.abs(i-6)*0.06]} /><GlossyMaterial color="#B22222" />
          </mesh>
        ))}
        {[-1,1].map(s => [0,1,2,3,4].map(j => (
          <mesh key={`pf-${s}-${j}`} position={[0.05-j*0.08,-0.25,s*0.35]} rotation={[s*(0.3+j*0.1),0,-(0.5+j*0.15)]}>
            <cylinderGeometry args={[0.008,0.015,0.9-j*0.05]} /><GlossyMaterial color="#CD5C5C" />
          </mesh>
        )))}
      </group>}

      {/* DRAGONFISH lure + teeth + wings */}
      {isDragon && <group>
        <mesh position={[0.95,0.35,0]} rotation={[0,0,-0.35]}><cylinderGeometry args={[0.008,0.015,0.6]} /><GlossyMaterial color="#4B0082" /></mesh>
        <mesh position={[1.15,0.6,0]}><sphereGeometry args={[0.09,16,16]} /><meshPhysicalMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={3.0} /></mesh>
        {[-0.12,-0.04,0.04,0.12].map((z,i) => <group key={`t-${i}`}>
          <mesh position={[0.9,-0.08,z]} rotation={[0,0,0.2]}><coneGeometry args={[0.02,0.08,4]} /><meshBasicMaterial color="#EEE" /></mesh>
          <mesh position={[0.9,0.02,z]} rotation={[0,0,3.0]}><coneGeometry args={[0.02,0.07,4]} /><meshBasicMaterial color="#EEE" /></mesh>
        </group>)}
        {[-0.7,-0.35,0,0.35,0.7].map((x,i) => (
          <mesh key={`b-${i}`} position={[x,i%2===0?0.12:-0.1,0.28]}><sphereGeometry args={[0.035,8,8]} /><meshPhysicalMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={2.0} /></mesh>
        ))}
        {[1,-1].map(s => (
          <mesh key={`w-${s}`} position={[-0.2,0.05,s*0.35]} rotation={[s*0.4,0,-0.6]} scale={[1.2,0.5,0.08]}><sphereGeometry args={[0.45,16,16]} /><BodyMaterial color="#1A0033" species="dragonfish" /></mesh>
        ))}
      </group>}

      {/* GHOSTSHARK: markings + gill slits */}
      {isGhost && <group>
        {[-0.2,0.1,0.4].map((x,i) => (
          <mesh key={`gm-${i}`} position={[x,0.28,0]} scale={[0.3,0.12,0.55]}><sphereGeometry args={[0.3,8,8]} /><meshPhysicalMaterial color="#C0CDD8" roughness={0.2} clearcoat={1.0} transparent opacity={0.35} /></mesh>
        ))}
        {/* Gill slits */}
        {[0.15,0.2,0.25].map((x,i) => (
          <mesh key={`gs-${i}`} position={[0.5,0.05,0.3]} rotation={[0,0.3,0]} scale={[0.02,0.12,0.01]}><capsuleGeometry args={[0.2,0.15,4,8]} /><meshBasicMaterial color="#AAB8C2" /></mesh>
        ))}
        {[0.15,0.2,0.25].map((x,i) => (
          <mesh key={`gs2-${i}`} position={[0.5,0.05,-0.3]} rotation={[0,-0.3,0]} scale={[0.02,0.12,0.01]}><capsuleGeometry args={[0.2,0.15,4,8]} /><meshBasicMaterial color="#AAB8C2" /></mesh>
        ))}
      </group>}

      {/* LEVIATHAN horns + glow + ridges + wings */}
      {isLevi && <group>
        {[0.25,-0.25].map((z,i) => (
          <mesh key={`h-${i}`} position={[1.0,0.4,z]} rotation={[i===0?0.3:-0.3,0,-0.6]}><coneGeometry args={[0.06,0.5,6]} /><BodyMaterial color="#0C4A6E" species="leviathan" /></mesh>
        ))}
        {[-1.3,-0.65,0,0.65,1.3].map((x,i) => (
          <mesh key={`r-${i}`} position={[x,0,0]} rotation={[0,1.57,1.57]} scale={[0.9,0.7,0.25]}><torusGeometry args={[0.42,0.02,16,32]} /><meshPhysicalMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2.0} /></mesh>
        ))}
        {[-1.5,-1.1,-0.7,-0.3,0.1,0.5,0.9,1.3].map((x,i) => (
          <mesh key={`s-${i}`} position={[x,0.48,0]}><coneGeometry args={[0.07,0.35+(i%2)*0.15,4]} /><BodyMaterial color="#0C4A6E" species="leviathan" /></mesh>
        ))}
        {[1,-1].map(s => (
          <mesh key={`wf-${s}`} position={[-0.3,0.1,s*0.55]} rotation={[s*0.35,0,-0.4]} scale={[1.4,0.6,0.08]}><sphereGeometry args={[0.5,16,16]} /><BodyMaterial color={finColor} species="leviathan" /></mesh>
        ))}
        {[-0.9,-0.3,0.3,0.9].map((x,i) => (
          <mesh key={`v-${i}`} position={[x,0.25,0.35]} rotation={[0,0,-0.3]} scale={[0.15,0.08,0.05]}><sphereGeometry args={[0.5,8,8]} /><meshPhysicalMaterial color="#40E0D0" emissive="#40E0D0" emissiveIntensity={1.5} /></mesh>
        ))}
      </group>}

      {/* EYES */}
      {[0.35,-0.35].map((z,ei) => (
        <group key={`eye-${ei}`} position={[eyeX,eyeY,z]} rotation={[0,z>0?0.5:-0.5,-0.15]}>
          {/* White sclera */}
          <mesh><sphereGeometry args={[eyeSize,32,32]} />
            <meshPhysicalMaterial color={isLevi?'#FFD700':isGhost?'#D8E8F0':'#FFFFFF'} roughness={0.1} clearcoat={1.0} emissive={isLevi?'#FFD700':'#000'} emissiveIntensity={isLevi?1.2:0} />
          </mesh>
          {!isLevi && <>
            {/* Iris */}
            <mesh position={[0.07,0,z>0?0.09:-0.09]}><sphereGeometry args={[eyeSize*0.55,32,32]} /><meshPhysicalMaterial color={isGhost?'#B0C4DE':isDragon?'#4A0080':isSpider?'#8B6914':'#00CED1'} roughness={0.1} clearcoat={1.0} /></mesh>
            {/* Pupil */}
            <mesh position={[0.12,0,z>0?0.12:-0.12]}><sphereGeometry args={[eyeSize*0.35,32,32]} /><meshBasicMaterial color={isDragon?'#220044':'#000'} /></mesh>
            {/* Specular highlight */}
            <mesh position={[0.14,0.05,z>0?0.14:-0.14]}><sphereGeometry args={[eyeSize*0.16,16,16]} /><meshBasicMaterial color="#FFF" /></mesh>
            <mesh position={[0.15,-0.03,z>0?0.12:-0.12]}><sphereGeometry args={[eyeSize*0.07,8,8]} /><meshBasicMaterial color="#FFF" /></mesh>
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
      <group ref={tailRef} position={[isDragon?-1.1:isLevi?-1.6:isGhost?-0.9:isBluetang?-0.5:-0.65,0,0]}>
        <group position={[-0.2,0,0]} scale={isLevi?[1.2,1.6,0.3]:isGhost?[0.7,1.2,0.12]:isBluetang?[0.5,0.9,0.12]:[0.8,1.2,0.2]}>
          <mesh castShadow>
            {isGhost ? <coneGeometry args={[0.35,0.9,4]} /> : <capsuleGeometry args={[0.2,0.2,16,16]} />}
            <BodyMaterial color={aFin} species={sp} />
          </mesh>
        </group>
        {/* Upper tail lobe for ghostshark */}
        {isGhost && <mesh position={[-0.35,0.45,0]} rotation={[0,0,-0.4]} scale={[0.3,0.8,0.08]}>
          <coneGeometry args={[0.2,0.6,4]} /><BodyMaterial color={aFin} species="ghostshark" />
        </mesh>}
      </group>

      {/* Dorsal */}
      {!isLion && (
        <mesh castShadow position={[isGhost?0.15:isDragon?-0.3:-0.1,isGhost?0.42:0.5,0]} rotation={[0,0,isGhost?-0.1:-0.3]} scale={isGhost?[0.9,1.4,0.12]:isDragon?[0.8,0.6,0.2]:[1,0.8,0.3]}>
          {isGhost||isLevi ? <coneGeometry args={[0.3,0.9,4]} /> : <sphereGeometry args={[0.25,32,32]} />}
          <BodyMaterial color={aFin} species={sp} />
        </mesh>
      )}

      {/* Side fins */}
      {!isLion && <>
        <mesh castShadow ref={fin1Ref} position={[isDragon?0.2:0.1,-0.25,0.4]} rotation={[0.4,0.2,-0.7]} scale={isGhost?[1.1,0.5,0.1]:isDragon?[1.0,0.6,0.15]:[1.2,0.8,0.3]}>
          {isGhost ? <coneGeometry args={[0.22,0.65,4]} /> : <sphereGeometry args={[0.15,32,32]} />}
          <BodyMaterial color={aFin} species={sp} />
        </mesh>
        <mesh castShadow ref={fin2Ref} position={[isDragon?0.2:0.1,-0.25,-0.4]} rotation={[-0.4,-0.2,-0.7]} scale={isGhost?[1.1,0.5,0.1]:isDragon?[1.0,0.6,0.15]:[1.2,0.8,0.3]}>
          {isGhost ? <coneGeometry args={[0.22,0.65,4]} /> : <sphereGeometry args={[0.15,32,32]} />}
          <BodyMaterial color={aFin} species={sp} />
        </mesh>
      </>}

    </group>
  );
}

