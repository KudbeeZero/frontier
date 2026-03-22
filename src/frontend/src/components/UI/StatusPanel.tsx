import { useShipStore } from "../../stores/shipStore";
import { getSpeed } from "../../utils/physics";

function Bar({
  value,
  max,
  color,
}: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = pct > 50 ? color : pct > 25 ? "#FFB700" : "#FF3333";
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

export default function StatusPanel() {
  const { hull, maxHull, fuel, maxFuel, oxygen, power, velocity } =
    useShipStore();
  const speed = Math.round(getSpeed(velocity) * 20);

  return (
    <div className="absolute top-4 left-4 hud-panel p-3 w-52 text-xs font-mono">
      <div className="text-cyan-400 text-[10px] tracking-[0.2em] font-bold mb-2 text-glow-cyan">
        STATUS
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-gray-300 mb-1">
            <span>HULL</span>
            <span
              className={
                hull < 30
                  ? "text-red-400"
                  : hull < 60
                    ? "text-amber-400"
                    : "text-green-400"
              }
            >
              {Math.round(hull)}/{maxHull}
            </span>
          </div>
          <Bar value={hull} max={maxHull} color="#00FF88" />
        </div>
        <div>
          <div className="flex justify-between text-gray-300 mb-1">
            <span>FUEL</span>
            <span className={fuel < 20 ? "text-red-400" : "text-cyan-300"}>
              {Math.round(fuel)}%
            </span>
          </div>
          <Bar value={fuel} max={maxFuel} color="#00E6FF" />
        </div>
        <div>
          <div className="flex justify-between text-gray-300 mb-1">
            <span>OXYGEN</span>
            <span className={oxygen < 30 ? "text-red-400" : "text-green-400"}>
              {Math.round(oxygen)}%
            </span>
          </div>
          <Bar value={oxygen} max={100} color="#00FF88" />
        </div>
        <div>
          <div className="flex justify-between text-gray-300 mb-1">
            <span>POWER</span>
            <span className="text-amber-300">{Math.round(power)}%</span>
          </div>
          <Bar value={power} max={100} color="#FFB700" />
        </div>
        <div className="flex justify-between text-gray-300 pt-1 border-t border-white/10">
          <span>VELOCITY</span>
          <span className="text-cyan-300">{speed} m/s</span>
        </div>
      </div>
    </div>
  );
}
