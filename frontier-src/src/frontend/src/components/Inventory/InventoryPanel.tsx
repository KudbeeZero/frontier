import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useShipStore } from "../../stores/shipStore";
import type { ResourceType } from "../../types/game";
import { RESOURCES } from "../../utils/constants";

const rarityBorder: Record<string, string> = {
  common: "border-gray-600",
  uncommon: "border-blue-500",
  rare: "border-purple-500",
};

export default function InventoryPanel() {
  const { resources, components, totalWeight } = useInventoryStore();
  const { maxCargo, installComponent } = useShipStore();
  const { toggleInventory, addNotification } = useGameStore();

  const weight = Math.round(totalWeight());
  const resourceEntries = (Object.keys(resources) as ResourceType[]).filter(
    (k) => resources[k] > 0,
  );

  const handleInstall = (compId: string) => {
    const inv = useInventoryStore.getState();
    const comp = inv.components.find((c) => c.id === compId);
    if (!comp || comp.installed) return;
    installComponent(comp);
    inv.removeComponent(compId);
    addNotification(`${comp.name} installed!`, "success");
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="hud-panel w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
          <h2 className="text-cyan-400 tracking-[0.2em] font-bold font-mono">
            INVENTORY
          </h2>
          <div className="text-gray-400 text-sm font-mono">
            {weight}/{maxCargo} KG
          </div>
          <button
            type="button"
            onClick={toggleInventory}
            className="text-gray-400 hover:text-white text-xl pointer-events-auto"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-gray-400 text-xs tracking-widest mb-3 font-mono">
            RESOURCES
          </h3>
          {resourceEntries.length === 0 ? (
            <p className="text-gray-500 text-sm font-mono text-center py-4">
              No resources collected
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {resourceEntries.map((type) => (
                <div
                  key={type}
                  className={`border ${rarityBorder[RESOURCES[type].rarity]} bg-white/5 rounded p-3 text-center`}
                >
                  <div className="text-2xl mb-1">{RESOURCES[type].icon}</div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: RESOURCES[type].color }}
                  >
                    {RESOURCES[type].name}
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    {resources[type]}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {RESOURCES[type].rarity}
                  </div>
                </div>
              ))}
            </div>
          )}

          {components.length > 0 && (
            <>
              <h3 className="text-gray-400 text-xs tracking-widest mb-3 font-mono">
                COMPONENTS
              </h3>
              <div className="space-y-2">
                {components.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between border border-white/10 rounded p-3 bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-mono text-cyan-300">
                        {comp.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {comp.description}
                      </div>
                    </div>
                    {!comp.installed && (
                      <button
                        type="button"
                        onClick={() => handleInstall(comp.id)}
                        className="px-3 py-1 text-xs font-mono rounded border border-green-500 text-green-400 hover:bg-green-500/20 pointer-events-auto"
                      >
                        INSTALL
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
