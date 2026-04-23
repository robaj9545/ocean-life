


import { Float, Outlines, RoundedBox, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Helper for quick outlines fitting the Ocean Life cartoon aesthetic
const Stroke = ({ thickness = 0.05, color = "#1a1a1a", angle }: { thickness?: number, color?: string, angle?: number }) => (
  <Outlines thickness={thickness} color={color} angle={angle} />
);

// Mathematical Physical Ground Collision Engine
export const getSandHeight = (x: number, z: number) => {
  const s1 = { cx: -6, cy: 0.5, cz: -2, r: 4, sy: 0.35 };
  const s2 = { cx: 0, cy: 0.2, cz: -3, r: 6, sy: 0.25 };
  const s3 = { cx: 6, cy: 0.7, cz: -2, r: 4, sy: 0.35 };
  
  let maxY = 0.5; // Base platform top
  [s1, s2, s3].forEach(s => {
    const d2 = (x - s.cx)**2 + (z - s.cz)**2;
    if (d2 < s.r**2) {
       const h = s.cy + s.sy * Math.sqrt(s.r**2 - d2);
       if (h > maxY) maxY = h;
    }
  });
  return -6.5 + maxY;
};

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
  return (
    <group position={[0, -6.5, 0]}>
      {/* Base Platform */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[40, 2, 10]} />
        <EnvMaterial color="#FFB347" roughness={0.8} map={map} />
        <Stroke thickness={0.03} color="#9c6114" />
      </mesh>
      
      {/* Sculpted Sand Dunes — reduced segments for mobile perf */}
      <mesh position={[-6, 0.5, -2]} scale={[1, 0.35, 1]}>
        <sphereGeometry args={[4, 16, 16]} />
        <EnvMaterial color="#FFC300" roughness={0.7} map={map} />
        <Stroke thickness={0.06} color="#b38400" />
      </mesh>
      <mesh position={[0, 0.2, -3]} scale={[1, 0.25, 1]}>
        <sphereGeometry args={[6, 16, 16]} />
        <EnvMaterial color="#FFC300" roughness={0.7} map={map} />
        <Stroke thickness={0.06} color="#b38400" />
      </mesh>
      <mesh position={[6, 0.7, -2]} scale={[1, 0.35, 1]}>
        <sphereGeometry args={[4, 16, 16]} />
        <EnvMaterial color="#FFC300" roughness={0.7} map={map} />
        <Stroke thickness={0.06} color="#b38400" />
      </mesh>

      {/* Scattered Pearls — removed outlines for perf (small objects) */}
      <mesh position={[-2, 0.2, 1]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <EnvMaterial color="#FFF" roughness={0.1} />
      </mesh>
      <mesh position={[-1.6, 0.1, 1.2]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <EnvMaterial color="#FFF" roughness={0.1} />
      </mesh>
      <mesh position={[3, 0.3, 0.5]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <EnvMaterial color="#FFF" roughness={0.1} />
      </mesh>
    </group>
  );
};

// Organic Wavy Coral Tentacle
const WavyCoralTentacle = ({ radiusTop, radiusBottom, length, color, map, bendFrequency = 2, bendAmplitude = 0.2 }: any) => {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 8, 8);
    g.translate(0, length / 2, 0); // Origin at bottom
    const pos = g.attributes.position;
    for(let i=0; i<pos.count; i++) {
       const y = pos.getY(i);
       const progress = y / length;
       const bendX = Math.sin(progress * Math.PI * bendFrequency) * bendAmplitude;
       const bendZ = Math.cos(progress * Math.PI * bendFrequency * 1.5) * bendAmplitude * 0.5;
       pos.setX(i, pos.getX(i) + bendX);
       pos.setZ(i, pos.getZ(i) + bendZ);
    }
    g.computeVertexNormals();
    return g;
  }, [radiusTop, radiusBottom, length, bendFrequency, bendAmplitude]);

  // PERF FIX: Dispose geometry on unmount to prevent memory leaks
  useEffect(() => () => { geo.dispose(); }, [geo]);

  return (
    <mesh geometry={geo}>
      <EnvMaterial color={color} roughness={0.6} map={map} />
      <Stroke thickness={0.04} color="#1a1a1a" />
    </mesh>
  );
};

