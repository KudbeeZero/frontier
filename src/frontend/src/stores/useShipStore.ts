import { create } from "zustand";

// Physics constants
const MAX_VELOCITY = 0.01; // Max angular velocity (radians/second)
const DRAG = 0.98; // Drag coefficient (0.98 = 2% reduction per frame)
const THRUST_RATE = 0.0002; // Acceleration from thrust

interface ShipState {
  // Orbital position (radians)
  theta: number; // Longitude (around equator)
  phi: number; // Latitude (north-south)

  // Orbital velocity (radians/second)
  velTheta: number;
  velPhi: number;

  // Actions
  applyThrust: (thrustTheta: number, thrustPhi: number) => void;
  applyVelocityTick: (deltaTime: number) => void;
  setPosition: (theta: number, phi: number) => void;
  setVelocity: (velTheta: number, velPhi: number) => void;
}

export const useShipStore = create<ShipState>((set, get) => ({
  theta: 0,
  phi: 0,
  velTheta: 0,
  velPhi: 0,

  applyThrust: (thrustTheta, thrustPhi) => {
    const state = get();

    let newVelTheta = state.velTheta + thrustTheta;
    let newVelPhi = state.velPhi + thrustPhi;

    newVelTheta = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVelTheta));
    newVelPhi = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVelPhi));

    set({ velTheta: newVelTheta, velPhi: newVelPhi });
  },

  applyVelocityTick: (dt) => {
    const state = get();

    const draggedVelTheta = state.velTheta * DRAG;
    const draggedVelPhi = state.velPhi * DRAG;

    let newTheta = state.theta + draggedVelTheta * dt;
    let newPhi = state.phi + draggedVelPhi * dt;

    newPhi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newPhi));
    newTheta = newTheta % (Math.PI * 2);

    set({
      theta: newTheta,
      phi: newPhi,
      velTheta: draggedVelTheta,
      velPhi: draggedVelPhi,
    });
  },

  setPosition: (theta, phi) => set({ theta, phi }),
  setVelocity: (velTheta, velPhi) => set({ velTheta, velPhi }),
}));

export { THRUST_RATE };
