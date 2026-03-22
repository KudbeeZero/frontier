import { create } from "zustand";
import type { Component, Vector3Tuple } from "../types/game";

interface ShipState {
  position: Vector3Tuple;
  velocity: Vector3Tuple;
  rotation: Vector3Tuple;

  fuel: number;
  maxFuel: number;
  hull: number;
  maxHull: number;
  cargo: number;
  maxCargo: number;
  oxygen: number;
  power: number;
  shieldStrength: number;
  speed: number;
  miningPower: number;

  installedComponents: Component[];
  isMining: boolean;
  miningTarget: string | null;
  miningProgress: number;

  setPosition: (pos: Vector3Tuple) => void;
  setVelocity: (vel: Vector3Tuple) => void;
  setRotation: (rot: Vector3Tuple) => void;
  takeDamage: (amount: number) => void;
  consumeFuel: (amount: number) => void;
  refuel: (amount: number) => void;
  repairHull: (amount: number) => void;
  updateOxygen: (delta: number) => void;
  updateHull: (delta: number) => void;
  updatePower: (delta: number) => void;
  updateFuel: (delta: number) => void;
  addCargo: (weight: number) => void;
  removeCargo: (weight: number) => void;
  setMining: (isMining: boolean, targetId?: string | null) => void;
  setMiningProgress: (progress: number) => void;
  installComponent: (component: Component) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  position: [0, 0, 0] as Vector3Tuple,
  velocity: [0, 0, 0] as Vector3Tuple,
  rotation: [0, 0, 0] as Vector3Tuple,
  fuel: 100,
  maxFuel: 100,
  hull: 100,
  maxHull: 100,
  cargo: 0,
  maxCargo: 500,
  oxygen: 100,
  power: 100,
  shieldStrength: 0,
  speed: 50,
  miningPower: 10,
  installedComponents: [],
  isMining: false,
  miningTarget: null,
  miningProgress: 0,
};

export const useShipStore = create<ShipState>((set) => ({
  ...DEFAULT_STATE,

  setPosition: (pos) => set({ position: pos }),
  setVelocity: (vel) => set({ velocity: vel }),
  setRotation: (rot) => set({ rotation: rot }),
  takeDamage: (amount) =>
    set((s) => {
      const shieldAbsorb = Math.min(s.shieldStrength, amount);
      const hullDamage = amount - shieldAbsorb;
      return {
        hull: Math.max(0, s.hull - hullDamage),
        shieldStrength: Math.max(0, s.shieldStrength - shieldAbsorb),
      };
    }),
  consumeFuel: (amount) => set((s) => ({ fuel: Math.max(0, s.fuel - amount) })),
  refuel: (amount) =>
    set((s) => ({ fuel: Math.min(s.maxFuel, s.fuel + amount) })),
  repairHull: (amount) =>
    set((s) => ({ hull: Math.min(s.maxHull, s.hull + amount) })),
  updateOxygen: (delta) =>
    set((s) => ({ oxygen: Math.max(0, Math.min(100, s.oxygen + delta)) })),
  updateHull: (delta) =>
    set((s) => ({ hull: Math.max(0, Math.min(s.maxHull, s.hull + delta)) })),
  updatePower: (delta) =>
    set((s) => ({ power: Math.max(0, Math.min(100, s.power + delta)) })),
  updateFuel: (delta) =>
    set((s) => ({ fuel: Math.max(0, Math.min(s.maxFuel, s.fuel + delta)) })),
  addCargo: (weight) => set((s) => ({ cargo: s.cargo + weight })),
  removeCargo: (weight) =>
    set((s) => ({ cargo: Math.max(0, s.cargo - weight) })),
  setMining: (isMining, targetId = null) =>
    set({ isMining, miningTarget: targetId, miningProgress: 0 }),
  setMiningProgress: (progress) => set({ miningProgress: progress }),
  installComponent: (component) =>
    set((s) => {
      const stats = component.stats;
      return {
        installedComponents: [
          ...s.installedComponents,
          { ...component, installed: true },
        ],
        maxHull: s.maxHull + (stats.maxHull ?? 0),
        maxFuel: s.maxFuel + (stats.maxFuel ?? 0),
        maxCargo: s.maxCargo + (stats.maxCargo ?? 0),
        speed: s.speed + (stats.speed ?? 0),
        miningPower: s.miningPower + (stats.miningPower ?? 0),
        shieldStrength: s.shieldStrength + (stats.shieldStrength ?? 0),
      };
    }),
  reset: () => set(DEFAULT_STATE),
}));
