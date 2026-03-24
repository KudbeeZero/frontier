import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  EARTH_RADIUS,
  groundTargetPosition,
  useGroundTargetStore,
} from "../../stores/groundTargetStore";

/** A single ground installation marker on the Earth surface */
function GroundTargetMesh({ id }: { id: string }) {
  const target = useGroundTargetStore((s) =>
    s.targets.find((t) => t.id === id),
  );
  const lockedId = useGroundTargetStore((s) => s.lockedGroundTarget);
  const flickerRef = useRef(0);
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!target || target.status === "destroyed") return;
    if (target.status === "damaged" && lightRef.current) {
      flickerRef.current += delta * 8;
      lightRef.current.intensity = 0.5 + Math.sin(flickerRef.current) * 0.3;
    }
  });

  if (!target) return null;

  const [bx, by, bz] = groundTargetPosition(target.lat, target.lon);

  // Normal vector pointing outward from Earth center
  const normal = new THREE.Vector3(bx, by, bz).normalize();
  const height = 0.05;
  const cx = bx + normal.x * height;
  const cy = by + normal.y * height;
  const cz = bz + normal.z * height;

  if (target.status === "destroyed") {
    // Scorch mark — flat dark disc
    return (
      <group position={[bx, by, bz]}>
        <mesh
          rotation={[
            Math.atan2(normal.z, normal.y),
            0,
            Math.atan2(normal.x, Math.sqrt(normal.y ** 2 + normal.z ** 2)),
          ]}
        >
          <circleGeometry args={[0.06, 8]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.85} />
        </mesh>
      </group>
    );
  }

  const isLocked = lockedId === id;
  const color =
    target.hp >= target.maxHp * 0.5
      ? "#00ff88"
      : target.hp >= target.maxHp * 0.25
        ? "#ff8800"
        : "#ff2222";

  const glowColor = isLocked ? "#00ffff" : color;

  // Build a quaternion that orients the cone to point outward from Earth
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, normal);

  return (
    <group position={[cx, cy, cz]} quaternion={q}>
      {/* Base platform */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.035, 0.02, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Tower cone */}
      <mesh ref={meshRef} position={[0, 0.025, 0]}>
        <coneGeometry args={[0.015, 0.05, 5]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Glow point light */}
      <pointLight
        ref={lightRef}
        color={glowColor}
        intensity={isLocked ? 1.5 : 0.8}
        distance={0.4}
      />
      {/* Lock ring when targeted */}
      {isLocked && (
        <mesh position={[0, 0.01, 0]}>
          <torusGeometry args={[0.045, 0.006, 4, 12]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

/** Scorch crater for destroyed targets */
function ScorchMark({ lat, lon }: { lat: number; lon: number }) {
  const [bx, by, bz] = groundTargetPosition(lat, lon, EARTH_RADIUS + 0.002);
  return (
    <mesh position={[bx, by, bz]}>
      <circleGeometry args={[0.065, 8]} />
      <meshBasicMaterial color="#1a0800" transparent opacity={0.9} />
    </mesh>
  );
}

export function GroundTargets() {
  const targets = useGroundTargetStore((s) => s.targets);

  return (
    <group>
      {targets.map((t) =>
        t.status === "destroyed" ? (
          <ScorchMark key={t.id} lat={t.lat} lon={t.lon} />
        ) : (
          <GroundTargetMesh key={t.id} id={t.id} />
        ),
      )}
    </group>
  );
}
