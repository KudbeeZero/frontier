import { create } from "zustand";
import { ENEMY_TYPES, type EnemyTypeId } from "../config/enemies";

export interface Enemy {
  id: string;
  type: EnemyTypeId;
  position: { lat: number; lng: number };
  health: number;
  maxHealth: number;
  status: "active" | "destroyed";
  destroyedAt?: number;
}

export interface Impact {
  id: string;
  position: [number, number, number];
  color: string;
  spawnedAt: number;
}

interface EnemyState {
  enemies: Enemy[];
  score: number;
  enemiesDestroyed: number;
  impacts: Impact[];

  spawnEnemy: () => void;
  damageEnemy: (
    id: string,
    damage: number,
    hitPos: [number, number, number],
  ) => void;
  removeImpact: (id: string) => void;
  tick: (deltaMs: number) => void;
}

let nextEnemyId = 1;
let spawnTimer = 0;

export const useEnemyStore = create<EnemyState>((set, get) => ({
  enemies: [],
  score: 0,
  enemiesDestroyed: 0,
  impacts: [],

  spawnEnemy: () => {
    const types = Object.keys(ENEMY_TYPES) as EnemyTypeId[];
    const type = types[Math.floor(Math.random() * types.length)];
    const config = ENEMY_TYPES[type];

    const enemy: Enemy = {
      id: `SAT-${String(nextEnemyId++).padStart(3, "0")}`,
      type,
      position: {
        lat: (Math.random() - 0.5) * 160,
        lng: (Math.random() - 0.5) * 360,
      },
      health: config.health,
      maxHealth: config.health,
      status: "active",
    };

    set((state) => ({ enemies: [...state.enemies, enemy] }));
    console.log(`🛸 Spawned ${config.name}`);
  },

  damageEnemy: (id, damage, hitPos) => {
    const state = get();
    const enemy = state.enemies.find((e) => e.id === id);
    if (!enemy || enemy.status !== "active") return;

    const newHealth = Math.max(0, enemy.health - damage);
    const destroyed = newHealth <= 0;
    const config = ENEMY_TYPES[enemy.type];

    // Add impact flash
    const impact: Impact = {
      id: `impact_${Date.now()}_${Math.random()}`,
      position: hitPos,
      color: config.color,
      spawnedAt: Date.now(),
    };

    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id
          ? {
              ...e,
              health: newHealth,
              status: destroyed ? "destroyed" : "active",
              destroyedAt: destroyed ? Date.now() : undefined,
            }
          : e,
      ),
      impacts: [...s.impacts, impact],
      score: destroyed ? s.score + config.points : s.score,
      enemiesDestroyed: destroyed ? s.enemiesDestroyed + 1 : s.enemiesDestroyed,
    }));

    if (destroyed)
      console.log(`💥 Destroyed ${config.name}! +${config.points}`);
  },

  removeImpact: (id) => {
    set((s) => ({ impacts: s.impacts.filter((i) => i.id !== id) }));
  },

  tick: (deltaMs) => {
    const state = get();
    const now = Date.now();

    // Remove destroyed enemies after 1.2s
    const enemies = state.enemies.filter(
      (e) =>
        e.status === "active" ||
        (e.destroyedAt != null && now - e.destroyedAt < 1200),
    );

    // Spawn timer
    spawnTimer += deltaMs;
    if (
      spawnTimer >= 12000 &&
      enemies.filter((e) => e.status === "active").length < 8
    ) {
      state.spawnEnemy();
      spawnTimer = 0;
    }

    set({ enemies });
  },
}));
