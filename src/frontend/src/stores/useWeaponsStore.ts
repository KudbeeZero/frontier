import { create } from "zustand";
import type { WeaponId } from "../types/game";

interface WeaponsState {
  activeWeapon: WeaponId;
  cooldowns: Record<string, number>;
  ammo: Record<string, number>;
  missileLocking: boolean;
  missileLockTimer: number;
  missileLockTarget: string | null;

  setActiveWeapon: (id: WeaponId) => void;
  setCooldown: (weaponId: string, value: number) => void;
  tickCooldowns: (delta: number) => void;
  consumeAmmo: (weaponId: string) => void;
  startMissileLock: (targetId: string) => void;
  cancelMissileLock: () => void;
  /** Returns true when lock is complete (timer >= 1.5s) */
  tickMissileLock: (delta: number) => boolean;
}

export const useWeaponsStore = create<WeaponsState>((set, get) => ({
  activeWeapon: "pulse",
  cooldowns: { pulse: 0, rail: 0, missile: 0 },
  ammo: { pulse: Number.POSITIVE_INFINITY, rail: 50, missile: 10 },
  missileLocking: false,
  missileLockTimer: 0,
  missileLockTarget: null,

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

  startMissileLock: (targetId) =>
    set({
      missileLocking: true,
      missileLockTimer: 0,
      missileLockTarget: targetId,
    }),

  cancelMissileLock: () =>
    set({
      missileLocking: false,
      missileLockTimer: 0,
      missileLockTarget: null,
    }),

  tickMissileLock: (delta) => {
    const { missileLocking, missileLockTimer } = get();
    if (!missileLocking) return false;
    const newTimer = missileLockTimer + delta;
    if (newTimer >= 1.5) {
      set({ missileLocking: false, missileLockTimer: 0 });
      return true;
    }
    set({ missileLockTimer: newTimer });
    return false;
  },
}));
