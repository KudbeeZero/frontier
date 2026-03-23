import { useEffect, useState } from "react";
import { useSwipeControls } from "../../hooks/useSwipeControls";
import { useCameraStore } from "../../stores/cameraStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useLaneStore } from "../../stores/laneStore";
import { useMenuStore } from "../../stores/menuStore";
import { useShipStore } from "../../stores/shipStore";
import { useStoryStore } from "../../stores/storyStore";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { handleFireButton } from "../../systems/combat";
import type { ResourceType } from "../../types/game";
import { RESOURCES } from "../../utils/constants";
import { CockpitView } from "../game/CockpitView";
import { FPSCounter } from "../ui/FPSCounter";
import { AimCone } from "./AimCone";
import { CombatLogWatcher } from "./CombatLog";
import { MechLogPanel } from "./MechLogPanel";
import MiningAlert from "./MiningAlert";
import NotificationSystem from "./NotificationSystem";
import WeaponPanel from "./WeaponPanel";

// ─── TOP NAVIGATION BAR ─────────────────────────────────────────────────────────
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

// ─── UNIFIED TOP-LEFT PANEL ───────────────────────────────────────────────────
function StatBar({
  label,
  value,
  max = 100,
}: { label: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  let barColor = "#00ccff";
  if (label === "HULL")
    barColor = pct > 60 ? "#00ff88" : pct > 30 ? "#ffaa00" : "#ff4444";
  else if (label === "O2")
    barColor = pct > 60 ? "#00e5ff" : pct > 30 ? "#ffaa00" : "#ff4444";
  else if (label === "PWR")
    barColor = pct > 60 ? "#ffe066" : pct > 30 ? "#ffaa00" : "#ff4444";
  else if (label === "FUEL")
    barColor = pct > 50 ? "#00ccff" : pct > 25 ? "#ffaa00" : "#ff4444";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "8px",
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.12em",
          width: "30px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: "3px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "2px",
          overflow: "hidden",
          border: "1px solid rgba(0,200,255,0.5)",
          minWidth: "52px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: "2px",
            transition: "width 500ms ease, background 500ms ease",
            boxShadow: `0 0 6px ${barColor}80`,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "8px",
          color: barColor,
          textShadow: `0 0 5px ${barColor}60`,
          width: "26px",
          flexShrink: 0,
          transition: "color 500ms ease",
        }}
      >
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function UnifiedTopLeftPanel() {
  const { hull, maxHull, oxygen, power, fuel, maxFuel } = useShipStore();
  const { currentLane, changeLane } = useLaneStore();

  return (
    <div
      className="absolute pointer-events-auto"
      style={{ top: "60px", left: "12px", zIndex: 20 }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(0,200,255,0.5)",
          boxShadow:
            "0 0 14px rgba(0,200,255,0.15), inset 0 0 6px rgba(0,200,255,0.04)",
          backdropFilter: "blur(8px)",
          borderRadius: "6px",
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          minWidth: "130px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "6px",
            borderBottom: "1px solid rgba(0,200,255,0.2)",
            gap: "6px",
          }}
        >
          <button
            type="button"
            onClick={() => changeLane("down")}
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "rgba(0,200,255,0.7)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              transition: "color 150ms ease",
            }}
            data-ocid="lane.down"
          >
            ▼
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "8px",
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.15em",
              }}
            >
              LANE
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#00e5ff",
                textShadow:
                  "0 0 10px rgba(0,229,255,0.9), 0 0 20px rgba(0,229,255,0.4)",
                minWidth: "18px",
                textAlign: "center",
              }}
            >
              {currentLane}
            </span>
          </div>
          <button
            type="button"
            onClick={() => changeLane("up")}
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "rgba(0,200,255,0.7)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              transition: "color 150ms ease",
            }}
            data-ocid="lane.up"
          >
            ▲
          </button>
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
        <StatBar label="HULL" value={hull} max={maxHull} />
        <StatBar label="O2" value={oxygen} max={100} />
        <StatBar label="PWR" value={power} max={100} />
        <StatBar label="FUEL" value={fuel} max={maxFuel} />
      </div>
    </div>
  );
}

