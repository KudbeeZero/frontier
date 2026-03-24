import { create } from "zustand";

interface LaneState {
  currentLane: number; // 1-5
  laneRadii: readonly [number, number, number, number, number];
  aimAngle: number; // -90 to +90 degrees
  laneFlash: boolean;
  changeLane: (direction: "up" | "down") => void;
  setAimAngle: (angle: number) => void;
  getCurrentRadius: () => number;
}

export const useLaneStore = create<LaneState>((set, get) => ({
  currentLane: 3,
  laneRadii: [1.6, 1.9, 2.2, 2.5, 2.8],
  aimAngle: 0,
  laneFlash: false,

  changeLane: (direction) => {
    const current = get().currentLane;
    const newLane =
      direction === "up" ? Math.min(5, current + 1) : Math.max(1, current - 1);
    if (newLane !== current) {
      set({ currentLane: newLane, laneFlash: true });
      setTimeout(() => set({ laneFlash: false }), 300);
    }
  },

  setAimAngle: (angle) => {
    set({ aimAngle: Math.max(-90, Math.min(90, angle)) });
  },

  getCurrentRadius: () => {
    const { currentLane, laneRadii } = get();
    return laneRadii[currentLane - 1];
  },
}));
