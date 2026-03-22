import { useEffect, useRef } from "react";
import type * as THREE from "three";

interface ExplosionProps {
  position: [number, number, number];
  color: string;
  size: number;
  onComplete: () => void;
}

export function ExplosionEffect({
  position,
  color,
  size,
  onComplete,
}: ExplosionProps) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const duration = 600;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);

      if (outerRef.current) {
        const s = size * (0.1 + t * 1.0);
        outerRef.current.scale.set(s, s, s);
        const mat = outerRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 1 - t;
      }
      if (innerRef.current) {
        const s = size * (0.05 + t * 0.5);
        innerRef.current.scale.set(s, s, s);
        const mat = innerRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - t) * 0.8;
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(tick);
  }, [size, onComplete]);

  return (
    <group position={position}>
      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={1} />
      </mesh>
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <pointLight color={color} intensity={8} distance={size * 20} decay={2} />
    </group>
  );
}
