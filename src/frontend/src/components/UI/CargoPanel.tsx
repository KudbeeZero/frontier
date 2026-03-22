import { useInventoryStore } from "../../stores/inventoryStore";
import { useShipStore } from "../../stores/shipStore";
import type { ResourceType } from "../../types/game";
import { RESOURCES } from "../../utils/constants";

export default function CargoPanel() {
  const { maxCargo } = useShipStore();
  const { resources, totalWeight } = useInventoryStore();

  const topResources = (Object.keys(resources) as ResourceType[])
    .filter((k) => resources[k] > 0)
    .sort((a, b) => resources[b] - resources[a])
    .slice(0, 5);

  const weight = Math.round(totalWeight());
  const pct = (weight / maxCargo) * 100;

  return (
    <div className="absolute bottom-4 left-4 hud-panel p-3 w-52 text-xs font-mono">
      <div className="text-cyan-400 text-[10px] tracking-[0.2em] font-bold mb-2 text-glow-cyan">
        CARGO
      </div>
      <div className="flex justify-between text-gray-300 mb-1">
        <span>CAPACITY</span>
        <span
          className={
            pct > 90
              ? "text-red-400"
              : pct > 70
                ? "text-amber-400"
                : "text-cyan-300"
          }
        >
          {weight}/{maxCargo} KG
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, pct)}%`,
            backgroundColor: pct > 90 ? "#FF3333" : "#00E6FF",
          }}
        />
      </div>
      {topResources.length === 0 ? (
        <div className="text-gray-500 text-[10px]">Empty</div>
      ) : (
        <div className="space-y-1">
          {topResources.map((type) => (
            <div key={type} className="flex justify-between text-gray-300">
              <span style={{ color: RESOURCES[type].color }}>
                {RESOURCES[type].icon} {RESOURCES[type].name}
              </span>
              <span>{resources[type]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
