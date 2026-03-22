import { create } from 'zustand'
import type { GamePhase } from '../types/game'

interface GameState {
  gameStarted: boolean
  isPaused: boolean
  phase: GamePhase
  score: number
  credits: number
  earthIntegrity: number

  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  setPhase: (phase: GamePhase) => void
  addScore: (amount: number) => void
  addCredits: (amount: number) => void
  spendCredits: (amount: number) => boolean
  damageEarth: (amount: number) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  gameStarted: false,
  isPaused: false,
  phase: 1,
  score: 0,
  credits: 100,
  earthIntegrity: 100,

  startGame: () => set({ gameStarted: true }),
  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  setPhase: (phase) => set({ phase }),
  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  spendCredits: (amount) => {
    if (get().credits < amount) return false
    set((state) => ({ credits: state.credits - amount }))
    return true
  },
  damageEarth: (amount) =>
    set((state) => ({ earthIntegrity: Math.max(0, state.earthIntegrity - amount) })),
}))
