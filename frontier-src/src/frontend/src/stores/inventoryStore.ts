import { create } from "zustand";
import type { Component, ResourceType } from "../types/game";
import { RESOURCES } from "../utils/constants";

type ResourceRecord = Record<ResourceType, number>;

const emptyResources = (): ResourceRecord => ({
  iron: 0,
  silicon: 0,
  carbon: 0,
  titanium: 0,
  platinum: 0,
  rareEarth: 0,
  exoticMatter: 0,
  darkMatter: 0,
  quantumCrystals: 0,
});

interface InventoryState {
  resources: ResourceRecord;
  components: Component[];

  addResource: (type: ResourceType, amount: number) => void;
  removeResource: (type: ResourceType, amount: number) => boolean;
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  totalWeight: () => number;
  reset: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  resources: emptyResources(),
  components: [],

  addResource: (type, amount) =>
    set((s) => ({
      resources: { ...s.resources, [type]: s.resources[type] + amount },
    })),

  removeResource: (type, amount) => {
    const current = get().resources[type];
    if (current < amount) return false;
    set((s) => ({
      resources: { ...s.resources, [type]: s.resources[type] - amount },
    }));
    return true;
  },

  addComponent: (component) =>
    set((s) => ({ components: [...s.components, component] })),

  removeComponent: (id) =>
    set((s) => ({ components: s.components.filter((c) => c.id !== id) })),

  totalWeight: () => {
    const { resources } = get();
    return (Object.keys(resources) as ResourceType[]).reduce((total, type) => {
      return total + resources[type] * RESOURCES[type].weight;
    }, 0);
  },

  reset: () => set({ resources: emptyResources(), components: [] }),
}));
