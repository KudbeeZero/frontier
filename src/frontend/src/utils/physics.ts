import type { Vector3Tuple } from "../types/game";

export function applyThrust(
  velocity: Vector3Tuple,
  direction: Vector3Tuple,
  acceleration: number,
  dt: number,
): Vector3Tuple {
  return [
    velocity[0] + direction[0] * acceleration * dt,
    velocity[1] + direction[1] * acceleration * dt,
    velocity[2] + direction[2] * acceleration * dt,
  ];
}

export function applyDrag(velocity: Vector3Tuple, drag: number): Vector3Tuple {
  return [velocity[0] * drag, velocity[1] * drag, velocity[2] * drag];
}

export function clampVelocity(
  velocity: Vector3Tuple,
  maxSpeed: number,
): Vector3Tuple {
  const speed = Math.sqrt(
    velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2,
  );
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    return [velocity[0] * scale, velocity[1] * scale, velocity[2] * scale];
  }
  return velocity;
}

export function getSpeed(velocity: Vector3Tuple): number {
  return Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2);
}

export function distance3D(a: Vector3Tuple, b: Vector3Tuple): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}
