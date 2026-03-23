import { create } from "zustand";
import type { WeaponId } from "../types/game";

export interface ProjectileData {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  damage: number;
  weaponType: WeaponId;
  color: string;
  maxLifetime: number;
  createdAt: number;
  targetId?: string;
  /** If set, this projectile is homing toward a ground target on Earth's surface */
  groundTargetId?: string;
}

interface ProjectileState {
  projectiles: ProjectileData[];
  addProjectile: (data: Omit<ProjectileData, "id" | "createdAt">) => void;
  removeProjectile: (id: string) => void;
  clearProjectiles: () => void;
}

export const useProjectileStore = create<ProjectileState>((set) => ({
  projectiles: [],

  addProjectile: (data) => {
    const projectile: ProjectileData = {
      ...data,
      id: `proj-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
    };
    set((state) => ({ projectiles: [...state.projectiles, projectile] }));
  },

  removeProjectile: (id) =>
    set((state) => ({
      projectiles: state.projectiles.filter((p) => p.id !== id),
    })),

  clearProjectiles: () => set({ projectiles: [] }),
}));
