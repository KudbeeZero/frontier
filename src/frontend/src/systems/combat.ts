import type { Enemy, WeaponConfig } from '../types/game'
import { WEAPON_MAP } from '../config/weapons'
import { useEnemyStore } from '../stores/useEnemyStore'
import { useWeaponsStore } from '../stores/useWeaponsStore'
import { useGameStore } from '../stores/useGameStore'

/**
 * Attempt to fire the active weapon at a target.
 * Handles cooldown checks, ammo consumption, and damage application.
 * Returns true if the shot was fired.
 */
export function fireWeapon(targetId: string | null): boolean {
  const { activeWeapon, cooldowns, consumeAmmo, setCooldown } = useWeaponsStore.getState()
  const weapon: WeaponConfig | undefined = WEAPON_MAP[activeWeapon]

  if (!weapon) return false
  if ((cooldowns[activeWeapon] ?? 0) > 0) return false

  // Set cooldown
  setCooldown(activeWeapon, 1 / weapon.fireRate)
  consumeAmmo(activeWeapon)

  // Apply damage to locked target if any
  if (targetId) {
    const { damageEnemy, addEnemy: _addEnemy } = useEnemyStore.getState()
    damageEnemy(targetId, weapon.damage)

    // Check if enemy was destroyed (store filters hp <= 0 automatically)
    const enemy = useEnemyStore.getState().enemies.find((e) => e.id === targetId)
    if (!enemy) {
      onEnemyKilled(targetId)
    }
  }

  return true
}

function onEnemyKilled(_id: string) {
  // Enemy config lookup would go here for reward/score
  // For now, grant a flat reward
  useGameStore.getState().addScore(100)
  useGameStore.getState().addCredits(25)
}

/**
 * Check if any enemies have reached Earth (phi/theta within contact radius)
 * and apply damage if so.
 */
export function processEnemyReachEarth(enemies: Enemy[], contactRadius: number): void {
  const { removeEnemy } = useEnemyStore.getState()
  const { damageEarth } = useGameStore.getState()

  for (const enemy of enemies) {
    // Enemies at distance < contactRadius from origin have reached Earth
    const dist = Math.sqrt(enemy.theta * enemy.theta + enemy.phi * enemy.phi)
    if (dist < contactRadius) {
      damageEarth(enemy.damage)
      removeEnemy(enemy.id)
    }
  }
}
