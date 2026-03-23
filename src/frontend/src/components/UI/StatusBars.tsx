import { useShipStore } from "../../stores/shipStore";
import { holoPanel } from "../../styles/holo";

interface BarProps {
  label: string;
  value: number;
  max?: number;
  dangerColor?: string;
}

function StatBar({ label, value, max = 100, dangerColor }: BarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  let color = "#00ccff";
  if (label === "HULL") {
    color = pct > 60 ? "#00ff88" : pct > 30 ? "#ffaa00" : "#ff4444";
  } else if (label === "O2") {
    color = pct > 60 ? "#00e5ff" : pct > 30 ? "#ffaa00" : "#ff4444";
  } else if (label === "PWR") {
    color = pct > 60 ? "#ffe066" : pct > 30 ? "#ffaa00" : "#ff4444";
  } else if (label === "FUEL") {
    color = pct > 50 ? "#00ccff" : pct > 25 ? "#ffaa00" : "#ff4444";
  }
  if (dangerColor && pct < 30) color = dangerColor;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "8px",
          color: "rgba(0,200,255,0.5)",
          letterSpacing: "0.12em",
          width: "28px",
          textAlign: "right",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: "52px",
          height: "3px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "2px",
          overflow: "hidden",
          border: "1px solid rgba(0,200,255,0.12)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 4px ${color}80`,
            borderRadius: "2px",
            transition: "width 0.4s ease, background 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "8px",
          color,
          textShadow: `0 0 5px ${color}60`,
          width: "28px",
        }}
      >
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export function StatusBars() {
  const { hull, maxHull, oxygen, power, fuel, maxFuel } = useShipStore();

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: "44px",
        left: "12px",
        zIndex: 20,
      }}
    >
      <div
        style={{
          ...holoPanel,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          padding: "7px 10px",
        }}
      >
        <StatBar label="HULL" value={hull} max={maxHull} />
        <StatBar label="O2" value={oxygen} max={100} />
        <StatBar label="PWR" value={power} max={100} />
        <StatBar label="FUEL" value={fuel} max={maxFuel} />
      </div>
    </div>
  );
}
