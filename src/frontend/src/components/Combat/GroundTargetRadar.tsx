import { useCameraStore } from "../../stores/cameraStore";
import { useGroundTargetStore } from "../../stores/groundTargetStore";

export function GroundTargetRadar() {
  const mode = useCameraStore((s) => s.mode);
  const targets = useGroundTargetStore((s) => s.targets);
  const lockedId = useGroundTargetStore((s) => s.lockedGroundTarget);
  const destroyed = useGroundTargetStore((s) => s.destroyedCount);

  if (mode !== "combat") return null;

  const total = targets.length;
  const alive = targets.filter((t) => t.status !== "destroyed").length;

  const SIZE = 80;
  const CENTER = SIZE / 2;
  const R = SIZE * 0.38;

  return (
    <div
      style={{
        position: "fixed",
        top: 88,
        right: 10,
        zIndex: 30,
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(0,200,255,0.5)",
        borderRadius: 6,
        padding: "6px 8px",
        backdropFilter: "blur(6px)",
        pointerEvents: "none",
        minWidth: 100,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 8,
          color: "rgba(0,200,255,0.7)",
          letterSpacing: "0.15em",
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        SURFACE RADAR
      </div>

      {/* Circular radar */}
      <svg
        role="img"
        aria-label="Surface radar showing ground target positions"
        width={SIZE}
        height={SIZE}
        style={{ display: "block", margin: "0 auto 4px" }}
      >
        {/* Radar rings */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R}
          stroke="rgba(0,200,255,0.15)"
          strokeWidth={1}
          fill="none"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R * 0.6}
          stroke="rgba(0,200,255,0.1)"
          strokeWidth={1}
          fill="none"
        />
        {/* Cross hairs */}
        <line
          x1={CENTER}
          y1={CENTER - R}
          x2={CENTER}
          y2={CENTER + R}
          stroke="rgba(0,200,255,0.1)"
          strokeWidth={0.5}
        />
        <line
          x1={CENTER - R}
          y1={CENTER}
          x2={CENTER + R}
          y2={CENTER}
          stroke="rgba(0,200,255,0.1)"
          strokeWidth={0.5}
        />
        {/* Planet center dot */}
        <circle cx={CENTER} cy={CENTER} r={4} fill="rgba(30,80,255,0.5)" />

        {/* Target dots */}
        {targets.map((t) => {
          // Map lon/lat to radar position
          // lon maps to X angle, lat maps to Y angle on radar circle
          const rx = CENTER + Math.cos(t.lon) * Math.cos(t.lat) * R;
          const ry = CENTER - Math.sin(t.lat) * R;
          const isLocked = lockedId === t.id;
          const color =
            t.status === "destroyed"
              ? "#333"
              : t.hp >= t.maxHp * 0.5
                ? "#00ff88"
                : t.hp >= t.maxHp * 0.25
                  ? "#ff8800"
                  : "#ff2222";

          return (
            <g key={t.id}>
              <circle
                cx={rx}
                cy={ry}
                r={isLocked ? 3.5 : 2.5}
                fill={color}
                opacity={t.status === "destroyed" ? 0.3 : 1}
              />
              {isLocked && (
                <circle
                  cx={rx}
                  cy={ry}
                  r={6}
                  fill="none"
                  stroke="#00ffff"
                  strokeWidth={1}
                  opacity={0.8}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Kill counter */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: destroyed > 0 ? "#00ff88" : "rgba(255,255,255,0.5)",
          textAlign: "center",
          letterSpacing: "0.1em",
        }}
      >
        {alive}/{total} REMAINING
      </div>
    </div>
  );
}
