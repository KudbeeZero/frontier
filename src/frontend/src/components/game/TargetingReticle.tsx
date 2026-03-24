import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTargetingStore } from "../../stores/useTargetingStore";

const BRACKET_ANGLES = [0, 90, 180, 270] as const;

export function TargetingReticle() {
  const reticleRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { targetPosition, lockProgress, isLocked } = useTargetingStore();

  useFrame((_, delta) => {
    if (!targetPosition || !reticleRef.current) return;

    const latRad = (targetPosition.lat * Math.PI) / 180;
    const lngRad = (targetPosition.lng * Math.PI) / 180;
    const radius = 1.52;
    const x = radius * Math.cos(latRad) * Math.cos(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lngRad);

    reticleRef.current.position.set(x, y, z);
    reticleRef.current.lookAt(0, 0, 0);
    reticleRef.current.rotateY(Math.PI);

    if (ringRef.current) {
      if (isLocked) {
        const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 0.9;
        ringRef.current.scale.set(pulse, pulse, 1);
      } else {
        ringRef.current.scale.set(1, 1, 1);
      }
    }

    if (!isLocked) {
      useTargetingStore.getState().updateLockProgress(delta);
    }
  });

  if (!targetPosition) return null;

  const color = isLocked ? "#00ff00" : "#00ffff";

  return (
    <group ref={reticleRef}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Progress arc */}
      {!isLocked && lockProgress > 0 && (
        <mesh>
          <ringGeometry
            args={[0.06, 0.08, 32, 1, 0, Math.PI * 2 * lockProgress]}
          />
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Corner brackets */}
      {BRACKET_ANGLES.map((angle) => (
        <group key={angle} rotation={[0, 0, (angle * Math.PI) / 180]}>
          <mesh position={[0.12, 0, 0]}>
            <planeGeometry args={[0.03, 0.01]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
