import { useLaneStore } from "../../stores/laneStore";
import { holoPanel } from "../../styles/holo";

export function LaneIndicator() {
  const { currentLane, changeLane } = useLaneStore();

  return (
    <div
      className="absolute pointer-events-auto select-none"
      style={{
        top: "12px",
        left: "12px",
        zIndex: 20,
      }}
    >
      <div
        style={{
          ...holoPanel,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 10px",
          whiteSpace: "nowrap",
        }}
      >
        {/* Down button */}
        <button
          type="button"
          onClick={() => changeLane("down")}
          aria-label="Lane down"
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "rgba(0,200,255,0.6)",
            background: "transparent",
            border: "none",
            padding: "0 2px",
            cursor: "pointer",
            lineHeight: 1,
          }}
          data-ocid="lane.item.1"
        >
          ▼
        </button>

        {/* Label + lane number */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "10px",
            color: "rgba(0,200,255,0.55)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          LANE
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "15px",
            fontWeight: "bold",
            color: "#00e5ff",
            textShadow:
              "0 0 10px rgba(0,229,255,0.9), 0 0 20px rgba(0,229,255,0.4)",
            letterSpacing: "0.05em",
            minWidth: "18px",
            textAlign: "center",
          }}
        >
          {currentLane}
        </span>

        {/* Up button */}
        <button
          type="button"
          onClick={() => changeLane("up")}
          aria-label="Lane up"
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "rgba(0,200,255,0.6)",
            background: "transparent",
            border: "none",
            padding: "0 2px",
            cursor: "pointer",
            lineHeight: 1,
          }}
          data-ocid="lane.item.5"
        >
          ▲
        </button>

        {/* Hint */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "8px",
            color: "rgba(0,200,255,0.35)",
            letterSpacing: "0.08em",
          }}
        >
          Q/E
        </span>
      </div>
    </div>
  );
}
