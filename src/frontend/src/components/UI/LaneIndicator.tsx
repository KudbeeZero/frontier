import { useLaneStore } from "../../stores/laneStore";

const LANES = [5, 4, 3, 2, 1];

export function LaneIndicator() {
  const { currentLane, laneFlash, changeLane } = useLaneStore();

  return (
    <div
      className="absolute pointer-events-auto select-none"
      style={{
        left: "16px",
        top: "40%",
        transform: "translateY(-50%)",
        zIndex: 20,
      }}
    >
      <div
        className="rounded px-2 py-2 flex flex-col items-center gap-1"
        style={{
          background: "rgba(0,0,0,0.78)",
          border: "1.5px solid rgba(0,200,255,0.35)",
          boxShadow: "0 0 14px rgba(0,200,255,0.10)",
          minWidth: "72px",
        }}
      >
        <div
          className="text-cyan-400/60 text-[9px] tracking-widest uppercase mb-1"
          style={{ fontFamily: "monospace" }}
        >
          ORBITAL
          <br />
          LANE
        </div>

        {LANES.map((lane) => {
          const isActive = lane === currentLane;
          const flash = isActive && laneFlash;
          return (
            <button
              key={lane}
              type="button"
              onClick={() => changeLane(lane > currentLane ? "up" : "down")}
              className="w-full flex items-center justify-center gap-1 rounded transition-all"
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                padding: "2px 4px",
                color: flash
                  ? "#ffffff"
                  : isActive
                    ? "#00ffff"
                    : "rgba(0,200,255,0.3)",
                textShadow: isActive
                  ? flash
                    ? "0 0 12px #ffffff, 0 0 4px #ffffff"
                    : "0 0 8px rgba(0,255,255,0.9)"
                  : "none",
                background: isActive
                  ? flash
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,255,255,0.08)"
                  : "transparent",
                border: isActive
                  ? flash
                    ? "1px solid rgba(255,255,255,0.4)"
                    : "1px solid rgba(0,255,255,0.4)"
                  : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
              data-ocid={`lane.item.${lane}`}
            >
              {isActive && <span style={{ fontSize: "9px" }}>▶</span>}
              <span>[{lane}]</span>
              {isActive && <span style={{ fontSize: "9px" }}>◀</span>}
            </button>
          );
        })}

        <div
          className="text-cyan-400/40 text-[8px] mt-1"
          style={{ fontFamily: "monospace" }}
        >
          Q↓ E↑
        </div>
      </div>
    </div>
  );
}
