import { create } from "zustand";
import type { WeaponId } from "../types/game";

interface WeaponsState {
  activeWeapon: WeaponId;
  cooldowns: Record<string, number>;
  ammo: Record<string, number>;

  setActiveWeapon: (id: WeaponId) => void;
  setCooldown: (weaponId: string, value: number) => void;
  tickCooldowns: (delta: number) => void;
  consumeAmmo: (weaponId: string) => void;
}

export const useWeaponsStore = create<WeaponsState>((set) => ({
  activeWeapon: "pulse",
  cooldowns: { pulse: 0, rail: 0, missile: 0 },
  ammo: { pulse: Number.POSITIVE_INFINITY, rail: 50, missile: 10 },

  setActiveWeapon: (id) => set({ activeWeapon: id }),

  setCooldown: (weaponId, value) =>
    set((state) => ({
      cooldowns: { ...state.cooldowns, [weaponId]: value },
    })),

  tickCooldowns: (delta) =>
    set((state) => {
      const updated: Record<string, number> = {};
      for (const [id, cd] of Object.entries(state.cooldowns)) {
        updated[id] = Math.max(0, cd - delta);
      }
      return { cooldowns: updated };
    }),

  consumeAmmo: (weaponId) =>
    set((state) => ({
      ammo: {
        ...state.ammo,
        [weaponId]: Math.max(0, (state.ammo[weaponId] ?? 0) - 1),
      },
    })),
}));
