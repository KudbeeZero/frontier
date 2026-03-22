import { create } from "zustand";
import type {
  GameMode,
  Location,
  Notification,
  NotificationType,
} from "../types/game";

interface GameState {
  isPaused: boolean;
  showHUD: boolean;
  gameMode: GameMode;
  credits: number;
  discoveredLocations: Location[];
  notifications: Notification[];
  gameStarted: boolean;
  showInventory: boolean;
  showCrafting: boolean;
  showPauseMenu: boolean;

  setPaused: (paused: boolean) => void;
  toggleHUD: () => void;
  setGameMode: (mode: GameMode) => void;
  addCredits: (amount: number) => void;
  discoverLocation: (location: Location) => void;
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
  setGameStarted: (started: boolean) => void;
  toggleInventory: () => void;
  toggleCrafting: () => void;
  togglePauseMenu: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPaused: false,
  showHUD: true,
  gameMode: "exploration",
  credits: 0,
  discoveredLocations: [],
  notifications: [],
  gameStarted: false,
  showInventory: false,
  showCrafting: false,
  showPauseMenu: false,

  setPaused: (paused) => set({ isPaused: paused }),
  toggleHUD: () => set((s) => ({ showHUD: !s.showHUD })),
  setGameMode: (mode) => set({ gameMode: mode }),
  addCredits: (amount) => set((s) => ({ credits: s.credits + amount })),
  discoverLocation: (location) =>
    set((s) => ({
      discoveredLocations: s.discoveredLocations.some(
        (l) => l.id === location.id,
      )
        ? s.discoveredLocations
        : [...s.discoveredLocations, location],
    })),
  addNotification: (message, type) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    set((s) => ({
      notifications: [
        ...s.notifications,
        { id, message, type, timestamp: Date.now() },
      ],
    }));
    setTimeout(() => {
      useGameStore.getState().removeNotification(id);
    }, 4000);
  },
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  setGameStarted: (started) => set({ gameStarted: started }),
  toggleInventory: () =>
    set((s) => ({ showInventory: !s.showInventory, showCrafting: false })),
  toggleCrafting: () =>
    set((s) => ({ showCrafting: !s.showCrafting, showInventory: false })),
  togglePauseMenu: () => set((s) => ({ showPauseMenu: !s.showPauseMenu })),
}));
