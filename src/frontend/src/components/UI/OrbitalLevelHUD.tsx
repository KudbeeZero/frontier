import { useGroundTargetStore } from "../../stores/groundTargetStore";
import { useLaneStore } from "../../stores/laneStore";
import {
  ORBITAL_LEVEL_CONFIGS,
  useOrbitalLevelStore,
} from "../../stores/orbitalLevelStore";

export function OrbitalLevelHUD() {
  const { currentLevel, levelStatus, isAdvancing } = useOrbitalLevelStore();
  const { startLevel } = useOrbitalLevelStore();
  const changeLane = useLaneStore((s) => s.changeLane);
  const aliveCount = useGroundTargetStore(
    (s) => s.targets.filter((t) => t.status !== "destroyed").length,
  );
  const totalCount = useGroundTargetStore((s) => s.targets.length);
  const currentConfig = ORBITAL_LEVEL_CONFIGS.find(
    (c) => c.level === currentLevel,
  )!;

  const handleSelectLevel = (level: number) => {
    const status = levelStatus[level];
    if (status === "locked") return;
    // sync lane
    const diff = level - currentLevel;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) changeLane("up");
    } else if (diff < 0) {
      for (let i = 0; i < -diff; i++) changeLane("down");
    }
    startLevel(level);
    import("../../stores/groundTargetStore").then(
      ({ useGroundTargetStore: s }) => {
        s.getState().resetForLevel(level);
      },
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 8,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
        pointerEvents: "auto",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        width: 168,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(0,200,255,0.4)",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          padding: "6px 10px 4px",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontSize: 8,
            letterSpacing: "0.2em",
            color: "rgba(0,200,255,0.8)",
            fontWeight: "bold",
          }}
        >
          ORBITAL COMBAT
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#fff",
            fontWeight: "bold",
            marginTop: 2,
            textShadow: `0 0 8px ${currentConfig.ringColor}`,
          }}
        >
          {currentConfig.name.toUpperCase()}
        </div>
      </div>

      {/* Level list — 5 down to 1 */}
      {[5, 4, 3, 2, 1].map((lvl) => {
        const cfg = ORBITAL_LEVEL_CONFIGS.find((c) => c.level === lvl)!;
        const status = levelStatus[lvl];
        const isActive = lvl === currentLevel;
        const isLocked = status === "locked";
        const isDone = status === "completed";

        let bgColor = "rgba(0,0,0,0.4)";
        let borderColor = "rgba(255,255,255,0.08)";
        let textColor = "rgba(255,255,255,0.3)";
        let dotColor = "rgba(255,255,255,0.2)";
        let dotChar = "○";

        if (isDone) {
          bgColor = "rgba(0,60,20,0.5)";
          borderColor = "rgba(0,255,136,0.3)";
          textColor = "rgba(0,255,136,0.7)";
          dotColor = "#00ff88";
          dotChar = "✓";
        } else if (isActive) {
          bgColor = "rgba(0,20,40,0.7)";
          borderColor = `${cfg.ringColor}80`;
          textColor = "#ffffff";
          dotColor = cfg.ringColor;
          dotChar = "▶";
        }

        const isBottom = lvl === 1;
        const isTop = lvl === 5;

        return (
          <button
            key={lvl}
            type="button"
            onClick={() => handleSelectLevel(lvl)}
            disabled={isLocked}
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderTop: isTop ? undefined : "none",
              borderRadius: isBottom ? "0 0 6px 6px" : "0",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: isLocked ? "not-allowed" : "pointer",
              backdropFilter: "blur(6px)",
              transition: "background 150ms ease",
              width: "100%",
              textAlign: "left",
              boxShadow: isActive
                ? `inset 0 0 12px ${cfg.ringColor}20`
                : "none",
            }}
          >
            {/* Dot / status icon */}
            <span
              style={{
                fontSize: 10,
                color: dotColor,
                minWidth: 12,
                textAlign: "center",
                textShadow: isActive ? `0 0 8px ${cfg.ringColor}` : "none",
              }}
            >
              {dotChar}
            </span>

            {/* Level info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: textColor,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                LVL {lvl} — {cfg.altitudeLabel}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: isLocked
                    ? "rgba(255,255,255,0.2)"
                    : isDone
                      ? "rgba(0,255,136,0.5)"
                      : "rgba(255,255,255,0.5)",
                  marginTop: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isLocked
                  ? "LOCKED"
                  : isDone
                    ? `CLEARED • ${cfg.creditReward * cfg.targetCount}cr`
                    : isActive
                      ? `${aliveCount}/${totalCount} targets`
                      : cfg.enemyTypeName}
              </div>
            </div>

            {/* Right: credit or lock icon */}
            {!isLocked && !isDone && (
              <div
                style={{
                  fontSize: 8,
                  color: "rgba(255,200,0,0.7)",
                  flexShrink: 0,
                }}
              >
                +{cfg.creditReward}cr
              </div>
            )}
            {isLocked && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
                🔒
              </span>
            )}
          </button>
        );
      })}

      {/* Progress bar for active level */}
      <div
        style={{
          marginTop: 4,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(0,200,255,0.2)",
          borderRadius: 4,
          padding: "5px 8px",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 8,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 4,
          }}
        >
          <span>PROGRESS</span>
          <span style={{ color: currentConfig.ringColor }}>
            {totalCount - aliveCount}/{totalCount}
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width:
                totalCount > 0
                  ? `${((totalCount - aliveCount) / totalCount) * 100}%`
                  : "0%",
              background: `linear-gradient(90deg, ${currentConfig.ringColor}, ${currentConfig.ringColor}80)`,
              transition: "width 500ms ease",
              boxShadow: `0 0 6px ${currentConfig.ringColor}`,
            }}
          />
        </div>
      </div>

      {/* LEVEL COMPLETE banner */}
      {isAdvancing && (
        <div
          style={{
            marginTop: 4,
            background: "rgba(0,80,20,0.8)",
            border: "1px solid rgba(0,255,136,0.6)",
            borderRadius: 4,
            padding: "6px 8px",
            textAlign: "center",
            animation: "pulse 0.5s ease-in-out infinite",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: "bold",
              color: "#00ff88",
              letterSpacing: "0.2em",
              textShadow: "0 0 10px rgba(0,255,136,0.9)",
            }}
          >
            LEVEL COMPLETE
          </div>
          <div
            style={{
              fontSize: 8,
              color: "rgba(0,255,136,0.7)",
              marginTop: 2,
              letterSpacing: "0.1em",
            }}
          >
            ADVANCING...
          </div>
        </div>
      )}
    </div>
  );
}
