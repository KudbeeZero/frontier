import { useEffect, useRef, useState } from "react";
import { useMenuStore } from "../../stores/menuStore";
import { useShipStore } from "../../stores/shipStore";
import { useStoryStore } from "../../stores/storyStore";
import { CargoPanel } from "./Panels/CargoPanel";
import { CommPanel } from "./Panels/CommPanel";
import { NavPanel } from "./Panels/NavPanel";
import { ScanPanel } from "./Panels/ScanPanel";
import { ShipPanel } from "./Panels/ShipPanel";

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function IconShip({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <polygon points="10,2 16,16 10,13 4,16" fill={color} opacity="0.9" />
      <ellipse cx="10" cy="14" rx="2" ry="1" fill={color} opacity="0.5" />
    </svg>
  );
}
function IconCargo({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="6"
        width="12"
        height="10"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.15"
      />
      <polyline
        points="4,9 10,12 16,9"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      <line x1="10" y1="12" x2="10" y2="16" stroke={color} strokeWidth="1" />
      <polyline
        points="7,6 10,4 13,6"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
function IconNav({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <line
        x1="10"
        y1="3"
        x2="10"
        y2="17"
        stroke={color}
        strokeWidth="0.7"
        strokeDasharray="1 2"
      />
      <line
        x1="3"
        y1="10"
        x2="17"
        y2="10"
        stroke={color}
        strokeWidth="0.7"
        strokeDasharray="1 2"
      />
      <polygon points="10,5 12,13 10,11 8,13" fill={color} />
    </svg>
  );
}
function IconStory({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3"
        width="12"
        height="14"
        rx="1"
        stroke={color}
        strokeWidth="1.2"
        fill={color}
        fillOpacity="0.1"
      />
      <line x1="7" y1="7" x2="13" y2="7" stroke={color} strokeWidth="1" />
      <line x1="7" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1" />
      <line x1="7" y1="13" x2="11" y2="13" stroke={color} strokeWidth="1" />
    </svg>
  );
}
function IconScan({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="10"
        cy="10"
        r="4.5"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <circle
        cx="10"
        cy="10"
        r="2"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      <line x1="10" y1="10" x2="15" y2="6" stroke={color} strokeWidth="1.2" />
      <circle cx="10" cy="10" r="1" fill={color} />
    </svg>
  );
}
function IconComm({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 14 Q5 7 10 7 Q15 7 15 14"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M7 14 Q7 9.5 10 9.5 Q13 9.5 13 14"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <line x1="10" y1="14" x2="10" y2="17" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="17" x2="12" y2="17" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="14" r="1.2" fill={color} />
    </svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ color: string }>> = {
  ship: IconShip,
  cargo: IconCargo,
  nav: IconNav,
  story: IconStory,
  scan: IconScan,
  comm: IconComm,
};

// ─── STORY PANEL (minimal inline version) ─────────────────────────────────────
function StoryPanelInline() {
  const isStoryMode = useStoryStore((s) => s.isStoryMode);
  const enterStoryMode = useStoryStore((s) => s.enterStoryMode);
  return (
    <div style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.85)" }}>
      <div
        style={{
          fontSize: 9,
          color: "rgba(0,200,255,0.55)",
          letterSpacing: "0.2em",
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        A.E.G.I.S. STORY MODE
      </div>
      <div
        style={{
          fontSize: 11,
          marginBottom: 12,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        Sector 7 went dark 72 hours ago. You are one of the last ships
        operational. Navigate to the Space Depot to begin your mission.
      </div>
      {!isStoryMode ? (
        <button
          type="button"
          onClick={enterStoryMode}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 5,
            background: "rgba(0,200,255,0.15)",
            border: "1px solid rgba(0,200,255,0.7)",
            color: "#00e5ff",
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: "bold",
            letterSpacing: "0.25em",
            cursor: "pointer",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(0,200,255,0.8)",
          }}
        >
          ▶ ENTER STORY MODE
        </button>
      ) : (
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "#00ff88",
            letterSpacing: "0.2em",
          }}
        >
          ✓ STORY MODE ACTIVE
        </div>
      )}
    </div>
  );
}

// ─── CENTER PANEL CONTENT ─────────────────────────────────────────────────────
const PANEL_CONTENT: Record<string, { title: string; component: React.FC }> = {
  ship: { title: "SHIP SYSTEMS", component: ShipPanel },
  cargo: { title: "CARGO HOLD", component: CargoPanel },
  nav: { title: "NAVIGATION", component: NavPanel },
  scan: { title: "SCANNER", component: ScanPanel },
  comm: { title: "COMM RELAY", component: CommPanel },
  story: { title: "MISSION BRIEF", component: StoryPanelInline },
};

// ─── ARC CONFIG ───────────────────────────────────────────────────────────────
const ARC_ITEMS = [
  { id: "ship" as const, label: "SHIP" },
  { id: "cargo" as const, label: "CARGO" },
  { id: "nav" as const, label: "NAV" },
  { id: "scan" as const, label: "SCAN" },
  { id: "comm" as const, label: "COMM" },
  { id: "story" as const, label: "STORY" },
];

const N = ARC_ITEMS.length;
const BTN_SIZE = 50;
const ARC_R = 90; // radius of the rotating ring
const WRAP_SIZE = 240; // square that houses the ring
const HALF = WRAP_SIZE / 2;
// rotation speed: 1 full rotation every 25 seconds
const RPM = (2 * Math.PI) / 25;

function btnPos(baseAngle: number, itemIndex: number) {
  // Spread items evenly, offset by baseAngle
  const angle = baseAngle + (itemIndex / N) * 2 * Math.PI;
  return {
    x: HALF + ARC_R * Math.sin(angle) - BTN_SIZE / 2,
    y: HALF - ARC_R * Math.cos(angle) - BTN_SIZE / 2,
    angle,
  };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CircularArcMenu() {
  const { togglePanel } = useMenuStore();
  const isStoryMode = useStoryStore((s) => s.isStoryMode);

  // Rotation angle (radians)
  const angleRef = useRef(0);
  const [angle, setAngle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Animate rotation
  useEffect(() => {
    const tick = (now: number) => {
      if (!paused) {
        const dt =
          lastTimeRef.current != null ? (now - lastTimeRef.current) / 1000 : 0;
        angleRef.current += RPM * dt;
        setAngle(angleRef.current);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused]);

  // Snap selected item to top (angle 0 = top)
  const handleSelect = (id: string) => {
    if (selected === id) {
      setSelected(null);
      setPaused(false);
      return;
    }
    // Find item index and compute angle needed so it sits at top
    const idx = ARC_ITEMS.findIndex((i) => i.id === id);
    const targetAngle = -((idx / N) * 2 * Math.PI);
    // Normalize to nearest
    let delta = targetAngle - angleRef.current;
    delta = delta - Math.round(delta / (2 * Math.PI)) * 2 * Math.PI;
    angleRef.current += delta;
    setAngle(angleRef.current);
    setSelected(id);
    setPaused(true);
    if (id !== "story") togglePanel(id as Parameters<typeof togglePanel>[0]);
  };

  const handleClose = () => {
    setSelected(null);
    setPaused(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!selected) return;
    const close = () => {
      setSelected(null);
      setPaused(false);
    };
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("arc-menu-root");
      if (el && !el.contains(e.target as Node)) close();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", esc);
    };
  }, [selected]);

  const panelInfo = selected ? PANEL_CONTENT[selected] : null;
  const PanelComp = panelInfo?.component ?? null;

  return (
    <div
      id="arc-menu-root"
      style={{
        position: "fixed",
        bottom: 128,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 31,
        width: WRAP_SIZE,
        height: WRAP_SIZE,
        pointerEvents: "none",
      }}
    >
      {/* ─── ROTATING RING ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {/* Faint orbit ring */}
        <svg
          aria-hidden="true"
          width={WRAP_SIZE}
          height={WRAP_SIZE}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <circle
            cx={HALF}
            cy={HALF}
            r={ARC_R}
            stroke="rgba(0,200,255,0.12)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Buttons */}
        {ARC_ITEMS.map((item, idx) => {
          const { x, y } = btnPos(angle, idx);
          const isActive =
            selected === item.id ||
            (item.id === "story" && isStoryMode && !selected);
          const IconComp = ICON_MAP[item.id];
          const iconColor = isActive ? "#00e5ff" : "rgba(0,200,255,0.65)";

          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => {
                if (!selected) setPaused(false);
              }}
              onClick={() => handleSelect(item.id)}
              data-ocid={`arc.${item.id}_button`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: BTN_SIZE,
                height: BTN_SIZE,
                borderRadius: "50%",
                background: isActive
                  ? "rgba(0,200,255,0.20)"
                  : "rgba(0,0,0,0.60)",
                border: isActive
                  ? "2px solid rgba(0,200,255,0.95)"
                  : "1.5px solid rgba(0,200,255,0.38)",
                backdropFilter: "blur(10px)",
                boxShadow: isActive
                  ? "0 0 18px rgba(0,200,255,0.65), 0 0 5px rgba(0,200,255,0.4) inset"
                  : "0 0 6px rgba(0,0,0,0.5)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                transition:
                  "border 150ms ease, background 150ms ease, box-shadow 150ms ease",
                pointerEvents: "auto",
              }}
            >
              {IconComp && <IconComp color={iconColor} />}
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 7,
                  letterSpacing: "0.1em",
                  color: isActive ? "#00ccff" : "rgba(255,255,255,0.7)",
                  textShadow: isActive ? "0 0 6px rgba(0,200,255,0.8)" : "none",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── CENTER CONTENT PANEL ──────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 158,
          maxHeight: 420,
          zIndex: 32,
          pointerEvents: selected ? "auto" : "none",
          opacity: selected ? 1 : 0,
          scale: selected ? "1" : "0.85",
          transition: "opacity 200ms ease-out, scale 200ms ease-out",
        }}
      >
        {selected && panelInfo && PanelComp && (
          <div
            style={{
              background: "rgba(0,4,14,0.92)",
              border: "1.5px solid rgba(0,200,255,0.65)",
              borderRadius: 8,
              backdropFilter: "blur(16px)",
              boxShadow:
                "0 0 30px rgba(0,200,255,0.2), 0 0 60px rgba(0,0,0,0.8)",
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: "1px solid rgba(0,200,255,0.25)",
                background: "rgba(0,200,255,0.07)",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: "0.25em",
                  color: "#00e5ff",
                  textShadow: "0 0 8px rgba(0,200,255,0.7)",
                  textTransform: "uppercase",
                }}
              >
                {panelInfo.title}
              </span>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(0,200,255,0.6)",
                  fontSize: 12,
                  lineHeight: 1,
                  padding: "0 2px",
                  transition: "color 150ms ease",
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div
              style={{
                padding: "12px",
                maxHeight: 340,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <PanelComp />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
