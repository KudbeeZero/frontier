import { create } from "zustand";

interface TargetingState {
  targetPosition: { lat: number; lng: number } | null;
  isLocked: boolean;
  lockProgress: number;

  setTarget: (lat: number, lng: number) => void;
  clearTarget: () => void;
  updateLockProgress: (delta: number) => void;
}

const LOCK_TIME = 1.5;

export const useTargetingStore = create<TargetingState>((set, get) => ({
  targetPosition: null,
  isLocked: false,
  lockProgress: 0,

  setTarget: (lat, lng) => {
    set({ targetPosition: { lat, lng }, isLocked: false, lockProgress: 0 });
  },

  clearTarget: () => {
    set({ targetPosition: null, isLocked: false, lockProgress: 0 });
  },

  updateLockProgress: (delta) => {
    const state = get();
    if (!state.targetPosition) return;
    const newProgress = Math.min(1, state.lockProgress + delta / LOCK_TIME);
    set({ lockProgress: newProgress, isLocked: newProgress >= 1 });
  },
}));
