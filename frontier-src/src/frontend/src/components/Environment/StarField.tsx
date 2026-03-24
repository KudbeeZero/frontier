import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function StarField() {
  const nebulaRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <>
      <Stars
        radius={500}
        depth={60}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      {/* Nebula sphere */}
      <mesh ref={nebulaRef}>
        <sphereGeometry args={[400, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(0.02, 0.05, 0.15)}
          side={THREE.BackSide}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Distant nebula glow */}
      <mesh position={[200, 50, -300]}>
        <sphereGeometry args={[80, 8, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(0.05, 0.02, 0.15)}
          transparent
          opacity={0.08}
        />
      </mesh>
    </>
  );
}
