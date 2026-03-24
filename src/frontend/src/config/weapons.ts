import type { WeaponConfig } from "../types/game";

export const WEAPONS: WeaponConfig[] = [
  {
    id: "pulse",
    label: "PULSE",
    damage: 15,
    fireRate: 5,
    energyCost: 5,
    speed: 20,
    color: "#00ffff",
  },
  {
    id: "rail",
    label: "RAIL",
    damage: 80,
    fireRate: 0.8,
    energyCost: 20,
    speed: 60,
    color: "#ffffff",
  },
  {
    id: "missile",
    label: "MISSILE",
    damage: 120,
    fireRate: 0.5,
    energyCost: 35,
    speed: 12,
    color: "#ff8800",
  },
];

export const WEAPON_MAP = Object.fromEntries(
  WEAPONS.map((w) => [w.id, w]),
) as Record<string, WeaponConfig>;
