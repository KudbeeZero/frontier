import { create } from 'zustand'
import type { Enemy } from '../types/game'

interface EnemyState {
  enemies: Enemy[]
  lockedTarget: string | null
  wave: number

  addEnemy: (enemy: Enemy) => void
  removeEnemy: (id: string) => void
  damageEnemy: (id: string, amount: number) => void
  setLockedTarget: (id: string | null) => void
  clearEnemies: () => void
  incrementWave: () => void
}

export const useEnemyStore = create<EnemyState>((set) => ({
  enemies: [],
  lockedTarget: null,
  wave: 1,

  addEnemy: (enemy) =>
    set((state) => ({ enemies: [...state.enemies, enemy] })),

  removeEnemy: (id) =>
    set((state) => ({ enemies: state.enemies.filter((e) => e.id !== id) })),

  damageEnemy: (id, amount) =>
    set((state) => ({
      enemies: state.enemies
        .map((e) => (e.id === id ? { ...e, hp: Math.max(0, e.hp - amount) } : e))
        .filter((e) => e.hp > 0),
    })),

  setLockedTarget: (id) => set({ lockedTarget: id }),

  clearEnemies: () => set({ enemies: [], lockedTarget: null }),

  incrementWave: () => set((state) => ({ wave: state.wave + 1 })),
}))
