import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

const PANEL_STYLE: React.CSSProperties = {
  position: "fixed",
  top: "52px",
  right: "8px",
  zIndex: 55,
  background: "rgba(4,13,26,0.96)",
  border: "1px solid rgba(0,200,255,0.6)",
  borderRadius: "8px",
  backdropFilter: "blur(12px)",
  boxShadow:
    "0 0 24px rgba(0,200,255,0.15), inset 0 0 8px rgba(0,200,255,0.04)",
  padding: "12px 16px",
  minWidth: "220px",
  fontFamily: "monospace",
};

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid rgba(0,200,255,0.1)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: "9px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em",
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
      {/* Toggle switch */}
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          background: value ? "rgba(0,200,255,0.25)" : "rgba(255,255,255,0.08)",
          border: value
            ? "1px solid rgba(0,200,255,0.8)"
            : "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
          transition: "background 150ms, border-color 150ms",
          boxShadow: value ? "0 0 8px rgba(0,200,255,0.4)" : "none",
        }}
        aria-pressed={value}
        aria-label={label}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? "calc(100% - 16px - 2px)" : "2px",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: value ? "#00ccff" : "rgba(255,255,255,0.4)",
            boxShadow: value ? "0 0 6px rgba(0,200,255,0.8)" : "none",
            transition: "left 150ms ease, background 150ms ease",
          }}
        />
      </button>
    </div>
  );
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const navAidEnabled = useSettingsStore((s) => s.navAidEnabled);
  const setNavAidEnabled = useSettingsStore((s) => s.setNavAidEnabled);
  const showFPS = useSettingsStore((s) => s.showFPS);
  const setShowFPS = useSettingsStore((s) => s.setShowFPS);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);

  return (
    <>
      {/* Gear icon button — top right corner, same row as nav bar */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-ocid="settings.toggle"
        style={{
          position: "fixed",
          top: 0,
          right: "8px",
          zIndex: 42,
          width: 44,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: open ? "rgba(0,200,255,0.12)" : "transparent",
          border: "none",
          borderBottom: open ? "2px solid #00ccff" : "2px solid transparent",
          cursor: "pointer",
          fontSize: "16px",
          transition: "background 150ms, border-color 150ms",
          color: open ? "#00ccff" : "rgba(255,255,255,0.6)",
          textShadow: open ? "0 0 8px rgba(0,200,255,0.8)" : "none",
          pointerEvents: "auto",
        }}
        aria-label="Settings"
        title="Settings"
      >
        {/* SVG gear icon for crispness */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Settings gear icon"
          style={{ display: "block" }}
        >
          <title>Settings</title>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div ref={panelRef} style={PANEL_STYLE}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid rgba(0,200,255,0.3)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "0.2em",
                color: "#00ccff",
                textShadow: "0 0 6px rgba(0,200,255,0.6)",
                textTransform: "uppercase",
              }}
            >
              ⚙ SETTINGS
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: "14px",
                lineHeight: 1,
                padding: 0,
              }}
              aria-label="Close settings"
            >
              ✕
            </button>
          </div>

          {/* Toggles */}
          <Toggle
            label="Navigation Aid"
            description="Show directional arrow to current objective"
            value={navAidEnabled}
            onChange={setNavAidEnabled}
          />
          <Toggle
            label="FPS Counter"
            description="Display frame-rate overlay"
            value={showFPS}
            onChange={setShowFPS}
          />
          <Toggle
            label="Haptic Feedback"
            description="Vibration on mobile devices"
            value={hapticsEnabled}
            onChange={setHapticsEnabled}
          />

          {/* Version hint */}
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              fontSize: "8px",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
              textAlign: "right",
            }}
          >
            FRONTIER v1.0 {/* SECTOR-7 */}
          </div>
        </div>
      )}
    </>
  );
}
