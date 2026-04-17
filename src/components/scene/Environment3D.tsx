


import { Outlines, RoundedBox, Float, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Helper for quick outlines fitting the Segredos do Mar cartoon aesthetic
const Stroke = ({ thickness = 0.05, color = "#1a1a1a", angle }: { thickness?: number, color?: string, angle?: number }) => (
  <Outlines thickness={thickness} color={color} angle={angle} />
);

// Base Material with optional texture map
const EnvMaterial = ({ color, roughness = 0.5, metalness = 0.1, flatShading = false, map, ...props }: any) => (
  <meshStandardMaterial 
    color={color} 
    roughness={roughness} 
    metalness={metalness} 
    flatShading={flatShading}
    map={map}
    {...props} 
  />
);

// Stylized Tube with Tapering (Afunilamento - Shape Language)
const TaperedTube = ({ radiusTop, radiusBottom, length, color, thickness=0.04, map }: any) => (
  <group>
    {/* Main tapered body */}
    <mesh>
      <cylinderGeometry args={[radiusTop, radiusBottom, length, 16]} />
      <EnvMaterial color={color} roughness={0.6} map={map} />
      <Stroke thickness={thickness} color="#1a1a1a" />
    </mesh>
    {/* Rounded caps to soften edges (Bevel/Smoothing logic) */}
    <mesh position={[0, length/2, 0]}>
      <sphereGeometry args={[radiusTop, 16, 16]} />
      <EnvMaterial color={color} roughness={0.6} map={map} />
    </mesh>
    <mesh position={[0, -length/2, 0]}>
      <sphereGeometry args={[radiusBottom, 16, 16]} />
      <EnvMaterial color={color} roughness={0.6} map={map} />
    </mesh>
  </group>
);

// Match Image #5: Wavy, sculpted golden sand
const WavySandFloor = ({ map }: any) => {
  const sandRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (sandRef.current) {
      sandRef.current.position.y = -6.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={sandRef} position={[0, -6.5, 0]}>
      {/* Base Platform */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[40, 2, 10]} />
        <EnvMaterial color="#FFB347" roughness={0.8} map={map} />
        <Stroke thickness={0.03} color="#9c6114" />
      </mesh>
      
      {/* Sculpted Sand Dunes (overlapping squeezed spheres) */}
      <mesh position={[-6, 0.5, -2]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[4, 32, 32]} />
        <EnvMaterial color="#FFC300" roughness={0.7} map={map} />
        <Stroke thickness={0.06} color="#b38400" />
      </mesh>
      <mesh position={[0, 0.2, -3]} scale={[1, 0.3, 1]}>
        <sphereGeometry args={[6, 32, 32]} />
        <EnvMaterial color="#FFC300" roughness={0.7} map={map} />
        <Stroke thickness={0.06} color="#b38400" />
      </mesh>
      <mesh position={[6, 0.7, -2]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[4, 32, 32]} />
        <EnvMaterial color="#FFC300" roughness={0.7} map={map} />
        <Stroke thickness={0.06} color="#b38400" />
      </mesh>

      {/* Scattered White Pearls / Shells on Sand */}
      <mesh position={[-2, 0.2, 1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <EnvMaterial color="#FFF" roughness={0.1} />
        <Stroke thickness={0.02} color="#000" />
      </mesh>
      <mesh position={[-1.6, 0.1, 1.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <EnvMaterial color="#FFF" roughness={0.1} />
        <Stroke thickness={0.02} color="#000" />
      </mesh>
      <mesh position={[3, 0.3, 0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <EnvMaterial color="#FFF" roughness={0.1} />
        <Stroke thickness={0.02} color="#000" />
      </mesh>
    </group>
  );
};

// Match Image #2: Stunning Vibrant Glossy Corals
const StylizedCoralCluster = ({ position, scale = [1,1,1], mirror = false, map }: any) => {
  return (
    <Float position={position} rotation={[0, mirror ? Math.PI : 0, 0]} speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      {/* Base blobs */}
      <mesh position={[0, 0, 0]} scale={scale}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <EnvMaterial color="#FF1493" map={map} />
        <Stroke thickness={0.05} />
      </mesh>
      <mesh position={[1 * scale[0], -0.2 * scale[1], 0]} scale={scale}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <EnvMaterial color="#FF69B4" map={map} />
        <Stroke thickness={0.05} />
      </mesh>
      <mesh position={[-0.8 * scale[0], -0.4 * scale[1], 0.5 * scale[2]]} scale={scale}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <EnvMaterial color="#FF00FF" map={map} />
        <Stroke thickness={0.05} />
      </mesh>
      
      {/* Orange Tubes - with Tapering toward the top */}
      <group position={[-0.5 * scale[0], 1.2 * scale[1], -0.5 * scale[2]]} rotation={[0, 0, 0.2]} scale={scale}>
         <TaperedTube radiusTop={0.15} radiusBottom={0.35} length={1.8} color="#FF8C00" map={map} />
      </group>
      <group position={[0.4 * scale[0], 1.5 * scale[1], -0.2 * scale[2]]} rotation={[0.2, 0, -0.2]} scale={scale}>
         <TaperedTube radiusTop={0.1} radiusBottom={0.25} length={2.2} color="#FFA500" map={map} />
      </group>

      {/* Pink Anemone Fingers - smaller, tapered */}
      <group position={[1.2 * scale[0], 0.8 * scale[1], 0.5 * scale[2]]} rotation={[0, 0, -0.5]} scale={scale}>
         <TaperedTube radiusTop={0.08} radiusBottom={0.2} length={1.2} color="#FF69B4" map={map} />
      </group>
      <group position={[1.5 * scale[0], 0.5 * scale[1], 0.2 * scale[2]]} rotation={[0.2, 0, -0.8]} scale={scale}>
         <TaperedTube radiusTop={0.05} radiusBottom={0.15} length={0.9} color="#FFB6C1" map={map} />
      </group>
    </Float>
  );
}

// Cartoon Polished Rocks - Using flatShading and precise geometry
const CartoonRocks = ({ position, map }: any) => {
  return (
    <group position={position}>
       {/* Big central rock: Icosahedron + flatShading = Sharp Faceted Style like Sea of Thieves */}
       <mesh position={[0, 0, 0]} scale={[1.8, 1.2, 1.5]} rotation={[0.2, 0.4, 0]}>
         <icosahedronGeometry args={[1.2, 1]} />
         <EnvMaterial color="#4A90E2" roughness={0.8} flatShading={true} map={map} />
         <Stroke thickness={0.05} color="#1b416e" angle={Math.PI} />
       </mesh>
       {/* Side rock */}
       <mesh position={[-1.4, -0.2, 0.5]} scale={[1.3, 1.0, 1.2]} rotation={[-0.2, 0.1, 0.5]}>
         <icosahedronGeometry args={[0.9, 0]} />
         <EnvMaterial color="#5DADE2" roughness={0.8} flatShading={true} map={map} />
         <Stroke thickness={0.06} color="#1b416e" angle={Math.PI} />
       </mesh>
       {/* Small foreground rock */}
       <mesh position={[1.0, -0.4, 0.8]} scale={[1.2, 0.8, 1]} rotation={[0.1, -0.3, -0.2]}>
         <icosahedronGeometry args={[0.7, 0]} />
         <EnvMaterial color="#3498DB" roughness={0.8} flatShading={true} map={map} />
         <Stroke thickness={0.06} color="#1b416e" angle={Math.PI} />
       </mesh>
       
       {/* Tiny green shoots - Asymmetrical Tapered */}
       <group position={[-2.2, 0.2, 0]} rotation={[0, 0, -0.3]}>
          <TaperedTube radiusTop={0.02} radiusBottom={0.08} length={0.6} color="#7CFC00" thickness={0.04} />
       </group>
       <group position={[1.8, -0.1, 0]} rotation={[0, 0, 0.4]}>
          <TaperedTube radiusTop={0.03} radiusBottom={0.1} length={0.4} color="#7CFC00" thickness={0.04} />
       </group>
    </group>
  );
}

// Treasure Chest using rounded geometries for cartoon feel
const StylizedChest = ({ position, map }: any) => {
  const lidRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (lidRef.current) {
        // Slow enchanting opening
        lidRef.current.rotation.x = -0.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group position={position} rotation={[0, -0.2, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* Wood Base Box */}
      <RoundedBox position={[0, 0.6, 0]} args={[2.5, 1.5, 1.5]} radius={0.1} smoothness={4}>
        <EnvMaterial color="#8B4513" roughness={0.8} map={map} />
        <Stroke thickness={0.03} />
      </RoundedBox>
      
      {/* Gold Rim Bottom */}
      <RoundedBox position={[0, 1.25, 0]} args={[2.6, 0.2, 1.6]} radius={0.05} smoothness={4}>
        <EnvMaterial color="#FFD700" roughness={0.2} metalness={0.6} />
        <Stroke thickness={0.03} />
      </RoundedBox>

      {/* Overflowing Gold Coins & Pearls */}
      <group position={[0, 1.4, 0]}>
         {/* Gold Mountain / Core Treasure */}
         <mesh position={[0, 0.2, 0]} scale={[1, 0.4, 0.6]}>
            <dodecahedronGeometry args={[1.2, 2]} />
            <EnvMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
         </mesh>
         
         {/* Individual Pearls scattered */}
         {[...Array(12)].map((_, i) => (
            <mesh key={i} position={[Math.random()*1.8-0.9, Math.random()*0.5+0.1, Math.random()*1-0.2]}>
               <sphereGeometry args={[0.15, 16, 16]} />
               <EnvMaterial color="#FFFFFF" roughness={0.1} />
               <Stroke thickness={0.02} />
            </mesh>
         ))}
      </group>
      
      {/* Animated Lid Group */}
      <group ref={lidRef} position={[0, 1.35, -0.6]} rotation={[-0.4, 0, 0]}>
         {/* Wood Lid Dome */}
         <mesh position={[0, 0.0, 0.6]} rotation={[0, 0, 1.57]}>
            <cylinderGeometry args={[0.75, 0.75, 2.5, 32, 1, false, 0, Math.PI]} />
            <EnvMaterial color="#8B4513" roughness={0.8} map={map} />
            <Stroke thickness={0.03} angle={0.2} />
         </mesh>
         {/* Base line for dome to avoid hole */}
         <mesh position={[0, 0.0, 0.6]}>
            <boxGeometry args={[2.5, 0.1, 1.5]} />
            <EnvMaterial color="#8B4513" roughness={0.8} map={map} />
         </mesh>
         {/* Gold Rim Lid */}
         <RoundedBox position={[0, -0.05, 0.6]} args={[2.6, 0.15, 1.55]} radius={0.05} smoothness={4}>
            <EnvMaterial color="#FFD700" roughness={0.2} metalness={0.6} />
            <Stroke thickness={0.03} />
         </RoundedBox>
         {/* Golden Lockpad */}
         <RoundedBox position={[0, 0.1, 1.4]} rotation={[0, 0, 0]} args={[0.5, 0.6, 0.2]} radius={0.05} smoothness={4}>
            <EnvMaterial color="#FFD700" roughness={0.2} metalness={0.6} />
            <Stroke thickness={0.03} />
         </RoundedBox>
      </group>
    </group>
  );
};

// Animated Rising Bubbles
const Bubbles = () => {
  const count = 25;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
         x: (Math.random() - 0.5) * 14,
         y: (Math.random() - 0.5) * 10 - 5,
         z: Math.random() * 2 - 3,
         speed: Math.random() * 0.8 + 0.3,
         scale: Math.random() * 0.15 + 0.05,
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.y += p.speed * delta * 2;
      p.x += Math.sin(state.clock.elapsedTime * 2 + p.speed * 10) * 0.01;
      if (p.y > 6) p.y = -6;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <EnvMaterial color="#FFFFFF" roughness={0.0} transparent opacity={0.6} />
    </instancedMesh>
  );
};

// Soft Caustic Lights
const GodRays = () => {
  const raysRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (raysRef.current) {
        raysRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 1;
        raysRef.current.children.forEach((ray: any, i) => {
           ray.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.05;
        });
    }
  });
  return (
    <group ref={raysRef} position={[0, 2, -5]}>
      <mesh position={[-4, 0, 0]} rotation={[0, 0, -0.4]}><planeGeometry args={[3, 16]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[2, 0, 0]} rotation={[0, 0, -0.3]}><planeGeometry args={[4, 18]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[6, 0, 0]} rotation={[0, 0, -0.5]}><planeGeometry args={[2, 14]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  );
};

export default function Environment3D() {
  // Load generated textures dynamically
  const texSand = useTexture(require('../../assets/textures/sand.png'));
  const texRock = useTexture(require('../../assets/textures/rock.png'));
  const texWood = useTexture(require('../../assets/textures/wood.png'));
  const texCoral = useTexture(require('../../assets/textures/coral.png'));

  // Setup texture wrapping to allow repetition in large meshes
  useMemo(() => {
    [texSand, texRock, texWood, texCoral].forEach(tex => {
       if(tex) {
         tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
       }
    });
    texSand.repeat.set(4, 4);   // scale sand texture smoothly over the big floor
    texWood.repeat.set(1.5, 1);
    texCoral.repeat.set(2, 2);
  }, [texSand, texRock, texWood, texCoral]);

  return (
    <group>
      {/* Beautiful lighting to emphasize the cartoon materials and outlines */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 10, 8]} intensity={2.2} color="#ffffff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[5, 10, -5]} intensity={0.8} color="#88ccff" />

      <GodRays />
      <Bubbles />

      {/* Procedurally sculpting the reference scenes - SHIFTED UP to prevent camera cut-off on short screens */}
      <group position={[0, 2.0, 0]}>
        <WavySandFloor map={texSand} />
        <StylizedChest position={[3.5, -5.2, -1]} map={texWood} />
        <CartoonRocks position={[-4.0, -4.5, -1.5]} map={texRock} />
        <StylizedCoralCluster position={[-2.5, -4.5, -2.5]} scale={[0.8, 0.8, 0.8]} map={texCoral} />
        <StylizedCoralCluster position={[5.5, -4.8, -2.5]} scale={[1.2, 1.2, 1.2]} mirror={true} map={texCoral} />
      </group>

    </group>
  );
}
