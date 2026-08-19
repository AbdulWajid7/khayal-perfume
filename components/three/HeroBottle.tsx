"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Aura() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.z = t * 0.08;
    meshRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.04);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1.2]}>
      <circleGeometry args={[2.6, 64]} />
      <meshBasicMaterial
        color="#d4af37"
        transparent
        opacity={0.14}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Bottle() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.6) * 0.12;
    groupRef.current.rotation.y = Math.sin(time * 0.25) * 0.2 + pointer.x * 0.25;
    groupRef.current.rotation.x = pointer.y * 0.06;
  });

  return (
    <group ref={groupRef}>
      {/* Warm backlight disc just behind the bottle */}
      <mesh position={[0, 0, -0.95]}>
        <circleGeometry args={[1.35, 64]} />
        <meshBasicMaterial color="#f5d76e" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* Bottle body — lighter glass so it reads against midnight */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.68, 0.76, 1.85, 48]} />
        <meshPhysicalMaterial
          color="#c9a86c"
          transmission={0.9}
          roughness={0.1}
          thickness={1.2}
          ior={1.5}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationColor="#d4af37"
          attenuationDistance={2}
        />
      </mesh>

      {/* Inner glow liquid */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.56, 0.65, 1.35, 48]} />
        <meshPhysicalMaterial
          color="#f5d76e"
          transmission={0.5}
          roughness={0.25}
          thickness={0.8}
          emissive="#d4af37"
          emissiveIntensity={0.55}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.5, 32]} />
        <meshPhysicalMaterial
          color="#c9a86c"
          transmission={0.9}
          roughness={0.1}
          thickness={0.6}
          ior={1.5}
          clearcoat={1}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.36, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 32]} />
        <meshStandardMaterial color="#f5d76e" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Front label */}
      <mesh position={[0, -0.18, 0.7]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.6, 0.38]} />
        <meshStandardMaterial color="#050505" emissive="#d4af37" emissiveIntensity={0.25} />
      </mesh>

      {/* Label type line */}
      <mesh position={[0, -0.18, 0.71]}>
        <planeGeometry args={[0.42, 0.02]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 6]} intensity={2.2} color="#fff4d6" />
      <pointLight position={[-4, -1, 3]} intensity={1.4} color="#f5d76e" />
      <pointLight position={[4, 1, 3]} intensity={1.2} color="#d4af37" />
      <pointLight position={[0, 3, -2]} intensity={0.9} color="#8b7355" />
    </>
  );
}

export default function HeroBottle() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      className="!absolute inset-0"
    >
      <Lights />
      <Aura />
      <Bottle />
    </Canvas>
  );
}
