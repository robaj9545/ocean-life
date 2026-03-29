import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Hyper-glossy material mirroring the reference images (Glossy Plastic / Wet toy look)
const GlossyMaterial = ({ color, roughness = 0.2, clearcoat = 1.0 }: any) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={roughness} 
    metalness={0.05} 
    clearcoat={clearcoat} 
    clearcoatRoughness={0.15} 
  />
);

// Match Image #5: Wavy, sculpted golden sand
const WavySandFloor = () => {
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
        <meshStandardMaterial color="#FFB347" roughness={0.8} />
      </mesh>
      {/* Sculpted Sand Dunes (overlapping spheres) */}
      <mesh position={[-6, 0.5, -2]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[4, 32, 32]} />
        <GlossyMaterial color="#FFC300" roughness={0.5} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.2, -3]} scale={[1, 0.3, 1]}>
        <sphereGeometry args={[6, 32, 32]} />
        <GlossyMaterial color="#FFC300" roughness={0.5} clearcoat={0.3} />
      </mesh>
      <mesh position={[6, 0.7, -2]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[4, 32, 32]} />
        <GlossyMaterial color="#FFC300" roughness={0.5} clearcoat={0.3} />
      </mesh>

      {/* Scattered White Pearls / Shells on Sand */}
      <mesh position={[-2, 0.2, 1]}><sphereGeometry args={[0.2, 16, 16]} /><GlossyMaterial color="#FFF" /></mesh>
      <mesh position={[-1.6, 0.1, 1.2]}><sphereGeometry args={[0.15, 16, 16]} /><GlossyMaterial color="#FFF" /></mesh>
      <mesh position={[3, 0.3, 0.5]}><sphereGeometry args={[0.2, 16, 16]} /><GlossyMaterial color="#FFF" /></mesh>
    </group>
  );
};

// Match Image #2: Stunning Vibrant Glossy Corals
const GlossyCoralCluster = ({ position, scale = [1,1,1], mirror = false }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeOffset = useMemo(() => Math.random() * 5, []);
  
  useFrame((state) => {
    if (groupRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 + timeOffset) * 0.03;
        groupRef.current.scale.set(scale[0]*pulse, scale[1]*pulse, scale[2]*pulse);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, mirror ? Math.PI : 0, 0]}>
      {/* Magenta Bubble Base */}
      <mesh position={[0, 0, 0]}><sphereGeometry args={[1.2, 32, 32]} /><GlossyMaterial color="#FF1493" /></mesh>
      <mesh position={[1, -0.2, 0]}><sphereGeometry args={[0.8, 32, 32]} /><GlossyMaterial color="#FF69B4" /></mesh>
      <mesh position={[-0.8, -0.4, 0.5]}><sphereGeometry args={[0.7, 32, 32]} /><GlossyMaterial color="#FF00FF" /></mesh>
      
      {/* Orange Tubes shooting upwards */}
      <mesh position={[-0.5, 1.2, -0.5]} rotation={[0, 0, 0.2]}>
         <cylinderGeometry args={[0.3, 0.2, 2.5, 32]} />
         <GlossyMaterial color="#FF8C00" />
      </mesh>
      <mesh position={[0.4, 1.5, -0.2]} rotation={[0.2, 0, -0.2]}>
         <cylinderGeometry args={[0.25, 0.2, 3, 32]} />
         <GlossyMaterial color="#FFA500" />
      </mesh>

      {/* Pink Anemone Fingers */}
      <mesh position={[1.2, 0.8, 0.5]} rotation={[0, 0, -0.5]}>
         <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
         <GlossyMaterial color="#FF69B4" />
      </mesh>
      <mesh position={[1.5, 0.5, 0.2]} rotation={[0.2, 0, -0.8]}>
         <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
         <GlossyMaterial color="#FFB6C1" />
      </mesh>
    </group>
  );
}

