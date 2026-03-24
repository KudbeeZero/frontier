import { useShipStore } from "../../stores/shipStore";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { STATION_POSITIONS } from "../../utils/constants";

const RADAR_RADIUS = 200;
const SVG_SIZE = 140;
const CENTER = SVG_SIZE / 2;
const SVG_R = 62;

function compassLabel(angle: number) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((angle * 180) / Math.PI + 360) / 45) % 8;
  return labels[idx];
}

export default function RadarMinimap() {
  const position = useShipStore((s) => s.position);
  const enemies = useEnemyStore((s) => s.enemies);
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);

  const toRadarCoord = (wx: number, wz: number) => {
    const dx = ((wx - position[0]) / RADAR_RADIUS) * SVG_R;
    const dz = ((wz - position[2]) / RADAR_RADIUS) * SVG_R;
    return { x: CENTER + dx, y: CENTER + dz };
  };

  return (
    <div className="absolute bottom-6 right-4 font-mono pointer-events-none select-none">
      {/* E-RADAR title */}
      <div
        className="text-[10px] tracking-widest uppercase mb-1 text-right"
        style={{ color: "#ffb700" }}
      >
        E-RADAR
      </div>

      {/* Radar circle */}
      <div
        style={{
          background: "rgba(0,0,0,0.82)",
          border: "1.5px solid rgba(0,200,255,0.35)",
          borderRadius: "50%",
          padding: 4,
          boxShadow: "0 0 18px rgba(0,200,255,0.12)",
          display: "inline-block",
        }}
      >
        <svg width={SVG_SIZE} height={SVG_SIZE} aria-label="Radar" role="img">
          {/* Background */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={SVG_R}
            fill="rgba(0,15,30,0.88)"
            stroke="rgba(0,200,255,0.4)"
            strokeWidth={1.5}
          />
          {/* Rings */}
          {[20, 40, SVG_R].map((r) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              stroke="rgba(0,200,255,0.12)"
              strokeWidth={0.5}
            />
          ))}
          {/* Cross lines */}
          <line
            x1={CENTER}
            y1={CENTER - SVG_R}
            x2={CENTER}
            y2={CENTER + SVG_R}
            stroke="rgba(0,200,255,0.1)"
            strokeWidth={0.5}
          />
          <line
            x1={CENTER - SVG_R}
            y1={CENTER}
            x2={CENTER + SVG_R}
            y2={CENTER}
            stroke="rgba(0,200,255,0.1)"
            strokeWidth={0.5}
          />

          {/* Station / SAT markers */}
          {STATION_POSITIONS.map((sp) => {
            const { x, y } = toRadarCoord(sp[0], sp[2]);
            if (x < 4 || x > SVG_SIZE - 4 || y < 4 || y > SVG_SIZE - 4)
              return null;
            return (
              <g key={`st-${sp[0]}-${sp[2]}`}>
                <rect
                  x={x - 3}
                  y={y - 3}
                  width={6}
                  height={6}
                  fill="#00E6FF"
                  opacity={0.9}
                />
                <text
                  x={x + 5}
                  y={y + 3}
                  fill="#00E6FF"
                  fontSize={7}
                  opacity={0.8}
                >
                  SAT
                </text>
              </g>
            );
          })}

          {/* Enemy triangles — orange, with compass label */}
          {enemies.map((enemy) => {
            const dist = (enemy as any).distance ?? RADAR_RADIUS;
            const wx =
              dist *
              Math.cos((enemy as any).phi ?? 0) *
              Math.cos((enemy as any).theta ?? 0);
            const wz =
              dist *
              Math.cos((enemy as any).phi ?? 0) *
              Math.sin((enemy as any).theta ?? 0);
            const { x, y } = toRadarCoord(wx, wz);
            if (x < 4 || x > SVG_SIZE - 4 || y < 4 || y > SVG_SIZE - 4)
              return null;
            const isLocked = enemy.id === lockedTarget;
            const color = isLocked ? "#ff4444" : "#ff8800";
            const angle = Math.atan2(wz - position[2], wx - position[0]);
            const label = compassLabel(angle);
            return (
              <g key={enemy.id}>
                <polygon
                  points={`${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}`}
                  fill={color}
                  opacity={isLocked ? 1 : 0.85}
                />
                <text x={x + 6} y={y + 2} fill={color} fontSize={7}>
                  {label}
                </text>
                {isLocked && (
                  <circle
                    cx={x}
                    cy={y}
                    r={8}
                    fill="none"
                    stroke="#ff4444"
                    strokeWidth={1}
                    opacity={0.6}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;0.1;0.6"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Player — green dot + directional triangle */}
          <circle cx={CENTER} cy={CENTER} r={4} fill="#00FF88" />
          <polygon
            points={`${CENTER},${CENTER - 7} ${CENTER - 3},${CENTER + 1} ${CENTER + 3},${CENTER + 1}`}
            fill="#00FF88"
          />
        </svg>
      </div>

      {/* Contact count */}
      <div
        className="text-[11px] tracking-widest uppercase mt-1.5 text-right"
        style={{ color: "#ffb700" }}
      >
        {enemies.length} CONTACTS
      </div>
    </div>
  );
}
