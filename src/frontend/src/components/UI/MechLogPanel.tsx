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
      if (oxygen < 30)
        setLog((prev) => [
          { time: now(), msg: "CRITICAL: Oxygen below 30%", level: "alert" },
          ...prev.slice(0, 49),
        ]);
    }
  }, [oxygen]);

  useEffect(() => {
    const bucket = Math.floor(hull / 10);
    if (bucket !== prevHullBucket.current) {
      prevHullBucket.current = bucket;
      if (hull < 30)
        setLog((prev) => [
          {
            time: now(),
            msg: `Hull integrity low: ${Math.round(hull)}%`,
            level: "warn",
          },
          ...prev.slice(0, 49),
        ]);
    }
  }, [hull]);

  useEffect(() => {
    const bucket = Math.floor(fuel / 10);
    if (bucket !== prevFuelBucket.current) {
      prevFuelBucket.current = bucket;
      if (fuel < 20)
        setLog((prev) => [
          { time: now(), msg: "Fuel reserves critical", level: "alert" },
          ...prev.slice(0, 49),
        ]);
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
      <div
        style={{
          flex: 1,
          height: "3px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px",
          overflow: "hidden",
          border: "1px solid rgba(0,200,255,0.3)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: col,
            borderRadius: "2px",
            transition: "width 500ms ease",
          }}
        />
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center pointer-events-auto"
      data-ocid="mechlog.panel"
    >
      {/* Floating panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "320px",
            // Standardized 30% opacity
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,200,255,0.5)",
            borderRadius: "8px",
            boxShadow: "0 0 24px rgba(0,200,255,0.12)",
            fontFamily: "monospace",
            fontSize: "12px",
            overflow: "hidden",
            zIndex: 50,
            // Panel show/hide: 300ms ease-out
            animation: "panelIn 300ms ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              borderBottom: "1px solid rgba(0,200,255,0.2)",
              background: "rgba(0,200,255,0.06)",
            }}
          >
            <span
              style={{
                color: "#00ccff",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              Mechanical Log
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                color: "rgba(255,255,255,0.7)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px 4px",
                transition: "color 150ms ease",
              }}
              data-ocid="mechlog.close_button"
            >
              ✕
            </button>
          </div>

          <div
            style={{
              padding: "16px",
              maxHeight: "260px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Ammo */}
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontSize: "10px",
                  marginBottom: "8px",
                }}
              >
                Ammunition
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {WEAPONS.map((w) => {
                  const a = ammo[w.id];
                  return (
                    <div
                      key={w.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          backgroundColor: w.color,
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          width: "80px",
                        }}
                      >
                        {w.label}
                      </span>
                      <span
                        style={{
                          color:
                            a === undefined
                              ? "#00ccff"
                              : a === 0
                                ? "#ff4444"
                                : "white",
                        }}
                      >
                        {a === undefined ? "∞" : a}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontSize: "10px",
                  marginBottom: "8px",
                }}
              >
                System Status
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {(
                  [
                    ["HULL", hullPct, 100],
                    ["OXYGEN", oxygen, 100],
                    ["POWER", power, 100],
                    ["FUEL", fuel, 100],
                  ] as [string, number, number][]
                ).map(([label, val, max]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,255,255,0.7)", width: "56px" }}
                    >
                      {label}
                    </span>
                    {statBar(val, max)}
                    <span
                      style={{
                        color: "white",
                        width: "32px",
                        textAlign: "right",
                      }}
                    >
                      {Math.round(val)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooldowns */}
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontSize: "10px",
                  marginBottom: "8px",
                }}
              >
                Cooldowns
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {WEAPONS.map((w) => {
                  const cd = cooldowns[w.id] ?? 0;
                  return (
                    <div
                      key={w.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          width: "80px",
                        }}
                      >
                        {w.label}
                      </span>
                      <span style={{ color: cd > 0 ? "#ffaa00" : "#00ff88" }}>
                        {cd > 0 ? `${cd.toFixed(1)}s` : "READY"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Log */}
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontSize: "10px",
                  marginBottom: "8px",
                }}
              >
                Update History
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  maxHeight: "96px",
                  overflowY: "auto",
                  scrollBehavior: "auto",
                }}
              >
                {log.map((entry, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: log is append-only
                  <div key={i} style={{ display: "flex", gap: "8px" }}>
                    <span
                      style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
                    >
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

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Mechanical Log"
        data-ocid="mechlog.open_modal_button"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: open
            ? "2px solid rgba(0,200,255,1.0)"
            : "2px solid rgba(0,200,255,0.5)",
          background: open ? "rgba(0,200,255,0.12)" : "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          color: open ? "#00ccff" : "rgba(0,200,255,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          // 150ms interactive
          transition: "all 150ms ease",
          boxShadow: open ? "0 0 16px rgba(0,200,255,0.3)" : "none",
        }}
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
