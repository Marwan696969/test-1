import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshDistortMaterial, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';

function InteractiveShape({ color = "#000000" }: { color?: string }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, state.mouse.y * 0.5, 0.1);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, state.mouse.x * 0.5, 0.1);
    mesh.current.position.y = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh} scale={1.2}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0}
          roughness={0.5}
          emissive="#000000"
          emissiveIntensity={1}
        />
      </mesh>
    </Float>
  );
}

function Scene({ color }: { color?: string }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      
      <PresentationControls
        global
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <InteractiveShape color={color} />
      </PresentationControls>

      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.3} 
        scale={10} 
        blur={2} 
        far={4.5} 
      />
      
      <Environment preset="studio" />
    </>
  );
}

export default function Hero3D({ color }: { color?: string }) {
  return (
    <div className="w-full h-[400px] md:h-[500px] relative cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
}
