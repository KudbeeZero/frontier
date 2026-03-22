import { useState } from "react";
import { useShipStore } from "../../stores/shipStore";
import { STATION_POSITIONS } from "../../utils/constants";

export default function RadarMinimap() {
  const position = useShipStore((s) => s.position);
  const radarRadius = 200;
  const svgRadius = 55;
  const [collapsed, setCollapsed] = useState(false);

  const toRadarCoord = (wx: number, wz: number) => {
    const dx = (wx - position[0]) / radarRadius;
    const dz = (wz - position[2]) / radarRadius;
    return { x: dx * svgRadius, y: dz * svgRadius };
  };

  return (
    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20 p-3 animate-slide-in-right">
      <button
        type="button"
        className="w-full text-left text-cyan-400 text-[10px] tracking-[0.2em] font-bold mb-2 font-mono text-glow-cyan cursor-pointer select-none hover:text-cyan-300 transition-colors flex items-center bg-transparent border-0 p-0"
        onClick={() => setCollapsed((c) => !c)}
      >
        RADAR
        <span className="ml-1 text-[8px]">{collapsed ? "▶" : "▼"}</span>
      </button>
      <div className={collapsed ? "hidden" : ""}>
        <div className="relative" style={{ width: 120, height: 120 }}>
          <svg width={120} height={120} aria-hidden="true">
            <circle
              cx={60}
              cy={60}
              r={55}
              fill="rgba(0,20,40,0.6)"
              stroke="rgba(0,230,255,0.3)"
              strokeWidth={1}
            />
            {[18, 36, 55].map((r) => (
              <circle
                key={r}
                cx={60}
                cy={60}
                r={r}
                fill="none"
                stroke="rgba(0,230,255,0.15)"
                strokeWidth={0.5}
              />
            ))}
            <line
              x1={5}
              y1={60}
              x2={115}
              y2={60}
              stroke="rgba(0,230,255,0.1)"
              strokeWidth={0.5}
            />
            <line
              x1={60}
              y1={5}
              x2={60}
              y2={115}
              stroke="rgba(0,230,255,0.1)"
              strokeWidth={0.5}
            />
            {STATION_POSITIONS.map((sp) => {
              const { x, y } = toRadarCoord(sp[0], sp[2]);
              const cx = 60 + x;
              const cy = 60 + y;
              if (cx < 5 || cx > 115 || cy < 5 || cy > 115) return null;
              return (
                <rect
                  key={`st-${sp[0]}-${sp[2]}`}
                  x={cx - 3}
                  y={cy - 3}
                  width={6}
                  height={6}
                  fill="#00E6FF"
                  opacity={0.8}
                />
              );
            })}
            <circle cx={60} cy={60} r={4} fill="#00FF88" />
            <polygon points="60,52 57,60 63,60" fill="#00FF88" />
          </svg>
        </div>
      </div>
    </div>
  );
}
