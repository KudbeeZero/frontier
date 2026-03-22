import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ENEMY_TYPES } from "../../config/enemies";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { ImpactEffect } from "./ImpactEffect";

function EnemyMesh({
  enemy,
}: { enemy: ReturnType<typeof useEnemyStore.getState>["enemies"][0] }) {
  const config = ENEMY_TYPES[enemy.type];
  const latRad = (enemy.position.lat * Math.PI) / 180;
  const lngRad = (enemy.position.lng * Math.PI) / 180;
  const r = 1.53;

  const position: [number, number, number] = [
    r * Math.cos(latRad) * Math.cos(lngRad),
    r * Math.sin(latRad),
    r * Math.cos(latRad) * Math.sin(lngRad),
  ];

  const healthPercent = enemy.health / enemy.maxHealth;
  const opacity = enemy.status === "destroyed" ? 0.25 : 1;
  const healthColor =
    healthPercent > 0.5
      ? "#00ff00"
      : healthPercent > 0.25
        ? "#ffff00"
        : "#ff0000";

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[config.size, config.size, config.size]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={enemy.status === "destroyed" ? 0 : 0.4}
          transparent
          opacity={opacity}
        />
      </mesh>

      {enemy.status === "active" && (
        <pointLight color={config.color} intensity={0.3} distance={0.3} />
      )}

      {enemy.status === "active" && healthPercent < 1 && (
        <mesh position={[0, config.size * 1.2, 0]}>
          <planeGeometry args={[config.size, config.size * 0.12]} />
          <meshBasicMaterial
            color={healthColor}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export function EnemyLayer() {
  const enemies = useEnemyStore((s) => s.enemies);
  const impacts = useEnemyStore((s) => s.impacts);
  const removeImpact = useEnemyStore((s) => s.removeImpact);
  const spawned = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only spawn
  useEffect(() => {
    if (spawned.current) return;
    spawned.current = true;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => useEnemyStore.getState().spawnEnemy(), i * 1500);
    }
  }, []);

  useFrame((_, delta) => {
    useEnemyStore.getState().tick(delta * 1000);
  });

  return (
    <>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
      {impacts.map((impact) => (
        <ImpactEffect
          key={impact.id}
          position={impact.position}
          color={impact.color}
          onComplete={() => removeImpact(impact.id)}
        />
      ))}
    </>
  );
}
