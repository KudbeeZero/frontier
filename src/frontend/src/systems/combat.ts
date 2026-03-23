import * as THREE from "three";
import { ENEMY_WORLD_RADIUS } from "../components/Combat/Projectile";
import { WEAPON_MAP } from "../config/weapons";
import { useEnemyStore } from "../stores/useEnemyStore";
import { useProjectileStore } from "../stores/useProjectileStore";
import { useWeaponsStore } from "../stores/useWeaponsStore";
import { cameraRef } from "../utils/cameraRef";

/**
 * Called by the FIRE button or spacebar.
 * Spawns a visual projectile in the camera forward direction.
 * Returns true if a shot was fired.
 */
export function handleFireButton(): boolean {
  const { activeWeapon, cooldowns, setCooldown, consumeAmmo, ammo } =
    useWeaponsStore.getState();

  if ((cooldowns[activeWeapon] ?? 0) > 0) return false;
  if ((ammo[activeWeapon] ?? 0) <= 0) return false;

  const weapon = WEAPON_MAP[activeWeapon];
  if (!weapon) return false;

  // All enemies go hostile when player fires
  useEnemyStore.getState().setAllHostile();

  const { addProjectile } = useProjectileStore.getState();
  const lockedTarget = useEnemyStore.getState().lockedTarget;

  if (activeWeapon === "rail") {
    // Instant hitscan — damage locked target immediately
    if (lockedTarget) {
      useEnemyStore.getState().damageEnemy(lockedTarget, weapon.damage);
    }
    // Spawn a brief visual beam (damage already applied or no target)
    addProjectile({
      position: [cameraRef.posX, cameraRef.posY, cameraRef.posZ],
      direction: [cameraRef.forwardX, cameraRef.forwardY, cameraRef.forwardZ],
      speed: 300,
      damage: 0,
      weaponType: "rail",
      color: "#ffffff",
      maxLifetime: 0.15,
    });
    setCooldown(activeWeapon, 1 / weapon.fireRate);
    consumeAmmo(activeWeapon);
    return true;
  }

  if (activeWeapon === "missile") {
    // Requires a locked target
    if (!lockedTarget) return false;
    const enemy = useEnemyStore
      .getState()
      .enemies.find((e) => e.id === lockedTarget);
    if (!enemy) return false;

    const dist = enemy.distance ?? ENEMY_WORLD_RADIUS;
    const tx = dist * Math.cos(enemy.phi) * Math.cos(enemy.theta);
    const ty = dist * Math.sin(enemy.phi);
    const tz = dist * Math.cos(enemy.phi) * Math.sin(enemy.theta);
    const targetPos = new THREE.Vector3(tx, ty, tz);
    const fromPos = new THREE.Vector3(
      cameraRef.posX,
      cameraRef.posY,
      cameraRef.posZ,
    );
    const dir = targetPos.clone().sub(fromPos).normalize();

    addProjectile({
      position: [fromPos.x, fromPos.y, fromPos.z],
      direction: [dir.x, dir.y, dir.z],
      speed: weapon.speed,
      damage: weapon.damage,
      weaponType: "missile",
      color: weapon.color,
      maxLifetime: 6,
      targetId: lockedTarget,
    });

    setCooldown(activeWeapon, 1 / weapon.fireRate);
    consumeAmmo(activeWeapon);
    return true;
  }

  // Pulse — fast burst with distance-based spread
  const distanceToTarget = (() => {
    const locked = useEnemyStore.getState().lockedTarget;
    const e = locked
      ? useEnemyStore.getState().enemies.find((en) => en.id === locked)
      : null;
    return e ? (e.distance ?? 80) : 40;
  })();

  const baseSpread = 0.03;
  const distanceFactor = Math.min(distanceToTarget / 80, 1);
  const spread = baseSpread + distanceFactor * 0.06;

  // Primary bolt
  addProjectile({
    position: [cameraRef.posX, cameraRef.posY, cameraRef.posZ],
    direction: [cameraRef.forwardX, cameraRef.forwardY, cameraRef.forwardZ],
    speed: weapon.speed,
    damage: weapon.damage,
    weaponType: activeWeapon,
    color: weapon.color,
    maxLifetime: 3,
  });

  // Two spread bolts
  for (let i = 0; i < 2; i++) {
    const offsetX = (Math.random() - 0.5) * spread;
    const offsetY = (Math.random() - 0.5) * spread;
    const dir = new THREE.Vector3(
      cameraRef.forwardX + offsetX,
      cameraRef.forwardY + offsetY,
      cameraRef.forwardZ,
    ).normalize();
    addProjectile({
      position: [cameraRef.posX, cameraRef.posY, cameraRef.posZ],
      direction: [dir.x, dir.y, dir.z],
      speed: weapon.speed,
      damage: Math.floor(weapon.damage * 0.5),
      weaponType: activeWeapon,
      color: weapon.color,
      maxLifetime: 2.5,
    });
  }

  setCooldown(activeWeapon, 1 / weapon.fireRate);
  consumeAmmo(activeWeapon);
  return true;
}
