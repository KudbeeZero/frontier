import type { EnemyConfig } from '../types/game'

export const ENEMY_CONFIGS: EnemyConfig[] = [
  {
    type: 'scout',
    label: 'Scout',
    hp: 30,
    speed: 0.8,
    damage: 5,
    reward: 15,
    scoreValue: 100,
    scale: 0.3,
    color: '#ff4444',
  },
  {
    type: 'cruiser',
    label: 'Cruiser',
    hp: 150,
    speed: 0.3,
    damage: 20,
    reward: 50,
    scoreValue: 350,
    scale: 0.7,
    color: '#ff6600',
  },
  {
    type: 'dreadnought',
    label: 'Dreadnought',
    hp: 500,
    speed: 0.15,
    damage: 60,
    reward: 200,
    scoreValue: 1000,
    scale: 1.4,
    color: '#cc0000',
  },
  {
    type: 'drone',
    label: 'Drone',
    hp: 10,
    speed: 1.2,
    damage: 3,
    reward: 5,
    scoreValue: 50,
    scale: 0.15,
    color: '#ff4444',
  },
]

export const ENEMY_CONFIG_MAP = Object.fromEntries(
  ENEMY_CONFIGS.map((e) => [e.type, e]),
) as Record<string, EnemyConfig>

/** Enemy types available per phase */
export const PHASE_ENEMY_POOL: Record<number, Array<EnemyConfig['type']>> = {
  1: ['scout'],
  2: ['scout', 'cruiser'],
  3: ['scout', 'cruiser'],
  4: ['scout', 'cruiser', 'dreadnought', 'drone'],
  5: ['cruiser', 'dreadnought', 'drone'],
  6: ['dreadnought'],
}
