import { useLaneStore } from "../../stores/laneStore";

export function AimCone() {
  const aimAngle = useLaneStore((s) => s.aimAngle);

  const cx = 100;
  const cy = 110;
  const arcR = 80;
  const indicatorR = 72;
  const outerR = 86;
  const isWarning = Math.abs(aimAngle) >= 75;
  const isLimit = Math.abs(aimAngle) >= 85;

  const svgAimAngle = 270 + aimAngle;
  const radAim = (svgAimAngle * Math.PI) / 180;
  const lineX = cx + indicatorR * Math.cos(radAim);
  const lineY = cy + indicatorR * Math.sin(radAim);

  const arcStartX = cx + arcR * Math.cos(Math.PI);
  const arcStartY = cy + arcR * Math.sin(Math.PI);
  const arcEndX = cx + arcR * Math.cos(0);
  const arcEndY = cy;

  const ticks = [-75, -45, -15, 0, 15, 45, 75];
  const accentColor = isLimit ? "#ff3333" : isWarning ? "#ffaa00" : "#00ffff";

  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        bottom: "68px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        width: "200px",
        height: "120px",
      }}
    >
      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        role="img"
        aria-label="Aim cone overlay"
        style={{ overflow: "visible" }}
      >
        {/* Outer limit arc glow */}
        <path
          d={`M ${arcStartX} ${arcStartY} A ${outerR} ${outerR} 0 0 1 ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke="rgba(0,200,255,0.08)"
          strokeWidth="12"
        />

        {/* Main arc */}
        <path
          d={`M ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 0 1 ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke="rgba(0,200,255,0.25)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Warning zone highlight when near limit */}
        {isWarning && (
          <path
            d={`M ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 0 1 ${arcEndX} ${arcEndY}`}
            fill="none"
            stroke="rgba(255,80,0,0.3)"
            strokeWidth="3"
          />
        )}

        {/* Tick marks */}
        {ticks.map((t) => {
          const a = ((270 + t) * Math.PI) / 180;
          const innerR = t === 0 ? arcR - 12 : arcR - 7;
          const x1 = cx + arcR * Math.cos(a);
          const y1 = cy + arcR * Math.sin(a);
          const x2 = cx + innerR * Math.cos(a);
          const y2 = cy + innerR * Math.sin(a);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={t === 0 ? "rgba(0,255,255,0.6)" : "rgba(0,200,255,0.35)"}
              strokeWidth={t === 0 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Center reference line */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - arcR + 8}
          stroke="rgba(0,200,255,0.15)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />

        {/* Aim line */}
        <line
          x1={cx}
          y1={cy}
          x2={lineX}
          y2={lineY}
          stroke={accentColor}
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 3px ${accentColor})` }}
        />

        {/* Crosshair dot at aim point */}
        <circle
          cx={lineX}
          cy={lineY}
          r="3"
          fill={accentColor}
          style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
        />

        {/* Center pivot dot */}
        <circle cx={cx} cy={cy} r="2" fill="rgba(0,200,255,0.6)" />

        {/* Angle readout */}
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill={accentColor}
          fontSize="8"
          fontFamily="monospace"
          style={{ userSelect: "none" }}
        >
          {aimAngle > 0 ? "+" : ""}
          {Math.round(aimAngle)}°
        </text>

        {/* Warning text */}
        {isLimit && (
          <text
            x={cx}
            y={cy - arcR - 6}
            textAnchor="middle"
            fill="#ff3333"
            fontSize="7"
            fontFamily="monospace"
          >
            LIMIT
          </text>
        )}
      </svg>
    </div>
  );
}
