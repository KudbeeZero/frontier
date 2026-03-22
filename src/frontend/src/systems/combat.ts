import * as THREE from "three";
import { WEAPON_MAP } from "../config/weapons";
import { useProjectileStore } from "../stores/useProjectileStore";
import { useWeaponsStore } from "../stores/useWeaponsStore";
import { cameraRef } from "../utils/cameraRef";

/**
 * Called by the FIRE button or spacebar.
 * Spawns a visual projectile in the camera forward direction.
 */
export function handleFireButton(): boolean {
  const { activeWeapon, cooldowns, setCooldown, consumeAmmo, ammo } =
    useWeaponsStore.getState();

  // Check cooldown
  if ((cooldowns[activeWeapon] ?? 0) > 0) return false;

  // Check ammo (pulse has Infinity)
  if ((ammo[activeWeapon] ?? 0) <= 0) return false;

  const weapon = WEAPON_MAP[activeWeapon];
  if (!weapon) return false;

  // Spawn projectile from current camera position in camera forward direction
  const { addProjectile } = useProjectileStore.getState();
  addProjectile({
    position: [cameraRef.posX, cameraRef.posY, cameraRef.posZ],
    direction: [cameraRef.forwardX, cameraRef.forwardY, cameraRef.forwardZ],
    speed: weapon.speed,
    damage: weapon.damage,
    weaponType: activeWeapon,
    color: weapon.color,
    maxLifetime: 4,
  });

  // Spacebar fires burst of 3 for pulse
  if (activeWeapon === "pulse") {
    const spread = 0.04;
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
        maxLifetime: 3,
      });
    }
  }

  // Apply cooldown and consume ammo
  setCooldown(activeWeapon, 1 / weapon.fireRate);
  consumeAmmo(activeWeapon);

  return true;
}
