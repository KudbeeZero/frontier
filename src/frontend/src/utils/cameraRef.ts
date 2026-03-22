/**
 * Shared mutable ref for camera state.
 * ShipController writes to this every frame.
 * fireWeapon reads from it to get projectile direction.
 */
export const cameraRef = {
  forwardX: 0,
  forwardY: 0,
  forwardZ: -1,
  posX: 0,
  posY: 0,
  posZ: 0,
};
