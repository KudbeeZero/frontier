import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import type { Mesh } from "three";

interface ExplosionProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

export function Explosion({ position, onComplete }: ExplosionProps) {
  const outerRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);
  const lifetime = useRef(0);
  const [done, setDone] = useState(false);

  useFrame((_, delta) => {
    if (done) return;
    lifetime.current += delta;
    const progress = Math.min(lifetime.current / 0.5, 1);
    const scale = 0.1 + progress * 3;
    const opacity = 1 - progress;

    if (outerRef.current) {
      outerRef.current.scale.setScalar(scale);
      const mat = outerRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * 0.6;
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(scale * 0.5);
      const mat = innerRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity;
    }

    if (progress >= 1) {
      setDone(true);
      onComplete();
    }
  });

  if (done) return null;

  return (
    <group position={position}>
      {/* Outer wireframe ring */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>

      {/* Inner solid core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={1} />
      </mesh>

      {/* Flash light */}
      <pointLight color="#ff6600" intensity={10} distance={15} />
    </group>
  );
}
