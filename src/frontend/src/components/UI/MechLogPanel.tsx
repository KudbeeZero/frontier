import { useEffect, useRef, useState } from "react";
import { WEAPONS } from "../../config/weapons";
import { useShipStore } from "../../stores/shipStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";

interface LogEntry {
  time: string;
  msg: string;
  level: "info" | "warn" | "alert";
}

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

export function MechLogPanel() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([
    { time: now(), msg: "Systems initialized", level: "info" },
    { time: now(), msg: "Propulsion online", level: "info" },
    { time: now(), msg: "A.E.G.I.S. standing by", level: "info" },
  ]);

  const { hull, maxHull, oxygen, power, fuel } = useShipStore();
  const { ammo, cooldowns } = useWeaponsStore();

  const prevOxygenBucket = useRef(Math.floor(oxygen / 10));
  const prevHullBucket = useRef(Math.floor(hull / 10));
  const prevFuelBucket = useRef(Math.floor(fuel / 10));

  useEffect(() => {
    const bucket = Math.floor(oxygen / 10);
    if (bucket !== prevOxygenBucket.current) {
      prevOxygenBucket.current = bucket;
      if (oxygen < 30) {
        setLog((prev) => [
          { time: now(), msg: "CRITICAL: Oxygen below 30%", level: "alert" },
          ...prev.slice(0, 49),
        ]);
      }
    }
  }, [oxygen]);

  useEffect(() => {
    const bucket = Math.floor(hull / 10);
    if (bucket !== prevHullBucket.current) {
      prevHullBucket.current = bucket;
      if (hull < 30) {
        setLog((prev) => [
          {
            time: now(),
            msg: `Hull integrity low: ${Math.round(hull)}%`,
            level: "warn",
          },
          ...prev.slice(0, 49),
        ]);
      }
    }
  }, [hull]);

  useEffect(() => {
    const bucket = Math.floor(fuel / 10);
    if (bucket !== prevFuelBucket.current) {
      prevFuelBucket.current = bucket;
      if (fuel < 20) {
        setLog((prev) => [
          { time: now(), msg: "Fuel reserves critical", level: "alert" },
          ...prev.slice(0, 49),
        ]);
      }
    }
  }, [fuel]);

  const hullPct = Math.round((hull / maxHull) * 100);

  const levelColor = (l: LogEntry["level"]) =>
    l === "alert"
      ? "text-red-400"
      : l === "warn"
        ? "text-amber-400"
        : "text-cyan-400/70";

  const statBar = (val: number, max = 100) => {
    const pct = Math.max(0, Math.min(100, (val / max) * 100));
    const col = pct > 60 ? "#00ff88" : pct > 30 ? "#ffb700" : "#ff3333";
    return (
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: col }}
        />
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center pointer-events-auto"
      data-ocid="mechlog.panel"
    >
      {/* Floating panel — fixed above dock so it never overlaps the cockpit frame */}
      {open && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-80 bg-gray-950/97 border border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-500/15 font-mono text-xs overflow-hidden"
          style={{ zIndex: 50 }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/20 bg-black/60">
            <span className="text-cyan-400 tracking-widest uppercase text-[10px] font-bold">
              Mechanical Log
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white text-sm leading-none bg-transparent border-0 p-1"
              data-ocid="mechlog.close_button"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {/* Ammo */}
            <div>
              <div className="text-gray-400 uppercase tracking-widest text-[10px] mb-2">
                Ammunition
              </div>
              <div className="space-y-1.5">
                {WEAPONS.map((w) => {
                  const a = ammo[w.id];
                  const isInfinite = a === undefined;
                  return (
                    <div key={w.id} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: w.color }}
                      />
                      <span className="text-gray-300 w-20">{w.label}</span>
                      <span
                        className={
                          isInfinite
                            ? "text-cyan-400"
                            : a === 0
                              ? "text-red-400"
                              : "text-white"
                        }
                      >
                        {isInfinite ? "∞" : a}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div>
              <div className="text-gray-400 uppercase tracking-widest text-[10px] mb-2">
                System Status
              </div>
              <div className="space-y-2">
                {(
                  [
                    ["HULL", hullPct, 100],
                    ["OXYGEN", oxygen, 100],
                    ["POWER", power, 100],
                    ["FUEL", fuel, 100],
                  ] as [string, number, number][]
                ).map(([label, val, max]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-gray-400 w-14">{label}</span>
                    {statBar(val, max)}
                    <span className="text-white w-8 text-right">
                      {Math.round(val)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooldowns */}
            <div>
              <div className="text-gray-400 uppercase tracking-widest text-[10px] mb-2">
                Cooldowns
              </div>
              <div className="space-y-1">
                {WEAPONS.map((w) => {
                  const cd = cooldowns[w.id] ?? 0;
                  return (
                    <div key={w.id} className="flex items-center gap-2">
                      <span className="text-gray-300 w-20">{w.label}</span>
                      <span
                        className={cd > 0 ? "text-amber-400" : "text-green-400"}
                      >
                        {cd > 0 ? `${cd.toFixed(1)}s` : "READY"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Update history */}
            <div>
              <div className="text-gray-400 uppercase tracking-widest text-[10px] mb-2">
                Update History
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {log.map((entry, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: log entries are append-only
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-600 flex-shrink-0">
                      {entry.time}
                    </span>
                    <span className={levelColor(entry.level)}>{entry.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightning bolt toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Mechanical Log"
        data-ocid="mechlog.open_modal_button"
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
          open
            ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/30"
            : "border-cyan-500/40 bg-black/70 text-cyan-500/70 hover:border-cyan-400 hover:text-cyan-300"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <title>Mechanical Log</title>
          <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
        </svg>
      </button>
    </div>
  );
}
