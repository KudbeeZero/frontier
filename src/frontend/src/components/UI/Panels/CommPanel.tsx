import { useEffect, useRef } from "react";
import { useCombatLogStore } from "../../../stores/combatLogStore";

export function CommPanel() {
  const entries = useCombatLogStore((s) => s.entries);
  const scrollRef = useRef<HTMLDivElement>(null);
  const entriesLen = entries.length;

  // Constant-velocity scroll — no easing, as per animation spec
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entriesLen]);

  const levelColor = (l: "info" | "warn" | "alert") =>
    l === "alert"
      ? "rgba(255,80,80,0.95)"
      : l === "warn"
        ? "rgba(255,170,0,0.9)"
        : "rgba(0,200,255,0.8)";

  const visibleEntries = entries.slice(-20);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Comm relay header */}
      <div
        className="text-[10px] text-cyan-500/50 uppercase tracking-widest pb-2"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.15)" }}
      >
        A.E.G.I.S. COMM RELAY · SECURE CHANNEL
      </div>

      {/* No active transmissions notice */}
      <div className="text-center text-cyan-500/30 uppercase tracking-widest py-2">
        NO ACTIVE TRANSMISSIONS
      </div>

      {/* Combat log section */}
      <div
        style={{
          borderTop: "1px solid rgba(0,200,255,0.15)",
          paddingTop: "12px",
        }}
      >
        <div
          className="text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "rgba(0,200,255,0.5)" }}
        >
          COMBAT LOG
        </div>
        <div
          ref={scrollRef}
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            // constant-velocity scroll — controlled via scrollTop, no CSS easing
            scrollBehavior: "auto",
          }}
        >
          {visibleEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "8px",
                animation: "fadeInUp 0.2s ease",
              }}
            >
              <span style={{ color: levelColor(entry.level), flex: 1 }}>
                {entry.msg}
              </span>
              <span style={{ color: "rgba(0,200,255,0.3)", flexShrink: 0 }}>
                {entry.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
