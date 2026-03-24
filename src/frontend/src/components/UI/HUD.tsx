import { useEffect } from "react";
import { useState } from "react";
import { useSwipeControls } from "../../hooks/useSwipeControls";
import { useCameraStore } from "../../stores/cameraStore";
import { useGroundTargetStore } from "../../stores/groundTargetStore";
import { useLaneStore } from "../../stores/laneStore";
import { useMenuStore } from "../../stores/menuStore";
import { useOrbitalLevelStore } from "../../stores/orbitalLevelStore";
import { useShipStore } from "../../stores/shipStore";
import { useStoryStore } from "../../stores/storyStore";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { handleFireButton } from "../../systems/combat";
import { GroundTargetLockHUD } from "../Combat/GroundTargetLockHUD";
import { GroundTargetRadar } from "../Combat/GroundTargetRadar";
import { FPSCounter } from "../ui/FPSCounter";
import { AimCone } from "./AimCone";
import { BottomNavStrip } from "./BottomNavStrip";
import { CircularArcMenu } from "./CircularArcMenu";
import { BottomWeaponBar } from "./BottomWeaponBar";
import { CombatLogWatcher } from "./CombatLog";
import { MechLogPanel } from "./MechLogPanel";
import MiningAlert from "./MiningAlert";
import NotificationSystem from "./NotificationSystem";
import { OrbitalLevelHUD } from "./OrbitalLevelHUD";
import { QuickInventoryGrid } from "./QuickInventoryGrid";
import { SettingsPanel } from "./SettingsPanel";
import { WeaponStashCards } from "./WeaponStashCards";

// ─── TOP NAVIGATION BAR ──────────────────────────────────────────────────────────────────────────
const CAMERA_MODES = [
  { id: "freeRoam" as const, label: "FREE ROAM" },
  { id: "orbital" as const, label: "ORBITAL" },
  { id: "combat" as const, label: "COMBAT" },
] as const;

const MENU_TABS = [
  { id: "nav" as const, label: "NAV" },
  { id: "scan" as const, label: "SCAN" },
  { id: "comm" as const, label: "COMM" },
] as const;

