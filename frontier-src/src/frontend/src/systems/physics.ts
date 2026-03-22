import type { Enemy } from '../types/game'
import { getDirectionTo } from './targeting'
import { stepOrbitalPosition } from './orbital'

/**
 * Update enemy orbital positions, moving them toward Earth (theta=0, phi=0).
 */
export function stepEnemyPhysics(enemies: Enemy[], delta: number): Enemy[] {
  const earthPos = { theta: 0, phi: 0 }

  return enemies.map((enemy) => {
    const enemyPos = { theta: enemy.theta, phi: enemy.phi }
    const dir = getDirectionTo(enemyPos, earthPos)

    const velTheta = dir.dTheta * enemy.speed
    const velPhi = dir.dPhi * enemy.speed

    const newPos = stepOrbitalPosition(
      enemy.theta,
      enemy.phi,
      velTheta,
      velPhi,
      delta,
    )

    return { ...enemy, ...newPos }
  })
}

/**
 * Generate a random spawn position on the outer shell (far from player).
 */
export function randomSpawnPosition(playerTheta: number, playerPhi: number): { theta: number; phi: number } {
  // Spawn on the opposite side of the sphere from the player
  const baseTheta = playerTheta + Math.PI + (Math.random() - 0.5) * Math.PI
  const basePhi = (Math.random() - 0.5) * (Math.PI / 2)
  return { theta: baseTheta, phi: basePhi }
}

/**
 * Simple AABB-style collision check between two orbital positions.
 */
export function checkOrbitalCollision(
  aTheta: number,
  aPhi: number,
  bTheta: number,
  bPhi: number,
  radius: number,
): boolean {
  const dTheta = aTheta - bTheta
  const dPhi = aPhi - bPhi
  return Math.sqrt(dTheta * dTheta + dPhi * dPhi) < radius
}
