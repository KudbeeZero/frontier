import { create } from "zustand";
import type { OrbitalLevelConfig } from "./orbitalLevelStore";
import { ORBITAL_LEVEL_CONFIGS } from "./orbitalLevelStore";

export type GroundTargetStatus = "intact" | "damaged" | "destroyed";

export interface GroundTarget {
  id: string;
  name: string;
  lat: number;
  lon: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  shieldMaxHp: number;
  shieldRegenRate: number; // HP/sec, 0 = no regen
  status: GroundTargetStatus;
  creditReward: number;
  level: number;
}

/** Golden-angle sphere distribution — evenly spreads N points on a sphere */
function goldenAnglePositions(count: number): { lat: number; lon: number }[] {
  const positions: { lat: number; lon: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const theta = goldenAngle * i;
    const lat = Math.asin(Math.max(-1, Math.min(1, y)));
    let lon = theta % (2 * Math.PI);
    if (lon > Math.PI) lon -= 2 * Math.PI;
    positions.push({ lat, lon });
  }
  return positions;
}

export function generateTargetsForLevel(
  config: OrbitalLevelConfig,
): GroundTarget[] {
  const positions = goldenAnglePositions(config.targetCount);
  const targets: GroundTarget[] = positions.map((pos, i) => {
    const isShielded = i < config.shieldedCount;
    const shieldHp = isShielded
      ? config.shieldHp
      : config.level === 5
        ? 200
        : 0;
    const shieldMaxHp = shieldHp;
    return {
      id: `gt-${config.level}-${i}`,
      name: `${config.enemyTypeName} ${String.fromCharCode(65 + (i % 26))}`,
      lat: pos.lat,
      lon: pos.lon,
      hp: config.baseHp,
      maxHp: config.baseHp,
      shieldHp,
      shieldMaxHp,
      shieldRegenRate: config.shieldRegen ? config.shieldRegenRate : 0,
      status: "intact",
      creditReward: config.creditReward,
      level: config.level,
    };
  });
  return targets;
}

export const EARTH_RADIUS = 1.4;

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
  groundLockDwell: number;
  groundLockCandidate: string | null;
  destroyedCount: number;

  damageTarget: (id: string, amount: number) => void;
  setLockedGroundTarget: (id: string | null) => void;
  setGroundLockCandidate: (id: string | null) => void;
  tickGroundLockDwell: (delta: number) => void;
  resetGroundLock: () => void;
  getAliveTargets: () => GroundTarget[];
  resetTargets: () => void;
  resetForLevel: (level: number) => void;
  tickShieldRegen: (delta: number) => void;
}

const LEVEL1_CONFIG = ORBITAL_LEVEL_CONFIGS[0];

export const useGroundTargetStore = create<GroundTargetState>((set, get) => ({
  targets: generateTargetsForLevel(LEVEL1_CONFIG),
  lockedGroundTarget: null,
  groundLockDwell: 0,
  groundLockCandidate: null,
  destroyedCount: 0,

  damageTarget: (id, amount) => {
    set((state) => {
      const targets = state.targets.map((t) => {
        if (t.id !== id) return t;

        // Absorb damage with shield first
        let remaining = amount;
        let newShieldHp = t.shieldHp;
        if (newShieldHp > 0) {
          const absorbed = Math.min(newShieldHp, remaining);
          newShieldHp = newShieldHp - absorbed;
          remaining -= absorbed;
        }

        const newHp = Math.max(0, t.hp - remaining);
        const status: GroundTargetStatus =
          newHp === 0
            ? "destroyed"
            : newHp < t.maxHp * 0.5
              ? "damaged"
              : "intact";
        return { ...t, hp: newHp, shieldHp: newShieldHp, status };
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

  resetTargets: () => {
    const config = ORBITAL_LEVEL_CONFIGS[0];
    set({
      targets: generateTargetsForLevel(config),
      destroyedCount: 0,
      lockedGroundTarget: null,
    });
  },

  resetForLevel: (level) => {
    const config = ORBITAL_LEVEL_CONFIGS.find((c) => c.level === level);
    if (!config) return;
    set({
      targets: generateTargetsForLevel(config),
      destroyedCount: 0,
      lockedGroundTarget: null,
      groundLockCandidate: null,
      groundLockDwell: 0,
    });
  },

  tickShieldRegen: (delta) => {
    set((state) => ({
      targets: state.targets.map((t) => {
        if (
          t.shieldRegenRate <= 0 ||
          t.shieldHp >= t.shieldMaxHp ||
          t.status === "destroyed"
        )
          return t;
        const newShield = Math.min(
          t.shieldMaxHp,
          t.shieldHp + t.shieldRegenRate * delta,
        );
        return { ...t, shieldHp: newShield };
      }),
    }));
  },
}));
