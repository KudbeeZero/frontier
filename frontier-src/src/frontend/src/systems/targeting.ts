import type { Enemy, OrbitalPosition } from '../types/game'
import { angularDistance } from './orbital'
import { RADAR_RANGE } from '../config/constants'

/**
 * Find the nearest enemy to the player's current position.
 * Returns null if no enemies are within radar range.
 */
export function findNearestEnemy(
  playerPos: OrbitalPosition,
  enemies: Enemy[],
): Enemy | null {
  let nearest: Enemy | null = null
  let nearestDist = RADAR_RANGE

  for (const enemy of enemies) {
    const dist = angularDistance(playerPos, { theta: enemy.theta, phi: enemy.phi })
    if (dist < nearestDist) {
      nearestDist = dist
      nearest = enemy
    }
  }

  return nearest
}

/**
 * Filter enemies within a given angular radius of the player.
 */
export function getEnemiesInRange(
  playerPos: OrbitalPosition,
  enemies: Enemy[],
  range: number,
): Enemy[] {
  return enemies.filter((e) => {
    const dist = angularDistance(playerPos, { theta: e.theta, phi: e.phi })
    return dist <= range
  })
}

/**
 * Compute the angular direction from source to target.
 * Returns { dTheta, dPhi } normalized direction.
 */
export function getDirectionTo(
  source: OrbitalPosition,
  target: OrbitalPosition,
): { dTheta: number; dPhi: number } {
  const dTheta = target.theta - source.theta
  const dPhi = target.phi - source.phi
  const mag = Math.sqrt(dTheta * dTheta + dPhi * dPhi)
  if (mag === 0) return { dTheta: 0, dPhi: 0 }
  return { dTheta: dTheta / mag, dPhi: dPhi / mag }
}