function TopNavBar() {
  const { mode, setMode } = useCameraStore();
  const { activePanel, togglePanel } = useMenuStore();

  const btnBase: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0 14px",
    minHeight: "48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    position: "relative",
    transition: "color 150ms ease, text-shadow 150ms ease",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(0,200,255,0.5)",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 20px rgba(0,200,255,0.1)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {CAMERA_MODES.map(({ id, label }) => {
          const isActive = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              data-ocid={`nav.${id}`}
              style={{
                ...btnBase,
                color: isActive ? "#00ccff" : "rgba(255,255,255,0.7)",
                textShadow: isActive ? "0 0 10px rgba(0,200,255,0.8)" : "none",
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "14px",
                  right: "14px",
                  height: "2px",
                  background: "#00ccff",
                  borderRadius: "1px",
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  transition: "transform 150ms ease",
                  transformOrigin: "center",
                  boxShadow: isActive ? "0 0 6px rgba(0,200,255,0.9)" : "none",
                }}
              />
            </button>
          );
        })}

        <div
          style={{
            width: "1px",
            background: "rgba(0,200,255,0.3)",
            margin: "10px 2px",
            flexShrink: 0,
          }}
        />

        {MENU_TABS.map(({ id, label }) => {
          const isOpen = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => togglePanel(id)}
              data-ocid={`nav.${id}`}
              style={{
                ...btnBase,
                color: isOpen ? "#00ccff" : "rgba(255,255,255,0.7)",
                textShadow: isOpen ? "0 0 10px rgba(0,200,255,0.8)" : "none",
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "14px",
                  right: "14px",
                  height: "2px",
                  background: "#00ccff",
                  borderRadius: "1px",
                  transform: isOpen ? "scaleX(1)" : "scaleX(0)",
                  transition: "transform 150ms ease",
                  transformOrigin: "center",
                  boxShadow: isOpen ? "0 0 6px rgba(0,200,255,0.9)" : "none",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TOP STATUS BAR ───────────────────────────────────────────────────────────
function TopStatusBar() {
  const { hull, maxHull, oxygen } = useShipStore();
  const { currentLane, changeLane } = useLaneStore();
  const mode = useCameraStore((s) => s.mode);
  const aliveTargets = useGroundTargetStore(
    (s) => s.targets.filter((t) => t.status !== "destroyed").length,
  );
  const totalTargets = useGroundTargetStore((s) => s.targets.length);
  const currentLevel = useOrbitalLevelStore((s) => s.currentLevel);

  const hullPct = Math.max(0, Math.min(100, (hull / maxHull) * 100));
  const o2Pct = Math.max(0, Math.min(100, oxygen));

  const hullColor =
    hullPct > 60 ? "#00ff88" : hullPct > 30 ? "#ffaa00" : "#ff4444";
  const o2Color = o2Pct > 60 ? "#00e5ff" : o2Pct > 30 ? "#ffaa00" : "#ff4444";

  return (
    <div
      style={{
        position: "fixed",
        top: 48,
        left: 0,
        right: 0,
        height: 36,
        zIndex: 21,
        background: "rgba(0,0,0,0.5)",
        borderBottom: "1px solid rgba(0,200,255,0.2)",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        pointerEvents: "auto",
      }}
    >
      {/* Left: OXYGEN */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.15em",
            flexShrink: 0,
          }}
        >
          OXYGEN
        </span>
        <div
          style={{
            width: 80,
            height: 8,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${o2Color}40`,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${o2Pct}%`,
              background: o2Color,
              transition: "width 500ms ease",
              boxShadow: `0 0 6px ${o2Color}80`,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: o2Color,
            fontWeight: "bold",
            minWidth: 28,
          }}
        >
          {Math.round(o2Pct)}%
        </span>
      </div>

      {/* Center: HULL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.15em",
            flexShrink: 0,
          }}
        >
          HULL
        </span>
        <div
          style={{
            width: 80,
            height: 8,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${hullColor}40`,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${hullPct}%`,
              background: hullColor,
              transition: "width 500ms ease",
              boxShadow: `0 0 6px ${hullColor}80`,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: hullColor,
            fontWeight: "bold",
            minWidth: 28,
          }}
        >
          {Math.round(hullPct)}%
        </span>
      </div>

      {/* Right: Target counter (combat) or SECTOR label + lane controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {mode === "combat" && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: aliveTargets === 0 ? "#00ff88" : "#ffaa00",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              textShadow:
                aliveTargets === 0 ? "0 0 8px rgba(0,255,136,0.7)" : "none",
            }}
          >
            LVL{currentLevel} — {aliveTargets}/{totalTargets}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={() => changeLane("down")}
            data-ocid="lane.down"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(0,200,255,0.7)",
              fontFamily: "monospace",
              fontSize: 10,
              padding: "0 2px",
            }}
          >
            ▼
          </button>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 8,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.1em",
            }}
          >
            LN{currentLane}
          </span>
          <button
            type="button"
            onClick={() => changeLane("up")}
            data-ocid="lane.up"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(0,200,255,0.7)",
              fontFamily: "monospace",
              fontSize: 10,
              padding: "0 2px",
            }}
          >
            ▲
          </button>
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: "bold",
            color: "#00e5ff",
            letterSpacing: "0.2em",
            textShadow: "0 0 10px rgba(0,229,255,0.7)",
          }}
        >
          SECTOR 7
        </span>
      </div>
    </div>
  );
}

// ─── LOCKED INDICATOR (space enemies) ─────────────────────────────────────────
function LockedIndicator() {
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);
  const enemies = useEnemyStore((s) => s.enemies);
  const mode = useCameraStore((s) => s.mode);
  if (!lockedTarget || mode !== "combat") return null;

  const enemy = enemies.find((e) => e.id === lockedTarget);
  if (!enemy) return null;

  const dist = (enemy as { distance?: number }).distance ?? 80;
  const hpPct = enemy.hp / enemy.maxHp;
  const threat = hpPct > 0.7 ? "LOW" : hpPct > 0.3 ? "MED" : "HIGH";
  const threatColor =
    threat === "LOW" ? "#00ff88" : threat === "MED" ? "#ffaa00" : "#ff4444";

  return (
    <div
      className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none text-center"
      style={{ fontFamily: "monospace" }}
    >
      <div
        className="text-cyan-400 text-xs tracking-[0.3em] uppercase animate-pulse"
        style={{ textShadow: "0 0 8px rgba(0,255,255,0.8)" }}
      >
        LOCKED
      </div>
      <div className="text-white text-[10px] tracking-widest mt-0.5">
        DIST: {Math.round(dist)}u
      </div>
      <div
        className="text-[10px] tracking-widest mt-0.5"
        style={{ color: threatColor }}
      >
        THREAT: {threat}
      </div>
    </div>
  );
}

// ─── COMBAT RETICLE ─────────────────────────────────────────────────────────────────────────
function CombatReticle() {
  const mode = useCameraStore((s) => s.mode);
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);
  const lockedGround = useGroundTargetStore((s) => s.lockedGroundTarget);
  const enemies = useEnemyStore((s) => s.enemies);
  const activeWeapon = useWeaponsStore((s) => s.activeWeapon);

  if (mode !== "combat") return null;

  const RANGES: Record<string, number> = { pulse: 60, rail: 200, missile: 120 };
  let color = "rgba(255,255,255,0.5)";
  if (lockedGround) {
    color = "#00ffff";
  } else if (lockedTarget) {
    const enemy = enemies.find((e) => e.id === lockedTarget);
    if (enemy) {
      const dist = (enemy as { distance?: number }).distance ?? 80;
      color = dist <= (RANGES[activeWeapon] ?? 80) ? "#00ff88" : "#ff4444";
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div style={{ position: "relative", width: 40, height: 40 }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1,
            background: color,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: color,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 4,
            height: 4,
            background: color,
            borderRadius: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <div
            key={c}
            style={{
              position: "absolute",
              ...(c.includes("t") ? { top: 0 } : { bottom: 0 }),
              ...(c.includes("l") ? { left: 0 } : { right: 0 }),
              width: 8,
              height: 8,
              borderTop: c.includes("t") ? `1px solid ${color}` : undefined,
              borderBottom: c.includes("b") ? `1px solid ${color}` : undefined,
              borderLeft: c.includes("l") ? `1px solid ${color}` : undefined,
              borderRight: c.includes("r") ? `1px solid ${color}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── LEAD INDICATOR ───────────────────────────────────────────────────────────────────────
function LeadIndicator() {
  const mode = useCameraStore((s) => s.mode);
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);
  if (mode !== "combat" || !lockedTarget) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: -25,
            left: 15,
            width: 8,
            height: 8,
            border: "1px solid rgba(255,200,0,0.7)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}

// ─── MISSILE LOCK BAR ────────────────────────────────────────────────────────────────────
function MissileLockBar() {
  const mode = useCameraStore((s) => s.mode);
  const activeWeapon = useWeaponsStore((s) => s.activeWeapon);
  const missileLocking = useWeaponsStore((s) => s.missileLocking);
  const missileLockTimer = useWeaponsStore((s) => s.missileLockTimer);
  if (mode !== "combat" || activeWeapon !== "missile" || !missileLocking)
    return null;
  const pct = Math.min((missileLockTimer / 1.5) * 100, 100);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        bottom: "60%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 80,
        marginTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          color: "#ff9900",
          textAlign: "center",
          letterSpacing: "0.15em",
          marginBottom: 3,
        }}
      >
        LOCKING...
      </div>
      <div
        style={{
          height: 3,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(255,153,0,0.4)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#ff9900",
            transition: "width 0.05s linear",
          }}
        />
      </div>
    </div>
  );
}

// ─── DOCK BUTTON ────────────────────────────────────────────────────────────────────────────────────
function DockButton() {
  const nearDepot = useStoryStore((s) => s.nearDepot);
  const isStoryMode = useStoryStore((s) => s.isStoryMode);
  const isVisible = useStoryStore((s) => s.isVisible);
  const triggerEvent = useStoryStore((s) => s.triggerEvent);
  if (!nearDepot || !isStoryMode || isVisible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "200px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 45,
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        onClick={() => triggerEvent("depot_arrival")}
        data-ocid="story.dock_button"
        style={{
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "bold",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          padding: "14px 32px",
          minHeight: "60px",
          background: "rgba(0,255,255,0.12)",
          color: "#00ffff",
          border: "2px solid #00ffff",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow:
            "0 0 20px rgba(0,255,255,0.3), inset 0 0 10px rgba(0,255,255,0.05)",
          textShadow: "0 0 10px rgba(0,255,255,0.8)",
          transition: "background 150ms ease, box-shadow 150ms ease",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        ⬡ DOCK
      </button>
    </div>
  );
}

// ─── STORY MODE NOTIFICATION ────────────────────────────────────────────────────────────────────
function StoryModeNotification() {
  const isStoryMode = useStoryStore((s) => s.isStoryMode);
  const [show, setShow] = useState(false);
  const [prevMode, setPrevMode] = useState(false);

  useEffect(() => {
    if (isStoryMode && !prevMode) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(timer);
    }
    setPrevMode(isStoryMode);
  }, [isStoryMode, prevMode]);

  if (!show) return null;
  return (
    <div
      data-ocid="story.toast"
      style={{
        position: "fixed",
        top: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        background: "rgba(0,20,30,0.92)",
        border: "1px solid rgba(0,255,255,0.6)",
        borderRadius: "6px",
        padding: "10px 20px",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#00e5ff",
        textShadow: "0 0 8px rgba(0,229,255,0.6)",
        letterSpacing: "0.12em",
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 16px rgba(0,255,255,0.2)",
        animation: "fadeIn 300ms ease-out",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      ❖ Fly to the depot and dock to begin
    </div>
  );
}

// ─── HUD ROOT ───────────────────────────────────────────────────────────────────────────────────────
interface HUDProps {
  targetId?: string | null;
  targetDistance?: number;
}

export default function HUD(_props: HUDProps) {
  useSwipeControls();
  const showCircularMenu = useMenuStore((s) => s.showCircularMenu);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F" || e.code === "Space") {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        )
          return;
        e.preventDefault();
        handleFireButton();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const mode = useCameraStore((s) => s.mode);
  const isCombat = mode === "combat";

  return (
    <>
      <CombatLogWatcher />
      <TopNavBar />
      <SettingsPanel />
      <TopStatusBar />

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        {isCombat && <AimCone />}
        {isCombat && <CombatReticle />}
        {isCombat && <LeadIndicator />}
        {isCombat && <MissileLockBar />}
        {isCombat && <GroundTargetLockHUD />}
        <LockedIndicator />
        <FPSCounter />
        <MiningAlert />
        <NotificationSystem />
        <QuickInventoryGrid />
      </div>

      {isCombat && <GroundTargetRadar />}

      {/* Orbital Level HUD — visible in combat mode */}
      {isCombat && <OrbitalLevelHUD />}

      <WeaponStashCards />
      <MechLogPanel />
      <BottomWeaponBar />
      <BottomNavStrip />
      {showCircularMenu && <CircularArcMenu />}
      <DockButton />
      <StoryModeNotification />
    </>
  );
}
