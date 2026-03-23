import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { ENEMY_WORLD_RADIUS } from "./Projectile";

const CONE_ANGLE = Math.PI / 4; // 45 degrees half-angle

export function CombatTargetingSystem() {
  const { camera } = useThree();

  useFrame(() => {
    const { enemies, lockedTarget, setLockedTarget } = useEnemyStore.getState();

    if (enemies.length === 0) {
      if (lockedTarget) setLockedTarget(null);
      return;
    }

    const camPos = camera.position.clone();
    const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion,
    );

    let nearestId: string | null = null;
    let nearestDist = Number.POSITIVE_INFINITY;

    for (const enemy of enemies) {
      const dist = enemy.distance ?? ENEMY_WORLD_RADIUS;
      const ex = dist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
      const ey = dist * Math.sin(enemy.phi);
      const ez = dist * Math.cos(enemy.phi) * Math.sin(enemy.theta);
      const enemyPos = new THREE.Vector3(ex, ey, ez);

      const toEnemy = enemyPos.clone().sub(camPos);
      const distToEnemy = toEnemy.length();
      const dirToEnemy = toEnemy.clone().normalize();

      const angle = camForward.angleTo(dirToEnemy);
      if (angle <= CONE_ANGLE && distToEnemy < nearestDist) {
        nearestDist = distToEnemy;
        nearestId = enemy.id;
      }
    }

    // Update enemy distance field for HUD display
    for (const enemy of enemies) {
      const dist = enemy.distance ?? ENEMY_WORLD_RADIUS;
      const ex = dist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
      const ey = dist * Math.sin(enemy.phi);
      const ez = dist * Math.cos(enemy.phi) * Math.sin(enemy.theta);
      const enemyPos = new THREE.Vector3(ex, ey, ez);
      enemy.distance = enemyPos.distanceTo(camPos);
    }

    if (nearestId !== lockedTarget) {
      setLockedTarget(nearestId);
    }
  });

  return null;
}