// Match Image #2: Stunning Vibrant Glossy Corals
const StylizedCoralCluster = ({ position, scale = [1,1,1], mirror = false, map }: any) => {
  const baseGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.2, 16, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const ny = y < -0.4 ? -0.4 : y;
      const noise = Math.sin(pos.getX(i)*4) * Math.cos(pos.getZ(i)*4) * 0.1;
      pos.setXYZ(i, pos.getX(i), ny + noise, pos.getZ(i));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // PERF FIX: Dispose geometry on unmount
  useEffect(() => () => { baseGeo.dispose(); }, [baseGeo]);

  return (
    <Float position={position} rotation={[0, mirror ? Math.PI : 0, 0]} speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      {/* Base blob (Single Mesh instead of 3) */}
      <mesh position={[0, 0, 0]} scale={[1.2 * scale[0], 0.8 * scale[1], 1 * scale[2]]} geometry={baseGeo}>
        <EnvMaterial color="#FF1493" map={map} />
        <Stroke thickness={0.05} />
      </mesh>
      
      {/* Organic Wavy Tubes */}
      <group position={[-0.4 * scale[0], 0.5 * scale[1], -0.2 * scale[2]]} rotation={[0.2, 0, 0.2]} scale={scale}>
         <WavyCoralTentacle radiusTop={0.1} radiusBottom={0.3} length={2.5} color="#FF8C00" map={map} bendFrequency={1.5} bendAmplitude={0.4} />
      </group>
      <group position={[0.4 * scale[0], 0.4 * scale[1], 0.1 * scale[2]]} rotation={[-0.1, 0, -0.3]} scale={scale}>
         <WavyCoralTentacle radiusTop={0.08} radiusBottom={0.25} length={2.0} color="#FFA500" map={map} bendFrequency={2.0} bendAmplitude={0.3} />
      </group>
      <group position={[0.8 * scale[0], 0.2 * scale[1], 0.4 * scale[2]]} rotation={[0.4, 0, -0.5]} scale={scale}>
         <WavyCoralTentacle radiusTop={0.05} radiusBottom={0.2} length={1.5} color="#FF69B4" map={map} bendFrequency={2.5} bendAmplitude={0.2} />
      </group>
    </Float>
  );
}

