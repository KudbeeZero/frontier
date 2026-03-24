import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { isMobile } from "../../utils/device";

const NEBULA_COLORS = [
  new THREE.Color(0x0a1a4a),
  new THREE.Color(0x1a0a3a),
  new THREE.Color(0x0a2a3a),
  new THREE.Color(0x2a0a5a),
  new THREE.Color(0x0a103a),
  new THREE.Color(0x150a35),
];

interface NebulaCloud {
  id: string;
  position: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  opacity: number;
  driftX: number;
  driftY: number;
}

function NebulaClouds() {
  const COUNT = isMobile ? 6 : 12;
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const clouds = useMemo<NebulaCloud[]>(() => {
    const result: NebulaCloud[] = [];
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      const r = 120 + Math.random() * 160;
      result.push({
        id: `nc-${i}`,
        position: new THREE.Vector3(
          r * Math.cos(phi) * Math.cos(theta),
          r * Math.sin(phi),
          r * Math.cos(phi) * Math.sin(theta),
        ),
        scale: 50 + Math.random() * 100,
        color: NEBULA_COLORS[i % NEBULA_COLORS.length],
        opacity: 0.1 + Math.random() * 0.2,
        driftX: (Math.random() - 0.5) * 0.008,
        driftY: (Math.random() - 0.5) * 0.005,
      });
    }
    return result;
  }, [COUNT]);

  useFrame((_, delta) => {
    clouds.forEach((cloud, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      cloud.position.x += cloud.driftX * delta * 60;
      cloud.position.y += cloud.driftY * delta * 60;
      if (Math.abs(cloud.position.x) > 300) cloud.driftX *= -1;
      if (Math.abs(cloud.position.y) > 300) cloud.driftY *= -1;
      mesh.position.copy(cloud.position);
    });
  });

  return (
    <>
      {clouds.map((cloud, i) => (
        <mesh
          key={cloud.id}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={cloud.position.clone()}
          scale={cloud.scale}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={cloud.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

export default function StarField() {
  const starCount = isMobile ? 3000 : 8000;

  return (
    <>
      <Stars
        radius={300}
        depth={100}
        count={starCount}
        factor={6}
        saturation={0}
        fade
        speed={0.3}
      />
      <NebulaClouds />
      <mesh>
        <sphereGeometry args={[499, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(0.01, 0.02, 0.06)}
          side={THREE.BackSide}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
