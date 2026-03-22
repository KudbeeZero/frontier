import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ENEMY_CONFIG_MAP, PHASE_ENEMY_POOL } from "../../config/enemies";
import { useEnemyStore } from "../../stores/useEnemyStore";
import type { Enemy, EnemyType } from "../../types/game";
import { ENEMY_WORLD_RADIUS } from "./Projectile";

const ENEMY_VISUAL_SCALE = 10;
const MAX_ENEMIES = 6;
const SPAWN_INTERVAL = 10; // seconds

let nextId = 1;
let spawnTimer = 0;

function getWavePool(wave: number): EnemyType[] {
  const clamped = Math.min(Math.max(wave, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
  return (PHASE_ENEMY_POOL[clamped] ?? PHASE_ENEMY_POOL[1]) as EnemyType[];
}

function spawnEnemy(wave: number) {
  const pool = getWavePool(wave);
  const type = pool[Math.floor(Math.random() * pool.length)];
  const cfg = ENEMY_CONFIG_MAP[type];
  if (!cfg) return;

  const enemy: Enemy = {
    id: `enemy-${nextId++}-${Date.now()}`,
    type,
    theta: Math.random() * Math.PI * 2,
    phi: (Math.random() - 0.5) * Math.PI * 0.4,
    distance: ENEMY_WORLD_RADIUS,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    damage: cfg.damage,
    reward: cfg.reward,
    scoreValue: cfg.scoreValue,
  };

  useEnemyStore.getState().addEnemy(enemy);
}

function EnemyMesh({ enemy }: { enemy: Enemy }) {
  // All hooks at the top -- before any conditional returns
  const groupRef = useRef<THREE.Group>(null);

  const cfg = ENEMY_CONFIG_MAP[enemy.type];

  useFrame((state) => {
    if (!groupRef.current || !cfg) return;

    const currentDist = enemy.distance ?? ENEMY_WORLD_RADIUS;
    const enemyPos = new THREE.Vector3(
      currentDist * Math.cos(enemy.phi) * Math.cos(enemy.theta),
      currentDist * Math.sin(enemy.phi),
      currentDist * Math.cos(enemy.phi) * Math.sin(enemy.theta),
    );

    // Direction toward player
    const playerPos = state.camera.position.clone();
    const toPlayer = playerPos.sub(enemyPos).normalize();

    // Direction toward Earth (origin)
    const toEarth = enemyPos.clone().normalize().negate();

    // Blend: 70% toward Earth, 30% toward player
    const direction = toEarth.lerp(toPlayer, 0.3).normalize();

    // Use actual delta for accurate movement
    const newPos = enemyPos.addScaledVector(
      direction,
      cfg.speed * state.clock.getDelta(),
    );

    enemy.distance = newPos.length();
    enemy.theta = Math.atan2(newPos.z, newPos.x);
    enemy.phi = Math.asin(Math.max(-1, Math.min(1, newPos.y / enemy.distance)));

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
          emissiveIntensity={0.25}
        />
      </mesh>
      <pointLight color={cfg.color} intensity={0.6} distance={size * 4} />
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
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (useEnemyStore.getState().enemies.length < MAX_ENEMIES) {
          spawnEnemy(useEnemyStore.getState().wave);
        }
      }, i * 1800);
    }
  }, []);

  useFrame((_, delta) => {
    spawnTimer += delta;
    if (spawnTimer >= SPAWN_INTERVAL) {
      spawnTimer = 0;
      const state = useEnemyStore.getState();
      if (state.enemies.length < MAX_ENEMIES) {
        spawnEnemy(state.wave);
      }
    }
  });

  return (
    <>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}
