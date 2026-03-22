import type * as THREE from "three";
import { create } from "zustand";

export interface ExplosionData {
  id: string;
  position: THREE.Vector3;
  createdAt: number;
}

interface ExplosionState {
  explosions: ExplosionData[];
  addExplosion: (position: THREE.Vector3) => void;
  removeExplosion: (id: string) => void;
}

export const useExplosionStore = create<ExplosionState>((set) => ({
  explosions: [],

  addExplosion: (position) => {
    const explosion: ExplosionData = {
      id: `exp-${Date.now()}-${Math.random()}`,
      position: position.clone(),
      createdAt: Date.now(),
    };
    set((state) => ({ explosions: [...state.explosions, explosion] }));
  },

  removeExplosion: (id) =>
    set((state) => ({
      explosions: state.explosions.filter((e) => e.id !== id),
    })),
}));
