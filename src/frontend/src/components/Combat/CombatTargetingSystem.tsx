import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  EARTH_RADIUS,
  groundTargetPosition,
  useGroundTargetStore,
} from "../../stores/groundTargetStore";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { ENEMY_WORLD_RADIUS } from "./Projectile";

const CONE_ANGLE = Math.PI / 4; // 45 degrees half-angle
// Max angular distance (in radians) between camera-to-Earth-surface ray and target to consider it "in reticle"
const GROUND_LOCK_CONE = 0.08;

export function CombatTargetingSystem() {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const { enemies, lockedTarget, setLockedTarget } = useEnemyStore.getState();
    const {
      targets: groundTargets,
      lockedGroundTarget,
      groundLockCandidate,
      setGroundLockCandidate,
      tickGroundLockDwell,
      resetGroundLock,
    } = useGroundTargetStore.getState();

    const camPos = camera.position.clone();
    const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion,
    );

    // ── Enemy targeting (existing logic) ──────────────────────────────────────
    if (enemies.length === 0) {
      if (lockedTarget) setLockedTarget(null);
    } else {
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
    }

    // ── Ground target targeting ───────────────────────────────────────────────
    // Only when no enemy is locked, look for ground targets
    if (!lockedTarget) {
      const aliveTargets = groundTargets.filter(
        (t) => t.status !== "destroyed",
      );

      let bestCandidateId: string | null = null;
      let bestAngle = Number.POSITIVE_INFINITY;

      // Cast ray from camera toward Earth center to find intersection
      const toEarth = new THREE.Vector3(0, 0, 0).sub(camPos).normalize();

      for (const gt of aliveTargets) {
        const [gx, gy, gz] = groundTargetPosition(gt.lat, gt.lon, EARTH_RADIUS);
        const gtPos = new THREE.Vector3(gx, gy, gz);

        // Direction from camera to ground target
        const toGT = gtPos.clone().sub(camPos).normalize();
        const angle = camForward.angleTo(toGT);

        // Also check we're looking toward the planet (not from behind)
        const facingPlanet = camForward.dot(toEarth) > 0.1;
        if (facingPlanet && angle < GROUND_LOCK_CONE && angle < bestAngle) {
          bestAngle = angle;
          bestCandidateId = gt.id;
        }
      }

      if (bestCandidateId !== groundLockCandidate) {
        setGroundLockCandidate(bestCandidateId);
      }

      if (bestCandidateId) {
        tickGroundLockDwell(delta);
      } else if (lockedGroundTarget || groundLockCandidate) {
        // No target in reticle — clear lock if candidate gone
        if (bestCandidateId === null && groundLockCandidate !== null) {
          resetGroundLock();
        }
      }
    } else {
      // Enemy is locked — clear ground lock
      if (useGroundTargetStore.getState().lockedGroundTarget) {
        useGroundTargetStore.getState().resetGroundLock();
      }
    }
  });

  return null;
}
