"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const MIST_COUNT = 1800;
const BLOOM_COUNT = 400;
const GOLD_COLOR = "#d4af37";
const AMBER_COLOR = "#b8860b";

function createParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(212, 175, 55, 0.7)");
  gradient.addColorStop(0.35, "rgba(212, 175, 55, 0.25)");
  gradient.addColorStop(0.7, "rgba(184, 134, 11, 0.05)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function MistField() {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { pointer } = useThree();

  const { positions, velocities, opacities } = useMemo(() => {
    const positions = new Float32Array(MIST_COUNT * 3);
    const velocities = new Float32Array(MIST_COUNT * 3);
    const opacities = new Float32Array(MIST_COUNT);

    for (let i = 0; i < MIST_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 14;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;

      velocities[i3] = (Math.random() - 0.5) * 0.0003;
      velocities[i3 + 1] = 0.0008 + Math.random() * 0.0025;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.0003;

      opacities[i] = 0.3 + Math.random() * 0.5;
    }

    return { positions, velocities, opacities };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute(
      "opacityFactor",
      new THREE.BufferAttribute(opacities, 1)
    );
    return geo;
  }, [positions, opacities]);

  const texture = useMemo(() => createParticleTexture(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    mouseRef.current.x = pointer.x;
    mouseRef.current.y = pointer.y;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const time = clock.getElapsedTime();

    const mouseForceX = mouseRef.current.x * 0.0004;
    const mouseForceZ = -mouseRef.current.y * 0.0004;

    for (let i = 0; i < MIST_COUNT; i++) {
      const i3 = i * 3;
      const driftX = Math.sin(time * 0.3 + i * 0.05) * 0.00015;
      const driftZ = Math.cos(time * 0.2 + i * 0.04) * 0.00015;

      posArray[i3] += velocities[i3] + mouseForceX + driftX;
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2] + mouseForceZ + driftZ;

      if (posArray[i3 + 1] > 5) {
        posArray[i3 + 1] = -5;
        posArray[i3] = (Math.random() - 0.5) * 14;
        posArray[i3 + 2] = (Math.random() - 0.5) * 8;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color={GOLD_COLOR}
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        map={texture}
        alphaMap={texture}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ScentBloom() {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, velocities, phases } = useMemo(() => {
    const positions = new Float32Array(BLOOM_COUNT * 3);
    const velocities = new Float32Array(BLOOM_COUNT * 3);
    const phases = new Float32Array(BLOOM_COUNT);

    for (let i = 0; i < BLOOM_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.8;
      const yOffset = (Math.random() - 0.5) * 0.5;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = -2.5 + yOffset;
      positions[i3 + 2] = Math.sin(theta) * radius;

      velocities[i3] = Math.cos(theta) * (0.0005 + Math.random() * 0.0015);
      velocities[i3 + 1] = 0.003 + Math.random() * 0.005;
      velocities[i3 + 2] = Math.sin(theta) * (0.0005 + Math.random() * 0.0015);

      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, velocities, phases };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const texture = useMemo(() => createParticleTexture(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < BLOOM_COUNT; i++) {
      const i3 = i * 3;
      const spread = 1 + (posArray[i3 + 1] + 2.5) * 0.25;
      const spiral = Math.sin(time * 0.5 + phases[i]) * 0.0003 * spread;

      posArray[i3] += velocities[i3] * spread + spiral;
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2] * spread + Math.cos(time * 0.4 + phases[i]) * 0.0002;

      if (posArray[i3 + 1] > 4) {
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.6;
        posArray[i3] = Math.cos(theta) * radius;
        posArray[i3 + 1] = -2.5;
        posArray[i3 + 2] = Math.sin(theta) * radius;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color={AMBER_COLOR}
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
        map={texture}
        alphaMap={texture}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleMist() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      className="absolute inset-0 -z-10"
      gl={{ alpha: true, antialias: false }}
      dpr={[1, 1.5]}
    >
      <MistField />
      <ScentBloom />
    </Canvas>
  );
}
