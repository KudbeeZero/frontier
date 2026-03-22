import { useInventoryStore } from "../../../stores/inventoryStore";
import type { ResourceType } from "../../../types/game";
import { RESOURCES } from "../../../utils/constants";

export function CargoPanel() {
  const { resources, totalWeight } = useInventoryStore();
  const weight = totalWeight();
  const capacity = 500;
  const pct = Math.min(100, (weight / capacity) * 100);

  const nonZero = (Object.keys(resources) as ResourceType[]).filter(
    (k) => resources[k] > 0,
  );

  return (
    <div className="space-y-4">
      {/* Weight bar */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-xs">
          <span className="text-gray-400 uppercase tracking-widest">
            CARGO WEIGHT
          </span>
          <span className="text-cyan-400 font-bold">
            {Math.round(weight)} / {capacity} KG
          </span>
        </div>
        <div
          className="h-2 rounded overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct > 80 ? "#ef4444" : "#00e5ff",
              boxShadow: `0 0 6px ${pct > 80 ? "#ef4444" : "#00e5ff"}`,
            }}
          />
        </div>
      </div>

      <div
        className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest pb-1"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.15)" }}
      >
        Resources
      </div>

      {nonZero.length === 0 ? (
        <div className="text-center font-mono text-cyan-500/30 uppercase tracking-widest text-xs py-6">
          CARGO HOLD EMPTY
        </div>
      ) : (
        <div className="space-y-2">
          {nonZero.map((type) => (
            <div key={type} className="flex justify-between font-mono text-xs">
              <span className="text-gray-300 uppercase tracking-wide">
                {RESOURCES[type]?.name ?? type}
              </span>
              <span className="text-cyan-400 font-bold">{resources[type]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
