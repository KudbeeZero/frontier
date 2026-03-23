import { create } from "zustand";

export type GroundTargetStatus = "intact" | "damaged" | "destroyed";

export interface GroundTarget {
  id: string;
  name: string;
  /** Latitude in radians (-PI/2 to PI/2) */
  lat: number;
  /** Longitude in radians (-PI to PI) */
  lon: number;
  hp: number;
  maxHp: number;
  status: GroundTargetStatus;
  creditReward: number;
}

function latLonToRad(latDeg: number, lonDeg: number) {
  return { lat: (latDeg * Math.PI) / 180, lon: (lonDeg * Math.PI) / 180 };
}

/** 8 targets spread across different continents */
const INITIAL_TARGETS: GroundTarget[] = [
  {
    id: "gt-1",
    name: "North American Base",
    ...latLonToRad(40, -100),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-2",
    name: "European Facility",
    ...latLonToRad(51, 10),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-3",
    name: "Siberian Outpost",
    ...latLonToRad(62, 100),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-4",
    name: "East Asian Hub",
    ...latLonToRad(35, 120),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-5",
    name: "African Depot",
    ...latLonToRad(-5, 25),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-6",
    name: "South American Bunker",
    ...latLonToRad(-20, -60),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-7",
    name: "Australian Station",
    ...latLonToRad(-28, 134),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
  {
    id: "gt-8",
    name: "Pacific Platform",
    ...latLonToRad(10, -170),
    hp: 100,
    maxHp: 100,
    status: "intact",
    creditReward: 50,
  },
];

export const EARTH_RADIUS = 1.4;

/** Convert lat/lon to 3D position on Earth sphere (matches EarthGlobe rotation=0 at game start) */
export function groundTargetPosition(
  lat: number,
  lon: number,
  r = EARTH_RADIUS,
): [number, number, number] {
  const x = r * Math.cos(lat) * Math.cos(lon);
  const y = r * Math.sin(lat);
  const z = r * Math.cos(lat) * Math.sin(lon);
  return [x, y, z];
}

interface GroundTargetState {
  targets: GroundTarget[];
  lockedGroundTarget: string | null;
  groundLockDwell: number; // seconds spent aiming at current candidate
  groundLockCandidate: string | null;
  destroyedCount: number;

  damageTarget: (id: string, amount: number) => void;
  setLockedGroundTarget: (id: string | null) => void;
  setGroundLockCandidate: (id: string | null) => void;
  tickGroundLockDwell: (delta: number) => void;
  resetGroundLock: () => void;
  getAliveTargets: () => GroundTarget[];
  resetTargets: () => void;
}

export const useGroundTargetStore = create<GroundTargetState>((set, get) => ({
  targets: INITIAL_TARGETS,
  lockedGroundTarget: null,
  groundLockDwell: 0,
  groundLockCandidate: null,
  destroyedCount: 0,

  damageTarget: (id, amount) => {
    set((state) => {
      const targets = state.targets.map((t) => {
        if (t.id !== id) return t;
        const newHp = Math.max(0, t.hp - amount);
        const status: GroundTargetStatus =
          newHp === 0
            ? "destroyed"
            : newHp < t.maxHp * 0.5
              ? "damaged"
              : "intact";
        return { ...t, hp: newHp, status };
      });
      const destroyed = targets.find(
        (t) => t.id === id && t.status === "destroyed",
      );
      const wasAlive = state.targets.find(
        (t) => t.id === id && t.status !== "destroyed",
      );
      return {
        targets,
        destroyedCount:
          destroyed && wasAlive
            ? state.destroyedCount + 1
            : state.destroyedCount,
        lockedGroundTarget: destroyed ? null : state.lockedGroundTarget,
      };
    });
  },

  setLockedGroundTarget: (id) => set({ lockedGroundTarget: id }),

  setGroundLockCandidate: (id) =>
    set((state) => ({
      groundLockCandidate: id,
      groundLockDwell:
        id === state.groundLockCandidate ? state.groundLockDwell : 0,
    })),

  tickGroundLockDwell: (delta) =>
    set((state) => {
      const newDwell = state.groundLockDwell + delta;
      if (newDwell >= 0.5 && state.groundLockCandidate) {
        return {
          groundLockDwell: newDwell,
          lockedGroundTarget: state.groundLockCandidate,
        };
      }
      return { groundLockDwell: newDwell };
    }),

  resetGroundLock: () =>
    set({
      lockedGroundTarget: null,
      groundLockCandidate: null,
      groundLockDwell: 0,
    }),

  getAliveTargets: () => get().targets.filter((t) => t.status !== "destroyed"),

  resetTargets: () =>
    set({
      targets: INITIAL_TARGETS.map((t) => ({ ...t })),
      destroyedCount: 0,
      lockedGroundTarget: null,
    }),
}));
