import { create } from "zustand";

export type MenuPanel = "ship" | "cargo" | "nav" | "scan" | "comm" | null;

interface MenuState {
  activePanel: MenuPanel;
  showCircularMenu: boolean;
  openPanel: (panel: MenuPanel) => void;
  closePanel: () => void;
  togglePanel: (panel: MenuPanel) => void;
  toggleCircularMenu: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  activePanel: null,
  showCircularMenu: false,
  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? null : panel });
  },
  toggleCircularMenu: () =>
    set((s) => ({ showCircularMenu: !s.showCircularMenu })),
}));
