import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ENEMY_CONFIG_MAP } from "../../config/enemies";
import { WEAPON_MAP } from "../../config/weapons";
import { useGameStore } from "../../stores/gameStore";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { useExplosionStore } from "../../stores/useExplosionStore";
import type { WeaponId } from "../../types/game";

// Visual size multiplier so enemies are big enough to hit at game scale
const ENEMY_VISUAL_SCALE = 10;
// Enemy spawn radius (units from origin)
export const ENEMY_WORLD_RADIUS = 80;

interface ProjectileProps {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  damage: number;
  color: string;
  maxLifetime: number;
  weaponType: WeaponId;
  targetId?: string;
  onExpire: (id: string) => void;
  onHit: (id: string) => void;
}

export function Projectile({
  id,
  position,
  direction,
  speed,
  damage,
  color,
  maxLifetime,
  weaponType,
  targetId,
  onExpire,
  onHit,
}: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3(...position));
  const dirRef = useRef(new THREE.Vector3(...direction).normalize());
  const ageRef = useRef(0);
  const hitRef = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || hitRef.current) return;

    ageRef.current += delta;
    if (ageRef.current > maxLifetime) {
      onExpire(id);
      return;
    }

    // Missile homing: curve direction toward target
    if (weaponType === "missile" && targetId) {
      const enemy = useEnemyStore
        .getState()
        .enemies.find((e) => e.id === targetId);
      if (enemy) {
        const dist = enemy.distance ?? ENEMY_WORLD_RADIUS;
        const tx = dist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
        const ty = dist * Math.sin(enemy.phi);
        const tz = dist * Math.cos(enemy.phi) * Math.sin(enemy.theta);
        const targetVec = new THREE.Vector3(tx, ty, tz);
        const toTarget = targetVec.clone().sub(posRef.current).normalize();
        dirRef.current.lerp(toTarget, delta * 3).normalize();
      }
    }

    // Move projectile
    posRef.current.addScaledVector(dirRef.current, speed * delta);
    meshRef.current.position.copy(posRef.current);

    // Collision check against enemies
    const { enemies, damageEnemy } = useEnemyStore.getState();
    for (const enemy of enemies) {
      const cfg = ENEMY_CONFIG_MAP[enemy.type];
      if (!cfg) continue;

      const dist = enemy.distance ?? ENEMY_WORLD_RADIUS;
      const ex = dist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
      const ey = dist * Math.sin(enemy.phi);
      const ez = dist * Math.cos(enemy.phi) * Math.sin(enemy.theta);

      const hitRadius = cfg.scale * ENEMY_VISUAL_SCALE * 0.6;
      const dx = posRef.current.x - ex;
      const dy = posRef.current.y - ey;
      const dz = posRef.current.z - ez;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (d < hitRadius) {
        hitRef.current = true;
        damageEnemy(enemy.id, damage);

        // Trigger explosion at impact point
        useExplosionStore
          .getState()
          .addExplosion(new THREE.Vector3(ex, ey, ez));

        // Check if enemy was destroyed
        const stillAlive = useEnemyStore
          .getState()
          .enemies.find((e) => e.id === enemy.id);
        if (!stillAlive) {
          const cfg2 = ENEMY_CONFIG_MAP[enemy.type];
          if (cfg2) {
            useGameStore.getState().addCredits(cfg2.reward);
            useGameStore.getState().addScore(cfg2.scoreValue);
            useGameStore
              .getState()
              .addNotification(
                `+${cfg2.scoreValue} pts — ${cfg2.label} destroyed!`,
                "success",
              );
          }
        }

        onHit(id);
        return;
      }
    }
  });

  // Rail gun: show as a bright elongated beam
  const isRail = weaponType === "rail";

  return (
    <mesh ref={meshRef} position={position}>
      {isRail ? (
        <cylinderGeometry args={[0.05, 0.05, 4, 4]} />
      ) : (
        <sphereGeometry args={[0.3, 6, 6]} />
      )}
      <meshBasicMaterial color={color} />
      <pointLight
        color={color}
        intensity={isRail ? 4 : 2}
        distance={isRail ? 12 : 8}
      />
    </mesh>
  );
}
