import { useEffect } from "react";
import { useSwipeControls } from "../../hooks/useSwipeControls";
import { useCameraStore } from "../../stores/cameraStore";
import { useMenuStore } from "../../stores/menuStore";
import { useStoryStore } from "../../stores/storyStore";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { handleFireButton } from "../../systems/combat";
import { CockpitView } from "../game/CockpitView";
import { FPSCounter } from "../ui/FPSCounter";
import { AimCone } from "./AimCone";
import { LaneIndicator } from "./LaneIndicator";
import { MechLogPanel } from "./MechLogPanel";
import MiningAlert from "./MiningAlert";
import NotificationSystem from "./NotificationSystem";
import RadarMinimap from "./RadarMinimap";
import StatusPanel from "./StatusPanel";
import { WaveIndicator } from "./WaveIndicator";
import WeaponPanel from "./WeaponPanel";

/** Large, obvious view mode toggle at top-center */
function ViewToggle() {
  const { mode, setMode } = useCameraStore();
  const isOrbital = mode === "orbital";

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 pointer-events-auto"
      style={{ zIndex: 40 }}
    >
      <button
        type="button"
        onClick={() => setMode(isOrbital ? "cockpit" : "orbital")}
        style={{
          background: "rgba(0,0,0,0.82)",
          border: `2px solid ${isOrbital ? "rgba(0,200,255,0.7)" : "rgba(255,160,0,0.7)"}`,
          borderRadius: "12px",
          padding: "8px 22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          boxShadow: isOrbital
            ? "0 0 18px rgba(0,200,255,0.35)"
            : "0 0 18px rgba(255,160,0,0.35)",
          backdropFilter: "blur(6px)",
          minWidth: "140px",
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        data-ocid="hud.view_toggle"
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>
          {isOrbital ? "🌍" : "🎯"}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            color: isOrbital ? "#00ccff" : "#ffaa00",
            textShadow: isOrbital
              ? "0 0 8px rgba(0,200,255,0.8)"
              : "0 0 8px rgba(255,160,0,0.8)",
          }}
        >
          {isOrbital ? "ORBITAL" : "COCKPIT"}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "9px",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          Tap to switch
        </span>
      </button>
    </div>
  );
}

/** SCAN + CMD buttons — ORBITAL only */
function ScanCmdButtons() {
  const { triggerEvent } = useStoryStore();
  const mode = useCameraStore((s) => s.mode);
  if (mode !== "orbital") return null;

  return (
    <div className="absolute top-8 right-52 flex gap-2 pointer-events-auto">
      <button
        type="button"
        onClick={() => triggerEvent("p1_scan_results")}
        className="bg-black/70 border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded transition-all"
        data-ocid="hud.scan_button"
      >
        SCAN
      </button>
      <button
        type="button"
        onClick={() => triggerEvent("p1_systems_damaged")}
        className="bg-black/70 border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded transition-all"
        data-ocid="hud.cmd_button"
      >
        CMD
      </button>
    </div>
  );
}

function LockedIndicator() {
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);
  const mode = useCameraStore((s) => s.mode);
  if (!lockedTarget || mode !== "cockpit") return null;
  return (
    <div
      className="absolute bottom-20 left-1/2 -translate-x-1/2 font-mono text-cyan-400 text-xs tracking-[0.3em] uppercase animate-pulse pointer-events-none"
      style={{ textShadow: "0 0 8px rgba(0,255,255,0.8)" }}
    >
      LOCKED
    </div>
  );
}

// All panels in menu bar; NAV + SCAN only shown in orbital mode
const ALL_NAV_PANELS = [
  { id: "ship" as const, label: "SHIP", orbitOnly: false },
  { id: "cargo" as const, label: "CARGO", orbitOnly: false },
  { id: "nav" as const, label: "NAV", orbitOnly: true },
  { id: "scan" as const, label: "SCAN", orbitOnly: true },
  { id: "comm" as const, label: "COMM", orbitOnly: false },
];

function NavMenuBar() {
  const { activePanel, togglePanel } = useMenuStore();
  const mode = useCameraStore((s) => s.mode);
  const isOrbital = mode === "orbital";

  const visiblePanels = ALL_NAV_PANELS.filter((p) => !p.orbitOnly || isOrbital);

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto"
      style={{ bottom: "72px", zIndex: 30 }}
    >
      <div
        className="flex gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,200,255,0.2)",
        }}
      >
        {visiblePanels.map(({ id, label }) => {
          const isActive = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => togglePanel(id)}
              className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full transition-all ${
                isActive
                  ? "border border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "border border-transparent text-cyan-500/60 hover:text-cyan-400 hover:border-cyan-500/40"
              }`}
              data-ocid={`hud.${id}.tab`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Bottom dock — WeaponPanel + FIRE only visible in COCKPIT mode */
function BottomDock() {
  const mode = useCameraStore((s) => s.mode);
  const isCockpit = mode === "cockpit";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <div
        className="mx-auto flex items-end justify-center gap-3 px-4 pb-2"
        style={{ maxWidth: 700 }}
      >
        {/* Weapon panel — COCKPIT only */}
        {isCockpit && (
          <div className="pointer-events-auto flex-1">
            <WeaponPanel />
          </div>
        )}

        {/* Mech log — always visible */}
        <div className="pointer-events-auto">
          <MechLogPanel />
        </div>
      </div>
    </div>
  );
}

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
  const isOrbital = mode === "orbital";

  return (
    <>
      {/* View mode toggle — always on top */}
      <ViewToggle />

      {/* Layer 1 — cockpit frame (z-10) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <CockpitView />
        <div className="scanlines absolute inset-0 pointer-events-none" />
      </div>

      {/* Layer 2 — HUD panels (z-20) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        {/* Status bars — always visible */}
        <StatusPanel />

        {/* Wave indicator — always visible */}
        <WaveIndicator />

        {/* SCAN/CMD — orbital only */}
        <ScanCmdButtons />

        {/* Lane indicator — orbital only, full panel */}
        {isOrbital && <LaneIndicator />}

        {/* Aim cone — cockpit only */}
        {!isOrbital && <AimCone />}

        {/* Radar — always visible */}
        <RadarMinimap />

        {/* LOCKED — cockpit only */}
        <LockedIndicator />

        {/* FPS */}
        <FPSCounter />

        {/* Alerts */}
        <MiningAlert />
        <NotificationSystem />
      </div>

      {/* Layer 3 — nav menu + dock (z-30) */}
      <NavMenuBar />
      <BottomDock />
    </>
  );
}
