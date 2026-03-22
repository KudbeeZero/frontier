import { useState } from "react";
import { useCraftingStore } from "../../stores/craftingStore";
import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import type { Recipe, ResourceType } from "../../types/game";
import { RESOURCES } from "../../utils/constants";

const CATEGORIES = ["all", "hull", "engine", "weapons", "utilities"] as const;
type Category = (typeof CATEGORIES)[number];

export default function CraftingPanel() {
  const {
    recipes,
    selectedRecipeId,
    selectRecipe,
    craftItem,
    canCraft,
    queue,
  } = useCraftingStore();
  const { resources } = useInventoryStore();
  const { toggleCrafting, addNotification } = useGameStore();
  const [category, setCategory] = useState<Category>("all");

  const filtered =
    category === "all"
      ? recipes
      : recipes.filter((r) => r.category === category);
  const selected = recipes.find((r) => r.id === selectedRecipeId);

  const handleCraft = () => {
    if (!selectedRecipeId) return;
    const success = craftItem(selectedRecipeId);
    if (success) {
      addNotification(`Crafted: ${selected?.name}`, "success");
    } else {
      addNotification("Insufficient resources!", "danger");
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="hud-panel w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center flex-shrink-0">
          <h2 className="text-cyan-400 tracking-[0.2em] font-bold font-mono">
            CRAFTING BAY
          </h2>
          {queue.length > 0 && (
            <span className="text-amber-400 text-xs font-mono">
              Queue: {queue.length}
            </span>
          )}
          <button
            type="button"
            onClick={toggleCrafting}
            className="text-gray-400 hover:text-white text-xl pointer-events-auto"
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-3 border-b border-white/10 flex-shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-xs font-mono rounded uppercase tracking-wider pointer-events-auto transition-colors ${
                category === cat
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Recipe list */}
          <div className="w-1/2 border-r border-white/10 overflow-y-auto p-2">
            {filtered.map((recipe) => {
              const craftable = canCraft(recipe.id);
              return (
                <button
                  type="button"
                  key={recipe.id}
                  onClick={() => selectRecipe(recipe.id)}
                  className={`w-full flex items-center justify-between p-3 rounded mb-1 cursor-pointer transition-colors pointer-events-auto text-left ${
                    selectedRecipeId === recipe.id
                      ? "bg-cyan-500/15 border border-cyan-500/40"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div>
                    <div className="text-sm font-mono text-gray-200">
                      {recipe.name}
                    </div>
                    <div className="text-[10px] text-gray-500 capitalize">
                      {recipe.category}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono ${craftable ? "text-green-400" : "text-red-400"}`}
                  >
                    {craftable ? "✓" : "✗"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recipe detail */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selected ? (
              <>
                <h3 className="text-cyan-300 font-mono font-bold mb-1">
                  {selected.name}
                </h3>
                <p className="text-gray-400 text-xs mb-4">
                  {selected.result.description}
                </p>

                <div className="mb-4">
                  <div className="text-gray-400 text-[10px] tracking-widest mb-2 font-mono">
                    REQUIRED
                  </div>
                  <div className="space-y-1">
                    {(
                      Object.entries(selected.ingredients) as [
                        ResourceType,
                        number,
                      ][]
                    ).map(([type, amount]) => {
                      const have = resources[type];
                      const hasEnough = have >= amount;
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between text-xs font-mono"
                        >
                          <span style={{ color: RESOURCES[type].color }}>
                            {RESOURCES[type].icon} {RESOURCES[type].name}
                          </span>
                          <span
                            className={
                              hasEnough ? "text-green-400" : "text-red-400"
                            }
                          >
                            {have}/{amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {Object.keys(selected.result.stats).length > 0 && (
                  <div className="mb-4">
                    <div className="text-gray-400 text-[10px] tracking-widest mb-2 font-mono">
                      STATS
                    </div>
                    {(
                      Object.entries(selected.result.stats) as [
                        string,
                        number,
                      ][]
                    ).map(([stat, val]) => (
                      <div
                        key={stat}
                        className="text-xs font-mono text-green-400"
                      >
                        +{val} {stat}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCraft}
                  disabled={!canCraft(selected.id)}
                  className="w-full py-2 text-sm font-mono rounded border transition-colors pointer-events-auto disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: canCraft(selected.id)
                      ? "rgba(0,255,136,0.15)"
                      : "rgba(255,255,255,0.05)",
                    borderColor: canCraft(selected.id) ? "#00FF88" : "#444",
                    color: canCraft(selected.id) ? "#00FF88" : "#666",
                    textShadow: canCraft(selected.id)
                      ? "0 0 10px #00FF88"
                      : "none",
                  }}
                >
                  CRAFT
                </button>
              </>
            ) : (
              <div className="text-gray-500 text-sm font-mono text-center pt-10">
                Select a blueprint
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
