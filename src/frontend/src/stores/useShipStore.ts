import { create } from "zustand";

interface ShipState {
  theta: number;
  phi: number;
  velTheta: number;
  velPhi: number;
  hull: number;
  fuel: number;
  oxygen: number;

  setPosition: (theta: number, phi: number) => void;
  setVelocity: (velTheta: number, velPhi: number) => void;
  setHull: (hull: number) => void;
  setFuel: (fuel: number) => void;
  setOxygen: (oxygen: number) => void;
  takeDamage: (amount: number) => void;
}

export const useShipStore = create<ShipState>((set) => ({
  theta: 0,
  phi: 0,
  velTheta: 0,
  velPhi: 0,
  hull: 100,
  fuel: 100,
  oxygen: 100,

  setPosition: (theta, phi) => set({ theta, phi }),
  setVelocity: (velTheta, velPhi) => set({ velTheta, velPhi }),
  setHull: (hull) => set({ hull }),
  setFuel: (fuel) => set({ fuel }),
  setOxygen: (oxygen) => set({ oxygen }),
  takeDamage: (amount) =>
    set((state) => ({ hull: Math.max(0, state.hull - amount) })),
}));