// Match Image #3: Polished Blue Rocks with green shoots
const BluePolishedRocks = ({ position }: any) => {
  return (
    <group position={position}>
       {/* Big central rock */}
       <mesh position={[0, 0, 0]} scale={[1.2, 0.8, 1]} rotation={[0.2, 0.4, 0]}>
         <sphereGeometry args={[1.5, 32, 32]} />
         <GlossyMaterial color="#4A90E2" />
       </mesh>
       {/* Side rock */}
       <mesh position={[-1.4, -0.4, 0.5]} scale={[1, 0.7, 1]} rotation={[-0.2, 0.1, 0.5]}>
         <sphereGeometry args={[1.0, 32, 32]} />
         <GlossyMaterial color="#5DADE2" />
       </mesh>
       {/* Small foreground rock */}
       <mesh position={[1.0, -0.6, 0.8]} scale={[1, 0.6, 1]} rotation={[0.1, -0.3, -0.2]}>
         <sphereGeometry args={[0.8, 32, 32]} />
         <GlossyMaterial color="#3498DB" />
       </mesh>
       
       {/* Tiny green shoots */}
       <mesh position={[-2.2, -0.2, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
          <GlossyMaterial color="#7CFC00" />
       </mesh>
       <mesh position={[1.8, -0.5, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          <GlossyMaterial color="#7CFC00" />
       </mesh>
    </group>
  );
}

// Match Image #1: Overflowing Treasure Chest
const GlossyChest = ({ position }: any) => {
  const lidRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (lidRef.current) {
        // Slow enchanting opening
        lidRef.current.rotation.x = -0.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group position={position} rotation={[0, -0.2, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* Wood Base */}
      <mesh position={[0, 0.6, 0]} scale={[1, 0.8, 0.8]}>
        <boxGeometry args={[2.5, 1.5, 1.5]} />
        <GlossyMaterial color="#8B4513" roughness={0.6} clearcoat={0.2} />
      </mesh>
      
      {/* Gold Rim Bottom */}
      <mesh position={[0, 1.0, 0]} scale={[1.05, 0.2, 0.85]}>
        <boxGeometry args={[2.5, 1.5, 1.5]} />
        <GlossyMaterial color="#FFD700" roughness={0.1} clearcoat={1.0} />
      </mesh>

      {/* Overflowing Gold Coins & Pearls */}
      <group position={[0, 1.2, 0]}>
         {/* Gold Mountain */}
         <mesh position={[0, 0.2, 0]} scale={[1, 0.4, 0.6]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <GlossyMaterial color="#FFD700" roughness={0.2} />
         </mesh>
         
         {/* Individual Pearls */}
         {[...Array(10)].map((_, i) => (
            <mesh key={i} position={[Math.random()*1.8-0.9, Math.random()*0.5+0.2, Math.random()*1-0.2]}>
               <sphereGeometry args={[0.15, 16, 16]} />
               <GlossyMaterial color="#FFFFFF" roughness={0.0} clearcoat={1.0} />
            </mesh>
         ))}
      </group>
      
      {/* Animated Lid Group */}
      <group ref={lidRef} position={[0, 1.1, -0.6]} rotation={[-0.4, 0, 0]}>
         {/* Wood Lid Dome */}
         <mesh position={[0, 0.2, 0.6]} scale={[1, 0.7, 1]} rotation={[0, 0, 1.57]}>
            <cylinderGeometry args={[0.75, 0.75, 2.5, 32]} />
            <GlossyMaterial color="#8B4513" roughness={0.6} clearcoat={0.2} />
         </mesh>
         {/* Gold Rim Lid */}
         <mesh position={[0, 0.2, 0.6]} scale={[1.05, 0.72, 1.05]} rotation={[0, 0, 1.57]}>
            <cylinderGeometry args={[0.75, 0.75, 2.5, 3]} />
            <GlossyMaterial color="#FFD700" roughness={0.1} clearcoat={1.0} />
         </mesh>
         {/* Golden Lockpad */}
         <mesh position={[0, 0.2, 1.4]}>
            <boxGeometry args={[0.4, 0.6, 0.2]} />
            <GlossyMaterial color="#FFD700" roughness={0.1} clearcoat={1.0} />
         </mesh>
      </group>
    </group>
  );
};

// Animated Rising Bubbles
const Bubbles = () => {
  const count = 20;
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
      <GlossyMaterial color="#FFFFFF" roughness={0.0} clearcoat={1.0} />
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
  return (
    <group>
      {/* Intense Glossy Box Lighting with Shadows for Real Contours */}
      <ambientLight intensity={1.0} color="#ffffff" />
      <directionalLight position={[-5, 10, 8]} intensity={2.0} color="#ffffff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[5, 10, -5]} intensity={0.5} color="#aad4ff" />

      <GodRays />
      <Bubbles />

      {/* Procedurally sculpting the reference scenes - SHIFTED UP to prevent camera cut-off on short screens */}
      <group position={[0, 1.8, 0]}>
        <WavySandFloor />
        <GlossyChest position={[3.5, -5.2, -1]} />
        <BluePolishedRocks position={[-4.0, -4.5, -1.5]} />
        <GlossyCoralCluster position={[-2.5, -4.5, -2.5]} scale={[0.8, 0.8, 0.8]} />
        <GlossyCoralCluster position={[5.5, -4.8, -2.5]} scale={[1.2, 1.2, 1.2]} mirror={true} />
      </group>

    </group>
  );
}
