import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

function FloatingOrganic({ position, color, speed, distort, radius }: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  const matRef = useRef<any>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.position.y += Math.sin(t * speed) * 0.002;
    mesh.current.rotation.x += 0.001;
    mesh.current.rotation.z += 0.001;

    if (color && typeof color.get === 'function') {
      const c = color.get();
      matRef.current.color.set(c);
      matRef.current.emissive.set(c);
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={mesh} position={position} args={[radius, 64, 64]}>
        <MeshDistortMaterial
          ref={matRef}
          color={typeof color === 'string' ? color : "#000000"}
          speed={distort}
          distort={0.4}
          radius={1}
          metalness={0.1}
          roughness={0.5}
          emissive={typeof color === 'string' ? color : "#000000"}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

function Scene({ color, offset }: { color?: any, offset?: any }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (offset && typeof offset.get === 'function') {
      groupRef.current.position.x = offset.get();
    }
  });

  return (
    <group ref={groupRef}>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      
      <FloatingOrganic 
        position={[-4, 2, -2]} 
        color={color} 
        speed={2} 
        distort={2} 
        radius={1.2} 
      />
      <FloatingOrganic 
        position={[3, -1, -3]} 
        color={color} 
        speed={1.5} 
        distort={1.5} 
        radius={0.8} 
      />
      <FloatingOrganic 
        position={[0, 3, -5]} 
        color={color} 
        speed={1} 
        distort={3} 
        radius={0.5} 
      />
      
      <Environment preset="studio" />
    </group>
  );
}

export default function Surreal3D({ color, offset }: { color?: any, offset?: any }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
      <Canvas shadows dpr={[1, 2]}>
        <Scene color={color} offset={offset} />
      </Canvas>
    </div>
  );
}
