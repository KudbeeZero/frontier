import { useShipStore } from "../../../stores/shipStore";

function StatBar({
  label,
  value,
  max,
}: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = pct > 60 ? "#00e5ff" : pct > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-xs">
        <span className="text-gray-400 uppercase tracking-widest">{label}</span>
        <span style={{ color }} className="font-bold">
          {Math.round(value)}/{max}
        </span>
      </div>
      <div
        className="h-1.5 rounded overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

function dispatchKey(type: "keydown" | "keyup", code: string, key: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true }));
}

export function ShipPanel() {
  const { hull, maxHull, oxygen, fuel, maxFuel, power, velocity } =
    useShipStore();

  const vel = velocity ?? [0, 0, 0];
  const speed = Math.hypot(vel[0] ?? 0, vel[1] ?? 0, vel[2] ?? 0);

  return (
    <div className="space-y-4">
      <div
        className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest pb-2"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.15)" }}
      >
        System Status
      </div>
      <StatBar label="HULL" value={hull} max={maxHull} />
      <StatBar label="OXYGEN" value={oxygen} max={100} />
      <StatBar label="FUEL" value={fuel} max={maxFuel} />
      <StatBar label="POWER" value={power} max={100} />

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(0,200,255,0.15)" }} />

      {/* Propulsion section */}
      <div
        className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest pb-2"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.15)" }}
      >
        Propulsion
      </div>
      <div className="flex gap-2 pointer-events-auto">
        <button
          type="button"
          data-ocid="ship.boost_button"
          onPointerDown={() => dispatchKey("keydown", "Space", " ")}
          onPointerUp={() => dispatchKey("keyup", "Space", " ")}
          onPointerLeave={() => dispatchKey("keyup", "Space", " ")}
          className="flex-1 py-2 rounded border-2 border-yellow-500 bg-yellow-500/20 text-yellow-400 font-bold font-mono text-xs tracking-widest uppercase hover:bg-yellow-500/40 active:scale-95 transition-all"
        >
          BOOST
        </button>
        <button
          type="button"
          data-ocid="ship.brake_button"
          onPointerDown={() => dispatchKey("keydown", "ShiftLeft", "Shift")}
          onPointerUp={() => dispatchKey("keyup", "ShiftLeft", "Shift")}
          onPointerLeave={() => dispatchKey("keyup", "ShiftLeft", "Shift")}
          className="flex-1 py-2 rounded border-2 border-red-500 bg-red-500/20 text-red-400 font-bold font-mono text-xs tracking-widest uppercase hover:bg-red-500/40 active:scale-95 transition-all"
        >
          BRAKE
        </button>
      </div>

      {/* Navigation section */}
      <div
        className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest pb-2"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.15)" }}
      >
        Navigation
      </div>
      <div className="flex justify-between font-mono text-xs">
        <span className="text-gray-400 uppercase tracking-widest">
          Velocity
        </span>
        <span className="text-cyan-300 font-bold">{speed.toFixed(1)} KM/S</span>
      </div>
    </div>
  );
}
