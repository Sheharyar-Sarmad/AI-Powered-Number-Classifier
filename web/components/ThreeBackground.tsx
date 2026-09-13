"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// A rotating particle field that reacts to scroll.
// Brightened to look like stars in a night sky.
function ParticleField({ count = 1200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions in a sphere with per-vertex colors
  const [positions, colors] = useMemo(() => {
    const posArr = new Float32Array(count * 3);
    const colArr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      posArr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      posArr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArr[i * 3 + 2] = radius * Math.cos(phi);

      // Bright star colors: white → pale blue → soft violet
      const tint = Math.random();
      let r, g, b;
      if (tint < 0.6) {
        r = 1.0;
        g = 0.95 + Math.random() * 0.05;
        b = 1.0;
      } else if (tint < 0.85) {
        r = 0.8 + Math.random() * 0.2;
        g = 0.9 + Math.random() * 0.1;
        b = 1.0;
      } else {
        r = 0.9 + Math.random() * 0.1;
        g = 0.8 + Math.random() * 0.2;
        b = 1.0;
      }

      colArr[i * 3] = r;
      colArr[i * 3 + 1] = g;
      colArr[i * 3 + 2] = b;
    }
    return [posArr, colArr];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

    pointsRef.current.rotation.y =
      state.clock.elapsedTime * 0.05 + progress * Math.PI * 2;
    pointsRef.current.rotation.x = progress * 0.5;
    pointsRef.current.rotation.z = state.clock.elapsedTime * 0.02;

    // Brighten on scroll
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    if (mat) {
      mat.size = 0.06 + progress * 0.06;
      mat.opacity = 0.9 + progress * 0.1;
    }
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        vertexColors
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        map={createStarTexture()}
      />
    </Points>
  );
}

//Soft round gradient so points look like glowing stars.
function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.8, "rgba(200,200,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  return new THREE.CanvasTexture(canvas);
}

// A glowing wireframe sphere that pulses with scroll.
function WireframeSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.x = progress * Math.PI;
    const scale = 1 + progress * 0.6;
    meshRef.current.scale.set(scale, scale, scale);

    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.opacity = 0.25 + progress * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.5, 1]} />
      <meshBasicMaterial
        color="#818cf8"
        wireframe
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundColor: "#0a0f2a" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} color="#8090c0" />
        <directionalLight position={[2, 3, 4]} intensity={0.4} color="#b0c0ff" />
        <ParticleField count={1200} />
        <WireframeSphere />
      </Canvas>
    </div>
  );
}