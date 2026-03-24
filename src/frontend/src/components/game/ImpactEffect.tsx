import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ImpactEffectProps {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}

export function ImpactEffect({
  position,
  color,
  onComplete,
}: ImpactEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const done = useRef(false);

  useEffect(() => {
    startTime.current = Date.now();
    done.current = false;
  }, []);

  useFrame(() => {
    if (done.current || !meshRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 500; // 0..1 over 500ms
    if (elapsed >= 1) {
      done.current = true;
      onComplete();
      return;
    }
    const scale = 0.05 + elapsed * 0.35;
    meshRef.current.scale.setScalar(scale);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 1 - elapsed;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