// ─── LOCKED INDICATOR ─────────────────────────────────────────────────────────
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

// ─── COMBAT RETICLE ───────────────────────────────────────────────────────────
function CombatReticle() {
  const mode = useCameraStore((s) => s.mode);
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);
  const enemies = useEnemyStore((s) => s.enemies);
  const activeWeapon = useWeaponsStore((s) => s.activeWeapon);

  if (mode !== "combat") return null;

  const RANGES: Record<string, number> = { pulse: 60, rail: 200, missile: 120 };
  let color = "rgba(255,255,255,0.5)";
  if (lockedTarget) {
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

// ─── LEAD INDICATOR ───────────────────────────────────────────────────────────
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

// ─── MISSILE LOCK BAR ─────────────────────────────────────────────────────────
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

// ─── FREE ROAM HUD ────────────────────────────────────────────────────────────
function FreeRoamHUD() {
  const mode = useCameraStore((s) => s.mode);
  const fuel = useShipStore((s) => s.fuel);
  const maxFuel = useShipStore((s) => s.maxFuel);
  const maxCargo = useShipStore((s) => s.maxCargo);
  const resources = useInventoryStore((s) => s.resources);
  const totalWeight = useInventoryStore((s) => s.totalWeight);
  if (mode !== "freeRoam") return null;

  const fuelPct = Math.round((fuel / maxFuel) * 100);
  const cargoUsed = Math.round(totalWeight());

  let topResource: { label: string; amount: number } | null = null;
  for (const [key, amt] of Object.entries(resources)) {
    const rKey = key as ResourceType;
    const weight = (RESOURCES[rKey]?.weight ?? 1) * amt;
    if (weight > 0 && (!topResource || weight > topResource.amount)) {
      topResource = { label: RESOURCES[rKey]?.name ?? key, amount: amt };
    }
  }

  const fuelColor =
    fuelPct > 50 ? "#00ff88" : fuelPct > 25 ? "#ffaa00" : "#ff4444";
  const cargoColor =
    cargoUsed / maxCargo < 0.8
      ? "#00ccff"
      : cargoUsed / maxCargo < 0.95
        ? "#ffaa00"
        : "#ff4444";

  return (
    <div
      className="absolute top-16 right-3 pointer-events-none"
      style={{
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(0,255,136,0.5)",
        borderRadius: "6px",
        boxShadow: "0 0 12px rgba(0,255,136,0.12)",
        backdropFilter: "blur(8px)",
        padding: "10px 14px",
        fontFamily: "monospace",
        fontSize: "11px",
        minWidth: "170px",
      }}
    >
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span
            style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em" }}
          >
            FUEL
          </span>
          <span style={{ color: fuelColor }}>{fuelPct}%</span>
        </div>
        <div
          style={{
            height: "3px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "2px",
            overflow: "hidden",
            border: "1px solid rgba(0,200,255,0.5)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${fuelPct}%`,
              background: fuelColor,
              borderRadius: "2px",
              transition: "width 500ms ease",
            }}
          />
        </div>
      </div>
      <div className="mb-2">
        <div className="flex justify-between">
          <span
            style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em" }}
          >
            CARGO
          </span>
          <span style={{ color: cargoColor }}>
            {cargoUsed}/{maxCargo} KG
          </span>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(0,255,136,0.2)",
          paddingTop: "8px",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.15em",
            marginBottom: "3px",
          }}
        >
          SCANNER
        </div>
        <div
          style={{ color: topResource ? "#00ff88" : "rgba(255,255,255,0.25)" }}
        >
          {topResource
            ? `TOP: ${topResource.label} ${topResource.amount}u`
            : "CLEAR"}
        </div>
      </div>
    </div>
  );
}

// ─── BOTTOM TAB BAR ─────────────────────────────────────────────────────────────
const ALL_BOTTOM_TABS = [
  { id: "ship" as const, label: "SHIP" },
  { id: "cargo" as const, label: "CARGO" },
  { id: "nav" as const, label: "NAV" },
  { id: "scan" as const, label: "SCAN" },
  { id: "comm" as const, label: "COMM" },
];

