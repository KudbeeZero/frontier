import { create } from "zustand";
import { ENEMY_TYPES } from "../config/enemies";
import { WEAPONS, type WeaponId } from "../config/weapons";

export interface Projectile {
  id: string;
  weaponType: WeaponId;
  position: [number, number, number];
  velocity: [number, number, number];
  age: number;
  maxAge: number;
}

interface ProjectilesState {
  projectiles: Projectile[];
  spawnProjectile: (
    weaponType: WeaponId,
    start: [number, number, number],
    target: [number, number, number],
  ) => void;
  tick: (delta: number) => void;
  removeProjectile: (id: string) => void;
}

const SPEEDS: Record<WeaponId, number> = {
  pulse: 4.0,
  railgun: 10.0,
  missile: 2.0,
  emp: 3.0,
};

export const useProjectilesStore = create<ProjectilesState>((set) => ({
  projectiles: [],

  spawnProjectile: (weaponType, start, target) => {
    const dx = target[0] - start[0];
    const dy = target[1] - start[1];
    const dz = target[2] - start[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist === 0) return;

    const speed = SPEEDS[weaponType];
    const velocity: [number, number, number] = [
      (dx / dist) * speed,
      (dy / dist) * speed,
      (dz / dist) * speed,
    ];

    const projectile: Projectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      weaponType,
      position: [start[0], start[1], start[2]],
      velocity,
      age: 0,
      maxAge: 4,
    };

    set((state) => ({ projectiles: [...state.projectiles, projectile] }));
  },

  tick: (delta) => {
    // Import enemy store dynamically to avoid circular deps
    const { useEnemyStore } = require("./useEnemyStore");
    const enemyStore = useEnemyStore.getState();

    set((state) => {
      const surviving: Projectile[] = [];

      for (const p of state.projectiles) {
        // Move first
        const nx = p.position[0] + p.velocity[0] * delta;
        const ny = p.position[1] + p.velocity[1] * delta;
        const nz = p.position[2] + p.velocity[2] * delta;
        const newAge = p.age + delta;

        if (newAge >= p.maxAge) continue;

        // Collision check
        let hit = false;
        for (const enemy of enemyStore.enemies) {
          if (enemy.status !== "active") continue;

          const latRad = (enemy.position.lat * Math.PI) / 180;
          const lngRad = (enemy.position.lng * Math.PI) / 180;
          const r = 1.53;
          const ex = r * Math.cos(latRad) * Math.cos(lngRad);
          const ey = r * Math.sin(latRad);
          const ez = r * Math.cos(latRad) * Math.sin(lngRad);

          const ddx = nx - ex;
          const ddy = ny - ey;
          const ddz = nz - ez;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);

          const config = ENEMY_TYPES[enemy.type];
          if (dist < config.size * 2.5) {
            const weaponDamage = WEAPONS[p.weaponType].damage;
            enemyStore.damageEnemy(enemy.id, weaponDamage, [nx, ny, nz]);
            hit = true;
            break;
          }
        }

        if (!hit) {
          surviving.push({ ...p, position: [nx, ny, nz], age: newAge });
        }
      }

      return { projectiles: surviving };
    });
  },

  removeProjectile: (id) => {
    set((state) => ({
      projectiles: state.projectiles.filter((p) => p.id !== id),
    }));
  },
}));
