import { useCameraStore } from "../../stores/cameraStore";
import { useGroundTargetStore } from "../../stores/groundTargetStore";

export function GroundTargetLockHUD() {
  const mode = useCameraStore((s) => s.mode);
  const lockedId = useGroundTargetStore((s) => s.lockedGroundTarget);
  const targets = useGroundTargetStore((s) => s.targets);
  const candidate = useGroundTargetStore((s) => s.groundLockCandidate);
  const dwell = useGroundTargetStore((s) => s.groundLockDwell);

  if (mode !== "combat") return null;

  const locked = lockedId ? targets.find((t) => t.id === lockedId) : null;
  const isAcquiring = !lockedId && candidate;

  if (!locked && !isAcquiring) return null;

  const target = locked ?? targets.find((t) => t.id === candidate);
  if (!target) return null;

  const hpPct = Math.round((target.hp / target.maxHp) * 100);
  const hpColor = hpPct > 50 ? "#00ff88" : hpPct > 25 ? "#ff8800" : "#ff2222";
  const dwellPct = Math.min((dwell / 0.5) * 100, 100);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "160px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 35,
        pointerEvents: "none",
        textAlign: "center",
        fontFamily: "monospace",
      }}
    >
      {/* Targeting box */}
      <div
        style={{
          display: "inline-block",
          border: lockedId
            ? "1px solid #00ffff"
            : "1px solid rgba(0,255,255,0.4)",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          borderRadius: 4,
          boxShadow: lockedId ? "0 0 12px rgba(0,255,255,0.4)" : "none",
          minWidth: 160,
          transition: "border-color 150ms, box-shadow 150ms",
        }}
      >
        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <div
            key={c}
            style={{
              position: "absolute",
              ...(c.includes("t") ? { top: -1 } : { bottom: -1 }),
              ...(c.includes("l") ? { left: -1 } : { right: -1 }),
              width: 8,
              height: 8,
              borderTop: c.includes("t") ? "2px solid #00ffff" : undefined,
              borderBottom: c.includes("b") ? "2px solid #00ffff" : undefined,
              borderLeft: c.includes("l") ? "2px solid #00ffff" : undefined,
              borderRight: c.includes("r") ? "2px solid #00ffff" : undefined,
            }}
          />
        ))}

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: lockedId ? "#00ffff" : "rgba(0,255,255,0.6)",
            marginBottom: 4,
            textShadow: lockedId ? "0 0 8px rgba(0,255,255,0.8)" : "none",
          }}
        >
          {lockedId ? "⬡ TARGET LOCKED" : "ACQUIRING..."}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#ffffff",
            fontWeight: "bold",
            marginBottom: 2,
          }}
        >
          {target.name}
        </div>

        <div
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 4,
          }}
        >
          GROUND TARGET
        </div>

        {/* HP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.5)",
              flexShrink: 0,
            }}
          >
            HP
          </span>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${hpPct}%`,
                height: "100%",
                background: hpColor,
                transition: "width 300ms ease, background 300ms ease",
                boxShadow: `0 0 4px ${hpColor}80`,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 8,
              color: hpColor,
              minWidth: 26,
              textAlign: "right",
            }}
          >
            {hpPct}%
          </span>
        </div>

        {/* Acquiring dwell bar */}
        {!lockedId && candidate && (
          <div style={{ marginTop: 6 }}>
            <div
              style={{
                fontSize: 8,
                color: "rgba(0,255,255,0.5)",
                marginBottom: 2,
              }}
            >
              LOCKING
            </div>
            <div
              style={{
                height: 3,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${dwellPct}%`,
                  height: "100%",
                  background: "#00ffff",
                  transition: "width 0.05s linear",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
