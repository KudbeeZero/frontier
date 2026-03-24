import { create } from "zustand";
import type { Recipe, ResourceType } from "../types/game";
import { RECIPES } from "../utils/constants";
import { useInventoryStore } from "./inventoryStore";
import { useShipStore } from "./shipStore";

interface CraftQueueItem {
  recipeId: string;
  progress: number;
}

interface CraftingState {
  queue: CraftQueueItem[];
  recipes: Recipe[];
  selectedRecipeId: string | null;

  selectRecipe: (id: string | null) => void;
  canCraft: (recipeId: string) => boolean;
  craftItem: (recipeId: string) => boolean;
  addToQueue: (recipeId: string) => void;
}

export const useCraftingStore = create<CraftingState>((set, get) => ({
  queue: [],
  recipes: RECIPES,
  selectedRecipeId: null,

  selectRecipe: (id) => set({ selectedRecipeId: id }),

  canCraft: (recipeId) => {
    const recipe = get().recipes.find((r) => r.id === recipeId);
    if (!recipe) return false;
    const { resources } = useInventoryStore.getState();
    return (
      Object.entries(recipe.ingredients) as [ResourceType, number][]
    ).every(([type, amount]) => resources[type] >= amount);
  },

  craftItem: (recipeId) => {
    const recipe = get().recipes.find((r) => r.id === recipeId);
    if (!recipe) return false;
    if (!get().canCraft(recipeId)) return false;

    const inv = useInventoryStore.getState();
    for (const [type, amount] of Object.entries(recipe.ingredients) as [
      ResourceType,
      number,
    ][]) {
      inv.removeResource(type, amount);
    }

    const component = {
      id: `comp-${Date.now()}`,
      ...recipe.result,
      installed: false,
    };

    inv.addComponent(component);
    return true;
  },

  addToQueue: (recipeId) => {
    if (!get().canCraft(recipeId)) return;
    const recipe = get().recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const inv = useInventoryStore.getState();
    for (const [type, amount] of Object.entries(recipe.ingredients) as [
      ResourceType,
      number,
    ][]) {
      inv.removeResource(type, amount);
    }

    set((s) => ({ queue: [...s.queue, { recipeId, progress: 0 }] }));

    // Simulate crafting time
    setTimeout(() => {
      const component = {
        id: `comp-${Date.now()}`,
        ...recipe.result,
        installed: false,
      };
      useInventoryStore.getState().addComponent(component);
      set((s) => ({ queue: s.queue.filter((q) => q.recipeId !== recipeId) }));
    }, 3000);
  },
}));
