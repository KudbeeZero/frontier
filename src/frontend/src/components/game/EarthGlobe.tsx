import { useTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTargetingStore } from "../../stores/useTargetingStore";

export function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);

  const [dayMap, nightMap] = useTexture([
    "/textures/earth_day.jpg",
    "/textures/earth_night.png",
  ]);

  dayMap.anisotropy = 4;
  nightMap.anisotropy = 4;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!meshRef.current) return;

    const localPoint = meshRef.current.worldToLocal(event.point.clone());
    const lat = Math.asin(localPoint.y / 1.5);
    const lng = Math.atan2(localPoint.z, localPoint.x);
    const latDeg = (lat * 180) / Math.PI;
    const lngDeg = (lng * 180) / Math.PI;

    useTargetingStore.getState().setTarget(latDeg, lngDeg);
  };

  const handleContextMenu = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    useTargetingStore.getState().clearTarget();
  };

  return (
    <group>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 3D canvas mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          emissiveMap={nightMap}
          emissive="#ffffff"
          emissiveIntensity={0.35}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.57, 32, 32]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
