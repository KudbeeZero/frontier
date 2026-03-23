import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { ENEMY_CONFIG_MAP, PHASE_ENEMY_POOL } from "../../config/enemies";
import { useEnemyStore } from "../../stores/useEnemyStore";
import type { Enemy, EnemyType } from "../../types/game";
import { ENEMY_WORLD_RADIUS } from "./Projectile";

const ENEMY_VISUAL_SCALE = 10;

let nextId = 1;

function getWavePool(wave: number): EnemyType[] {
  const clamped = Math.min(Math.max(wave, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
  return (PHASE_ENEMY_POOL[clamped] ?? PHASE_ENEMY_POOL[1]) as EnemyType[];
}

function spawnInitialEnemies() {
  const pool = getWavePool(1);
  // Spread 6 enemies evenly around the asteroid field (lane 3)
  for (let i = 0; i < 6; i++) {
    const type = pool[i % pool.length];
    const cfg = ENEMY_CONFIG_MAP[type];
    if (!cfg) continue;

    const enemy: Enemy = {
      id: `enemy-${nextId++}-${Date.now() + i}`,
      type,
      theta: (i / 6) * Math.PI * 2 + Math.random() * 0.4,
      phi: (Math.random() - 0.5) * Math.PI * 0.35,
      distance: ENEMY_WORLD_RADIUS,
      hp: cfg.hp,
      maxHp: cfg.hp,
      speed: cfg.speed,
      damage: cfg.damage,
      reward: cfg.reward,
      scoreValue: cfg.scoreValue,
      hostile: false,
    };

    useEnemyStore.getState().addEnemy(enemy);
  }
}

function EnemyMesh({ enemy }: { enemy: Enemy }) {
  const groupRef = useRef<THREE.Group>(null);
  const isLocked = useEnemyStore((s) => s.lockedTarget === enemy.id);

  const cfg = ENEMY_CONFIG_MAP[enemy.type];

  useFrame((state, delta) => {
    if (!groupRef.current || !cfg) return;

    const currentDist = enemy.distance ?? ENEMY_WORLD_RADIUS;

    if (!enemy.hostile) {
      // Patrol: slowly orbit at fixed radius
      enemy.theta += delta * enemy.speed * 0.3;

      const x = currentDist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
      const y = currentDist * Math.sin(enemy.phi);
      const z = currentDist * Math.cos(enemy.phi) * Math.sin(enemy.theta);

      groupRef.current.position.set(x, y, z);
      groupRef.current.lookAt(0, 0, 0);

      // Range check: become hostile when player gets close
      const camPos = state.camera.position;
      const distToPlayer = Math.sqrt(
        (camPos.x - x) ** 2 + (camPos.y - y) ** 2 + (camPos.z - z) ** 2,
      );
      if (distToPlayer < 40) {
        useEnemyStore.getState().setEnemyHostile(enemy.id);
      }
      return;
    }

    // Hostile behavior: advance toward player/Earth
    const enemyPos = new THREE.Vector3(
      currentDist * Math.cos(enemy.phi) * Math.cos(enemy.theta),
      currentDist * Math.sin(enemy.phi),
      currentDist * Math.cos(enemy.phi) * Math.sin(enemy.theta),
    );

    const playerPos = state.camera.position.clone();
    const toPlayer = playerPos.sub(enemyPos).normalize();
    const toEarth = enemyPos.clone().normalize().negate();
    const direction = toEarth.lerp(toPlayer, 0.3).normalize();

    // Use a fixed delta cap to avoid large jumps
    const dt = Math.min(delta, 0.05);
    const newPos = enemyPos.addScaledVector(direction, cfg.speed * dt);

    enemy.distance = newPos.length();
    enemy.theta = Math.atan2(newPos.z, newPos.x);
    enemy.phi = Math.asin(
      Math.max(-1, Math.min(1, newPos.y / (enemy.distance || 1))),
    );

    groupRef.current.position.copy(newPos);
    groupRef.current.lookAt(0, 0, 0);

    if (enemy.distance < 10) {
      useEnemyStore.getState().removeEnemy(enemy.id);
    }
  });

  if (!cfg) return null;

  const size = cfg.scale * ENEMY_VISUAL_SCALE;
  const dist = enemy.distance ?? ENEMY_WORLD_RADIUS;
  const x = dist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
  const y = dist * Math.sin(enemy.phi);
  const z = dist * Math.cos(enemy.phi) * Math.sin(enemy.theta);

  const hpPct = enemy.hp / enemy.maxHp;
  const hpBarFill = Math.max(0, hpPct);
  const barColor =
    hpPct > 0.5 ? "#00ff44" : hpPct > 0.25 ? "#ffaa00" : "#ff3333";

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[size, size, size * 1.4]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={enemy.hostile ? 0.5 : 0.15}
        />
      </mesh>
      <pointLight color={cfg.color} intensity={0.6} distance={size * 4} />

      {/* Cyan lock-on ring */}
      {isLocked && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.9, size * 0.06, 8, 32]} />
          <meshBasicMaterial
            color="#00ffff"
            wireframe={false}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* HP bar background */}
      <mesh position={[0, size * 0.9, 0]}>
        <planeGeometry args={[size * 1.2, size * 0.12]} />
        <meshBasicMaterial
          color="#111"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* HP bar fill */}
      <mesh position={[(size * 1.2 * (hpBarFill - 1)) / 2, size * 0.9, 0.02]}>
        <planeGeometry args={[size * 1.2 * hpBarFill, size * 0.12]} />
        <meshBasicMaterial
          color={barColor}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function EnemyLayer() {
  const { enemies } = useEnemyStore();

  useEffect(() => {
    // Spawn 6 enemies immediately on mount
    if (useEnemyStore.getState().enemies.length === 0) {
      spawnInitialEnemies();
    }
  }, []);

  return (
    <>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}