// Cartoon Polished Rocks - Organic Single Mesh
const CartoonRocks = ({ position, map }: any) => {
  const rockGeo1 = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.2, 16, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
       const x = pos.getX(i);
       const y = pos.getY(i);
       const z = pos.getZ(i);
       const ny = y < -0.6 ? -0.6 : y; // Flatten bottom
       const noise = Math.sin(x * 3) * Math.cos(y * 3) * Math.sin(z * 3) * 0.15;
       pos.setXYZ(i, x + noise, ny + noise, z + noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const rockGeo2 = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.9, 16, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
       const x = pos.getX(i);
       const y = pos.getY(i);
       const z = pos.getZ(i);
       const ny = y < -0.4 ? -0.4 : y; 
       const noise = Math.sin(x * 4) * Math.cos(y * 4) * Math.sin(z * 4) * 0.12;
       pos.setXYZ(i, x + noise, ny + noise, z + noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // PERF FIX: Dispose geometries on unmount
  useEffect(() => () => { rockGeo1.dispose(); rockGeo2.dispose(); }, [rockGeo1, rockGeo2]);

  return (
    <group position={position} scale={[0.7, 0.7, 0.7]}>
       <mesh position={[0, -0.2, 0]} scale={[1.8, 1.2, 1.5]} rotation={[0.2, 0.4, 0]} geometry={rockGeo1}>
         <EnvMaterial color="#4A90E2" roughness={0.8} map={map} />
         <Stroke thickness={0.04} color="#1b416e" angle={Math.PI} />
       </mesh>
       <mesh position={[-1.4, -0.4, 0.5]} scale={[1.3, 1.0, 1.2]} rotation={[-0.2, 0.1, 0.5]} geometry={rockGeo2}>
         <EnvMaterial color="#5DADE2" roughness={0.8} map={map} />
         <Stroke thickness={0.05} color="#1b416e" angle={Math.PI} />
       </mesh>
       <mesh position={[1.0, -0.6, 0.8]} scale={[1.2, 0.8, 1]} rotation={[0.1, -0.3, -0.2]} geometry={rockGeo2}>
         <EnvMaterial color="#3498DB" roughness={0.8} map={map} />
         <Stroke thickness={0.05} color="#1b416e" angle={Math.PI} />
       </mesh>
    </group>
  );
}

// Treasure Chest using rounded geometries for cartoon feel
const StylizedChest = ({ position, map }: any) => {
  const lidRef = useRef<THREE.Group>(null);
  // BUG #8 FIX: Memoize pearl positions to prevent random repositioning on re-render
  const pearlPositions = useMemo(() =>
    [...Array(12)].map(() => [
      Math.random() * 1.8 - 0.9,
      Math.random() * 0.5 + 0.1,
      Math.random() * 1 - 0.2
    ] as [number, number, number]),
  []);
  useFrame((state) => {
    if (lidRef.current) {
        // Slow enchanting opening
        lidRef.current.rotation.x = -0.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group position={position} rotation={[0, -0.2, 0]} scale={[0.75, 0.75, 0.75]}>
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
         
         {/* Individual Pearls scattered — memoized positions */}
         {pearlPositions.map((pos, i) => (
            <mesh key={i} position={pos}>
               <sphereGeometry args={[0.15, 12, 12]} />
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

// Animated Jellyfish
const StylizedJellyfish = ({ position, map }: any) => {
  const ref = useRef<THREE.Group>(null);
  const tentaclesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Bouncy vertical movement
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.8;
      // Rotation
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
    if (tentaclesRef.current) {
      // Tentacles swaying
      tentaclesRef.current.children.forEach((tentacle, i) => {
         tentacle.rotation.x = Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
         tentacle.rotation.z = Math.cos(state.clock.elapsedTime * 2 + i) * 0.2;
      });
    }
  });

  return (
    <group ref={ref} position={position}>
       {/* Dome */}
       <mesh scale={[1.2, 1.0, 1.2]}>
         <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
         <EnvMaterial color="#00FFFF" transparent opacity={0.7} metalness={0.5} roughness={0.1} map={map} />
         <Stroke thickness={0.03} color="#008B8B" />
       </mesh>
       <mesh scale={[1, 0.8, 1]} position={[0, -0.05, 0]}>
         <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
         <EnvMaterial color="#E0FFFF" transparent opacity={0.6} map={map} />
       </mesh>
       {/* Tentacles */}
       <group ref={tentaclesRef}>
         {[...Array(6)].map((_, i) => {
           const a = (i * Math.PI * 2) / 6;
           return (
             <group key={i} position={[Math.cos(a)*0.3, -0.3, Math.sin(a)*0.3]}>
                <TaperedTube radiusTop={0.06} radiusBottom={0.01} length={1.2} color="#E0FFFF" map={map} thickness={0.02} />
             </group>
           )
         })}
       </group>
    </group>
  );
}

// Stylized Crab Walking gently
const StylizedCrab = ({ position, map }: any) => {
  const ref = useRef<THREE.Group>(null);
  const legsRef = useRef<THREE.Group>(null);
  // BUG #11 FIX: Use dedicated refs instead of fragile children[] indices
  const leftClawRef = useRef<THREE.Group>(null);
  const rightClawRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if(ref.current) {
       // Crabs walk sideways! Math determines dynamic X
       const currentX = position[0] + Math.sin(state.clock.elapsedTime * 0.8) * 1.5;
       const currentZ = position[2];
       ref.current.position.x = currentX;
       
       // ROBUST PHYSICS: Always snap exactly to the curved sand surface
       const groundY = getSandHeight(currentX, currentZ);
       // Bobbing
       ref.current.position.y = groundY + Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.05;
       
       // Arm waving — using dedicated refs
       if (leftClawRef.current) leftClawRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2;
       if (rightClawRef.current) rightClawRef.current.rotation.z = -Math.sin(state.clock.elapsedTime * 2.2) * 0.2;
    }
    if(legsRef.current) {
       // Scurrying legs
       legsRef.current.children.forEach((leg, i) => {
          leg.rotation.z = (i < 3 ? 0.3 : -0.3) + Math.sin(state.clock.elapsedTime * 15 + i) * 0.2;
       });
    }
  });

  return (
    <group ref={ref} position={position} scale={[0.6, 0.6, 0.6]}>
       {/* Body */}
       <mesh scale={[1.2, 0.6, 0.9]} position={[0, 0.3, 0]}>
         <icosahedronGeometry args={[0.5, 1]} />
         <EnvMaterial color="#DC143C" roughness={0.7} map={map} flatShading={true} />
         <Stroke thickness={0.04} />
       </mesh>
       {/* Eyes */}
       <mesh position={[-0.2, 0.7, 0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <EnvMaterial color="#DC143C" />
          <mesh position={[0, 0.2, 0.05]}><sphereGeometry args={[0.1, 16, 16]} /><EnvMaterial color="#ffffff" roughness={0.2} /><mesh position={[0,0,0.08]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="#000" /></mesh></mesh>
       </mesh>
       <mesh position={[0.2, 0.7, 0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <EnvMaterial color="#DC143C" />
          <mesh position={[0, 0.2, 0.05]}><sphereGeometry args={[0.1, 16, 16]} /><EnvMaterial color="#ffffff" roughness={0.2} /><mesh position={[0,0,0.08]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="#000" /></mesh></mesh>
       </mesh>
       {/* Claws */}
       <group ref={leftClawRef} position={[-0.6, 0.4, 0.4]} rotation={[0, 0.5, 0.4]}>
          <TaperedTube radiusTop={0.15} radiusBottom={0.05} length={0.6} color="#DC143C" map={map} />
       </group>
       <group ref={rightClawRef} position={[0.6, 0.4, 0.4]} rotation={[0, -0.5, -0.4]}>
          <TaperedTube radiusTop={0.2} radiusBottom={0.05} length={0.8} color="#B22222" map={map} />
       </group>
       {/* Legs */}
       <group ref={legsRef}>
         {[...Array(6)].map((_, i) => {
           const isLeft = i < 3;
           const sideCount = i % 3;
           const xPos = isLeft ? -0.4 : 0.4;
           const zPos = (sideCount - 1) * 0.35 + 0.1;
           const rotZ = isLeft ? 0.3 : -0.3;
           return (
             <group key={i} position={[xPos, 0.15, zPos]} rotation={[0, 0, rotZ]}>
                <TaperedTube radiusTop={0.04} radiusBottom={0.01} length={0.5} color="#B22222" thickness={0.02} map={map} />
             </group>
           )
         })}
       </group>
    </group>
  );
};

// Animated Aquatic Plants (Kelp/Seaweed)
const SeaweedCluster = ({ position, color = '#1B5E20', count = 5, maxHeight = 3.0 }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const blades = useMemo(() => {
    return [...Array(count)].map((_, i) => {
      const h = 1.5 + Math.random() * (maxHeight - 1.5);
      const xOff = (Math.random() - 0.5) * 0.8;
      const zOff = (Math.random() - 0.5) * 0.6;
      const phase = Math.random() * Math.PI * 2;
      const geo = new THREE.CylinderGeometry(0.06, 0.12, h, 8, 12);
      geo.translate(0, h / 2, 0);
      const pos = geo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const y = pos.getY(j);
        const progress = y / h;
        // Organic S-curve
        const bendX = Math.sin(progress * Math.PI * 1.5) * 0.3 * progress;
        pos.setX(j, pos.getX(j) + bendX);
      }
      geo.computeVertexNormals();
      return { geo, xOff, zOff, phase, h };
    });
  }, [count, maxHeight]);

  // PERF FIX: Dispose all blade geometries on unmount
  useEffect(() => () => { blades.forEach(b => b.geo.dispose()); }, [blades]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child: any, i: number) => {
      if (blades[i]) {
        child.rotation.z = Math.sin(t * 1.2 + blades[i].phase) * 0.15;
        child.rotation.x = Math.cos(t * 0.8 + blades[i].phase) * 0.05;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {blades.map((blade, i) => (
        <mesh key={i} geometry={blade.geo} position={[blade.xOff, 0, blade.zOff]}>
          <EnvMaterial color={i % 2 === 0 ? color : '#4CAF50'} roughness={0.7} />
          <Stroke thickness={0.03} color="#0D3B0D" />
        </mesh>
      ))}
    </group>
  );
};

// Organic Starfish using ExtrudeGeometry
const StylizedStarfish = ({ position, rotation = [0,0,0], scale = [1,1,1], map }: any) => {
  const starGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.8;
    const innerRadius = 0.35;
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    
    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
       const x = pos.getX(i);
       const y = pos.getY(i);
       const z = pos.getZ(i);
       // Add a soft curve so it rests nicely on the ground
       const bend = (x*x + y*y) * 0.1;
       pos.setZ(i, z - bend);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // PERF FIX: Dispose geometry on unmount
  useEffect(() => () => { starGeo.dispose(); }, [starGeo]);

  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if(ref.current) {
       // Gentle breathing
       ref.current.scale.z = scale[2] * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
       <mesh geometry={starGeo} rotation={[-Math.PI / 2, 0, 0]}>
         <EnvMaterial color="#FF4500" roughness={0.8} map={map} />
         <Stroke thickness={0.03} color="#8B0000" />
       </mesh>
    </group>
  );
};

// Stylized Shell
const StylizedShell = ({ position, rotation = [0,0,0], scale = [1,1,1], map }: any) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Rigid internal correction to always lay flat on the ground */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0.3, 0, 0]} scale={[1, 0.4, 1.2]}>
          <sphereGeometry args={[0.5, 32, 16, 0, Math.PI]} />
          <EnvMaterial color="#FFB6C1" roughness={0.6} map={map} />
          <Stroke thickness={0.05} />
        </mesh>
        <mesh position={[0, -0.05, 0.2]} rotation={[-0.3, 0, 0]} scale={[1, 0.3, 1.2]}>
          <sphereGeometry args={[0.5, 32, 16, 0, Math.PI]} />
          <EnvMaterial color="#FFF0F5" roughness={0.6} map={map} />
          <Stroke thickness={0.05} />
        </mesh>
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
  const texShell = useTexture(require('../../assets/textures/shell.png'));
  const texCrab = useTexture(require('../../assets/textures/crab.png'));
  const texStarfish = useTexture(require('../../assets/textures/starfish.png'));
  const texJellyfish = useTexture(require('../../assets/textures/jellyfish.png'));

  // Setup texture wrapping to allow repetition in large meshes
  useMemo(() => {
    const allTex = [texSand, texRock, texWood, texCoral, texShell, texCrab, texStarfish, texJellyfish] as THREE.Texture[];
    allTex.forEach(tex => {
       if(tex) {
         tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
       }
    });
    (texSand as THREE.Texture).repeat.set(4, 4);   // scale sand texture smoothly over the big floor
    (texWood as THREE.Texture).repeat.set(1.5, 1);
    (texCoral as THREE.Texture).repeat.set(2, 2);
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
        <StylizedChest position={[3.5, getSandHeight(3.5, -1) + 0.1, -1]} map={texWood} />
        <CartoonRocks position={[-4.0, getSandHeight(-4.0, -1.5) + 0.4, -1.5]} map={texRock} />
        <CartoonRocks position={[7.0, getSandHeight(7.0, -1.0) + 0.5, -1.0]} map={texRock} />
        <StylizedCoralCluster position={[-2.5, getSandHeight(-2.5, -2.5) + 0.3, -2.5]} scale={[0.6, 0.6, 0.6]} map={texCoral} />
        <StylizedCoralCluster position={[5.5, getSandHeight(5.5, -2.5) + 0.5, -2.5]} scale={[0.8, 0.8, 0.8]} mirror={true} map={texCoral} />
        
        {/* Dynamic Physics Creatures */}
        <StylizedCrab position={[-1.0, 0, 1.5]} map={texCrab} />
        <StylizedCrab position={[5.0, 0, 1.0]} map={texCrab} />
        
        <StylizedStarfish position={[-3.5, getSandHeight(-3.5, 0.5) + 0.05, 0.5]} rotation={[0.1, 1.5, 0]} scale={[0.6, 0.6, 0.6]} map={texStarfish} />
        <StylizedStarfish position={[3.0, getSandHeight(3.0, -2.5) + 0.02, -2.5]} rotation={[0, -0.8, 0.1]} scale={[0.4, 0.4, 0.4]} map={texStarfish} />

        <StylizedJellyfish position={[-6.0, getSandHeight(-6.0, -1.0) + 3.0, -1.0]} scale={[0.6, 0.6, 0.6]} map={texJellyfish} />
        <StylizedJellyfish position={[4.0, getSandHeight(4.0, -2.0) + 4.0, -2.0]} scale={[0.5, 0.5, 0.5]} map={texJellyfish} />

        <StylizedShell position={[-1.5, getSandHeight(-1.5, 2.0) + 0.1, 2.0]} rotation={[-0.1, 0.2, 0.1]} scale={[0.4, 0.4, 0.4]} map={texShell} />
        <StylizedShell position={[2.5, getSandHeight(2.5, 1.5) + 0.1, 1.5]} rotation={[0, -1.0, 0]} scale={[0.5, 0.5, 0.5]} map={texShell} />
        <StylizedShell position={[-5.0, getSandHeight(-5.0, 1.0) + 0.05, 1.0]} rotation={[0.2, 2.0, 0]} scale={[0.3, 0.3, 0.3]} map={texShell} />

        {/* Aquatic Plants — Kelp and Seaweed clusters */}
        <SeaweedCluster position={[-6.5, getSandHeight(-6.5, -0.5), -0.5]} color="#1B5E20" count={4} maxHeight={2.5} />
        <SeaweedCluster position={[8.0, getSandHeight(8.0, -1.5), -1.5]} color="#2E7D32" count={6} maxHeight={3.5} />
        <SeaweedCluster position={[-3.0, getSandHeight(-3.0, 1.5), 1.5]} color="#388E3C" count={3} maxHeight={2.0} />
        <SeaweedCluster position={[1.5, getSandHeight(1.5, -3.0), -3.0]} color="#1B5E20" count={5} maxHeight={3.0} />
        <SeaweedCluster position={[6.0, getSandHeight(6.0, 0.5), 0.5]} color="#4CAF50" count={3} maxHeight={2.0} />
      </group>

    </group>
  );
}
