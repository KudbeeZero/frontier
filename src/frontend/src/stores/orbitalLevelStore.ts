import { create } from "zustand";

export interface OrbitalLevelConfig {
  level: number;
  name: string;
  altitudeLabel: string;
  /** Three.js display radius (matches laneStore laneRadii) */
  radius: number;
  targetCount: number;
  baseHp: number;
  /** Number of targets that start with a shield layer (level 3) */
  shieldedCount: number;
  /** HP of the shield on shielded targets */
  shieldHp: number;
  creditReward: number;
  /** Level 4+: enemies periodically fire at player */
  returnFire: boolean;
  returnFireInterval: number; // seconds between hits
  returnFireDamage: number;
  /** Level 5: target shields regenerate over time */
  shieldRegen: boolean;
  shieldRegenRate: number; // HP per second
  enemyTypeName: string;
  ringColor: string;
  description: string;
}

export const ORBITAL_LEVEL_CONFIGS: OrbitalLevelConfig[] = [
  {
    level: 1,
    name: "Low Earth Orbit",
    altitudeLabel: "500 km",
    radius: 1.6,
    targetCount: 8,
    baseHp: 100,
    shieldedCount: 0,
    shieldHp: 0,
    creditReward: 50,
    returnFire: false,
    returnFireInterval: 0,
    returnFireDamage: 0,
    shieldRegen: false,
    shieldRegenRate: 0,
    enemyTypeName: "Ground Installation",
    ringColor: "#00ffcc",
    description: "Basic ground targets. Slow engagement. Tutorial orbit.",
  },
  {
    level: 2,
    name: "Medium Orbit",
    altitudeLabel: "750 km",
    radius: 1.9,
    targetCount: 12,
    baseHp: 200,
    shieldedCount: 0,
    shieldHp: 0,
    creditReward: 100,
    returnFire: false,
    returnFireInterval: 0,
    returnFireDamage: 0,
    shieldRegen: false,
    shieldRegenRate: 0,
    enemyTypeName: "Defense Platform",
    ringColor: "#00aaff",
    description:
      "Orbital defense platforms in clusters. Positional play required.",
  },
  {
    level: 3,
    name: "High Orbit",
    altitudeLabel: "1000 km",
    radius: 2.2,
    targetCount: 16,
    baseHp: 300,
    shieldedCount: 4,
    shieldHp: 200,
    creditReward: 200,
    returnFire: false,
    returnFireInterval: 0,
    returnFireDamage: 0,
    shieldRegen: false,
    shieldRegenRate: 0,
    enemyTypeName: "Military Satellite",
    ringColor: "#aa88ff",
    description:
      "Military satellites. 4 carry shields requiring sustained fire.",
  },
  {
    level: 4,
    name: "Geosynchronous Orbit",
    altitudeLabel: "1250 km",
    radius: 2.5,
    targetCount: 20,
    baseHp: 500,
    shieldedCount: 0,
    shieldHp: 0,
    creditReward: 400,
    returnFire: true,
    returnFireInterval: 4,
    returnFireDamage: 8,
    shieldRegen: false,
    shieldRegenRate: 0,
    enemyTypeName: "Command Ship",
    ringColor: "#ff8800",
    description: "Command ships return fire. Hull damage is real here.",
  },
  {
    level: 5,
    name: "Outer Defense Grid",
    altitudeLabel: "1500 km",
    radius: 2.8,
    targetCount: 24,
    baseHp: 750,
    shieldedCount: 0,
    shieldHp: 0,
    creditReward: 800,
    returnFire: true,
    returnFireInterval: 2.5,
    returnFireDamage: 15,
    shieldRegen: true,
    shieldRegenRate: 15,
    enemyTypeName: "Capital Ship",
    ringColor: "#ff3344",
    description:
      "Capital ships with regenerating shields. Aggressive return fire.",
  },
];

export type LevelStatus = "locked" | "active" | "completed";

interface OrbitalLevelState {
  currentLevel: number;
  levelStatus: Record<number, LevelStatus>;
  isAdvancing: boolean; // true during the 2s advancement animation

  getCurrentConfig: () => OrbitalLevelConfig;
  getConfig: (level: number) => OrbitalLevelConfig;
  startLevel: (level: number) => void;
  completeCurrentLevel: () => void;
  setAdvancing: (v: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATUS: Record<number, LevelStatus> = {
  1: "active",
  2: "locked",
  3: "locked",
  4: "locked",
  5: "locked",
};

export const useOrbitalLevelStore = create<OrbitalLevelState>((set, get) => ({
  currentLevel: 1,
  levelStatus: { ...DEFAULT_STATUS },
  isAdvancing: false,

  getCurrentConfig: () =>
    ORBITAL_LEVEL_CONFIGS.find((c) => c.level === get().currentLevel) ??
    ORBITAL_LEVEL_CONFIGS[0],

  getConfig: (level) =>
    ORBITAL_LEVEL_CONFIGS.find((c) => c.level === level) ??
    ORBITAL_LEVEL_CONFIGS[0],

  startLevel: (level) => {
    const status = get().levelStatus;
    if (status[level] === "locked") return;
    set({
      currentLevel: level,
      levelStatus: {
        ...status,
        [level]: "active",
      },
    });
  },

  completeCurrentLevel: () => {
    const { currentLevel, levelStatus } = get();
    const nextLevel = currentLevel + 1;
    set({
      isAdvancing: true,
      levelStatus: {
        ...levelStatus,
        [currentLevel]: "completed",
        ...(nextLevel <= 5 ? { [nextLevel]: "active" } : {}),
      },
    });
    // Advance after 2.5s
    setTimeout(() => {
      if (nextLevel <= 5) {
        set({ currentLevel: nextLevel, isAdvancing: false });
        // Trigger target reset for new level — imported lazily to avoid circular dep
        import("./groundTargetStore").then(({ useGroundTargetStore }) => {
          useGroundTargetStore.getState().resetForLevel(nextLevel);
        });
      } else {
        set({ isAdvancing: false });
      }
    }, 2500);
  },

  setAdvancing: (v) => set({ isAdvancing: v }),

  reset: () =>
    set({
      currentLevel: 1,
      levelStatus: { ...DEFAULT_STATUS },
      isAdvancing: false,
    }),
}));