function BottomTabBar() {
  const { activePanel, togglePanel } = useMenuStore();
  const isStoryMode = useStoryStore((s) => s.isStoryMode);
  const enterStoryMode = useStoryStore((s) => s.enterStoryMode);

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 pointer-events-auto"
      style={{ bottom: "72px", zIndex: 30 }}
    >
      <div
        style={{
          display: "flex",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,200,255,0.5)",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 16px rgba(0,200,255,0.1)",
        }}
      >
        {ALL_BOTTOM_TABS.map(({ id, label }, idx) => {
          const isActive = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => togglePanel(id)}
              data-ocid={`tab.${id}`}
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "8px 14px",
                minHeight: "48px",
                background: isActive ? "rgba(0,200,255,0.12)" : "transparent",
                color: isActive ? "#00ccff" : "rgba(255,255,255,0.7)",
                border: "none",
                borderRight:
                  idx < ALL_BOTTOM_TABS.length - 1
                    ? "1px solid rgba(0,200,255,0.2)"
                    : "none",
                cursor: "pointer",
                transition: "color 150ms ease, background 150ms ease",
                textShadow: isActive ? "0 0 8px rgba(0,200,255,0.7)" : "none",
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Separator */}
        <div
          style={{
            width: "1px",
            background: "rgba(0,200,255,0.3)",
            margin: "8px 0",
            flexShrink: 0,
          }}
        />

        {/* STORY MODE button */}
        {!isStoryMode && (
          <button
            type="button"
            onClick={enterStoryMode}
            data-ocid="tab.story_mode"
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "8px 14px",
              minHeight: "48px",
              background: "rgba(0,255,136,0.08)",
              color: "#00ff88",
              border: "none",
              borderLeft: "1px solid rgba(0,200,255,0.2)",
              cursor: "pointer",
              transition: "color 150ms ease, background 150ms ease",
              textShadow: "0 0 8px rgba(0,255,136,0.5)",
            }}
          >
            STORY
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BOTTOM DOCK ──────────────────────────────────────────────────────────────
function BottomDock() {
  const mode = useCameraStore((s) => s.mode);
  const isCombat = mode === "combat";

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          pointerEvents: isCombat ? "auto" : "none",
          opacity: isCombat ? 1 : 0,
          translate: isCombat ? "none" : "0 12px",
          transition: "opacity 300ms ease-out, translate 300ms ease-out",
        }}
      >
        <WeaponPanel />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "72px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          pointerEvents: "auto",
        }}
      >
        <MechLogPanel />
      </div>
    </>
  );
}

// ─── DOCK BUTTON ──────────────────────────────────────────────────────────────
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
        bottom: "130px",
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

// ─── STORY MODE NOTIFICATION ──────────────────────────────────────────────────
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
        top: "70px",
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
      ✦ Fly to the depot and dock to begin
    </div>
  );
}

// ─── HUD ROOT ─────────────────────────────────────────────────────────────────
interface HUDProps {
  targetId?: string | null;
  targetDistance?: number;
}

export default function HUD(_props: HUDProps) {
  useSwipeControls();

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

      {/* Layer 1 — cockpit frame */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <CockpitView />
        <div className="scanlines absolute inset-0 pointer-events-none" />
      </div>

      {/* Layer 2 — HUD panels */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        <UnifiedTopLeftPanel />
        {isCombat && <AimCone />}
        {isCombat && <CombatReticle />}
        {isCombat && <LeadIndicator />}
        {isCombat && <MissileLockBar />}
        <FreeRoamHUD />
        <LockedIndicator />
        <FPSCounter />
        <MiningAlert />
        <NotificationSystem />
      </div>

      {/* Layer 3 — bottom controls */}
      <BottomTabBar />
      <BottomDock />

      {/* Layer 4 — story overlay controls */}
      <DockButton />
      <StoryModeNotification />
    </>
  );
}
