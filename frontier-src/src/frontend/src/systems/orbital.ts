import type { OrbitalPosition } from '../types/game'
import { ANGULAR_DRAG, MAX_ANGULAR_VEL } from '../config/constants'

/**
 * Convert orbital (theta, phi) to Cartesian coordinates at a given radius.
 */
export function orbitalToCartesian(
  theta: number,
  phi: number,
  radius: number,
): [number, number, number] {
  const x = radius * Math.cos(phi) * Math.cos(theta)
  const y = radius * Math.sin(phi)
  const z = radius * Math.cos(phi) * Math.sin(theta)
  return [x, y, z]
}

/**
 * Angular distance between two orbital positions (great-circle).
 */
export function angularDistance(a: OrbitalPosition, b: OrbitalPosition): number {
  const dTheta = a.theta - b.theta
  const dPhi = a.phi - b.phi
  return Math.sqrt(dTheta * dTheta + dPhi * dPhi)
}

/**
 * Apply drag and clamp velocity, returning new velocity values.
 */
export function applyOrbitalDrag(
  velTheta: number,
  velPhi: number,
): { velTheta: number; velPhi: number } {
  let vt = velTheta * ANGULAR_DRAG
  let vp = velPhi * ANGULAR_DRAG
  const mag = Math.sqrt(vt * vt + vp * vp)
  if (mag > MAX_ANGULAR_VEL) {
    const scale = MAX_ANGULAR_VEL / mag
    vt *= scale
    vp *= scale
  }
  return { velTheta: vt, velPhi: vp }
}

/**
 * Advance position by velocity * delta, clamping phi to [-PI/2, PI/2].
 */
export function stepOrbitalPosition(
  theta: number,
  phi: number,
  velTheta: number,
  velPhi: number,
  delta: number,
): OrbitalPosition {
  const newTheta = theta + velTheta * delta
  const newPhi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, phi + velPhi * delta))
  return { theta: newTheta, phi: newPhi }
}
