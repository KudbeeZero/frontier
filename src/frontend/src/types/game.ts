import * as THREE from "three";

export type ResourceType =
  | "iron"
  | "silicon"
  | "carbon"
  | "titanium"
  | "platinum"
  | "rareEarth"
  | "exoticMatter"
  | "darkMatter"
  | "quantumCrystals";

export type ComponentType =
  | "hullUpgrade"
  | "engineUpgrade"
  | "miningLaser"
  | "defensiveSystem"
  | "scanner"
  | "refinery"
  | "shield";

export type Rarity = "common" | "uncommon" | "rare";

export type GameMode = "exploration" | "mining" | "docked";

export type NotificationType = "info" | "warning" | "success" | "danger";

export interface Resource {
  type: ResourceType;
  name: string;
  rarity: Rarity;
  weight: number;
  color: string;
  icon: string;
}

export interface ShipStats {
  maxHull: number;
  maxFuel: number;
  maxCargo: number;
  speed: number;
  miningPower: number;
  shieldStrength: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  name: string;
  description: string;
  stats: Partial<ShipStats>;
  installed: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  category: "hull" | "engine" | "weapons" | "utilities";
  componentType: ComponentType;
  ingredients: Partial<Record<ResourceType, number>>;
  result: Omit<Component, "id" | "installed">;
}

export interface AsteroidData {
  id: string;
  position: [number, number, number];
  scale: number;
  resources: Partial<Record<ResourceType, number>>;
  depleted: boolean;
  health: number;
  maxHealth: number;
  rotation: [number, number, number];
}

export interface Location {
  id: string;
  name: string;
  position: [number, number, number];
  type: "station" | "derelict" | "anomaly" | "asteroidField";
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

export interface DerelictShipData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  salvaged: boolean;
}

export type Vector3Tuple = [number, number, number];

export { THREE };

// ─── Combat Types ─────────────────────────────────────────────────────────────

export type WeaponId = "pulse" | "rail" | "missile";

export interface WeaponConfig {
  id: WeaponId;
  label: string;
  damage: number;
  fireRate: number;
  energyCost: number;
  speed: number;
  color: string;
}

export type EnemyType = "scout" | "cruiser" | "dreadnought" | "drone";

export interface EnemyConfig {
  type: EnemyType;
  label: string;
  hp: number;
  speed: number;
  damage: number;
  reward: number;
  scoreValue: number;
  scale: number;
  color: string;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  theta: number;
  phi: number;
  /** Current distance from origin; starts at ENEMY_WORLD_RADIUS and shrinks as enemy advances */
  distance?: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  reward: number;
  scoreValue: number;
  /** Whether this enemy is actively hostile toward the player */
  hostile: boolean;
}

export type GamePhase = 1 | 2 | 3 | 4 | 5 | 6;

export interface OrbitalPosition {
  theta: number;
  phi: number;
}

export type EventTrigger =
  | "game_start"
  | "wave_complete"
  | "boss_defeated"
  | "manual"
  | string;

export interface CombatEvent {
  id: string;
  phase: GamePhase;
  title: string;
  message: string;
  speaker?: string;
  trigger: EventTrigger;
  effects?: Partial<{
    hull: number;
    fuel: number;
    credits: number;
    weaponsOnline: boolean;
  }>;
}
