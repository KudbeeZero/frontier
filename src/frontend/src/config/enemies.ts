export const ENEMY_TYPES = {
  satellite_light: {
    id: "satellite_light",
    name: "Surveillance Satellite",
    health: 50,
    size: 0.05,
    color: "#888888",
    points: 10,
  },
  satellite_weapons: {
    id: "satellite_weapons",
    name: "Weapons Platform",
    health: 100,
    size: 0.08,
    color: "#ff4444",
    points: 25,
  },
  asteroid: {
    id: "asteroid",
    name: "Asteroid",
    health: 75,
    size: 0.06,
    color: "#886644",
    points: 15,
  },
} as const;

export type EnemyTypeId = keyof typeof ENEMY_TYPES;
