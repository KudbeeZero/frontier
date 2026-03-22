import { Line, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useCameraStore } from "../../stores/cameraStore";
import { useLaneStore } from "../../stores/laneStore";

function generateHexGrid(radius: number, divisions: number) {
  const hexagons: { id: string; points: [number, number, number][] }[] = [];
  const angleStep = Math.PI / divisions;

  for (let lat = 0; lat < divisions; lat++) {
    for (let lon = 0; lon < divisions * 2; lon++) {
      const points: [number, number, number][] = [];
      for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const theta = lat * angleStep + Math.cos(angle) * angleStep * 0.5;
        const phi = lon * angleStep + Math.sin(angle) * angleStep * 0.5;
        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.cos(theta);
        const z = radius * Math.sin(theta) * Math.sin(phi);
        points.push([x, y, z]);
      }
      hexagons.push({ id: `hex-${lat}-${lon}`, points });
    }
  }
  return hexagons;
}

const LANE_RADII: readonly [number, number, number, number, number] = [
  1.6, 1.9, 2.2, 2.5, 2.8,
];

function HexShell({
  radius,
  isActive,
  isOrbital,
}: {
  radius: number;
  isActive: boolean;
  isOrbital: boolean;
}) {
  const hexagons = useMemo(() => generateHexGrid(radius, 6), [radius]);

  // Orbital: bright (0.7 active / 0.2 inactive), Cockpit: very dim (0.08 active / 0.03 inactive)
  const activeOpacity = isOrbital ? 0.75 : 0.08;
  const inactiveOpacity = isOrbital ? 0.2 : 0.03;

  return (
    <>
      {hexagons.map((hex) => (
        <Line
          key={hex.id}
          points={hex.points}
          color={isActive ? "#00ffff" : "#0088cc"}
          lineWidth={isActive ? 1.5 : 0.6}
          transparent
          opacity={isActive ? activeOpacity : inactiveOpacity}
        />
      ))}
    </>
  );
}

export function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const hexGroupRef = useRef<THREE.Group>(null);
  const dayTexture = useTexture("/textures/earth_day.jpg");

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    if (hexGroupRef.current) {
      hexGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  const currentLane = useLaneStore((s) => s.currentLane);
  const cameraMode = useCameraStore((s) => s.mode);
  const isOrbital = cameraMode === "orbital";

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          map={dayTexture}
          roughness={0.8}
          metalness={0.1}
        />

        {/* Atmosphere glow layers */}
        <mesh scale={1.025}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial
            color="#44aaff"
            transparent
            opacity={0.22}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh scale={1.05}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial
            color="#2288ee"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh scale={1.09}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial
            color="#1166cc"
            transparent
            opacity={0.07}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh scale={1.14}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial
            color="#0044aa"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh scale={1.22}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial
            color="#002266"
            transparent
            opacity={0.025}
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>

      {/* 5 concentric hex lane shells — opacity adapts to camera mode */}
      <group ref={hexGroupRef}>
        {LANE_RADII.map((r, i) => (
          <HexShell
            key={r}
            radius={r}
            isActive={i + 1 === currentLane}
            isOrbital={isOrbital}
          />
        ))}
      </group>
    </>
  );
}
