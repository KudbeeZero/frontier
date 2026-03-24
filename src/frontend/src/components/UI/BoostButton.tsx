import { useCallback, useEffect, useRef, useState } from "react";

type BoostPhase = "ready" | "active" | "cooling";

const BOOST_DURATION_MS = 1500;
const COOLDOWN_DURATION_MS = 4000;
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BoostButton() {
  const [phase, setPhase] = useState<BoostPhase>("ready");
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const svgRef = useRef<SVGCircleElement | null>(null);

  // Animate cooldown ring via rAF (no re-renders)
  const animateCooldown = useCallback(() => {
    const elapsed = performance.now() - cooldownStartRef.current;
    const progress = Math.min(elapsed / COOLDOWN_DURATION_MS, 1);
    // Ring drains: at progress=0, full ring (offset=0); at progress=1, empty (offset=CIRCUMFERENCE)
    const offset = progress * CIRCUMFERENCE;
    if (svgRef.current) {
      svgRef.current.style.strokeDashoffset = String(offset);
    }
    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animateCooldown);
    }
  }, []);

  const activate = useCallback(() => {
    if (phase !== "ready") return;

    setPhase("active");

    // Dispatch Space keydown to ShipController
    window.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }),
    );

    activeTimerRef.current = setTimeout(() => {
      // Release Space
      window.dispatchEvent(
        new KeyboardEvent("keyup", { code: "Space", key: " ", bubbles: true }),
      );

      // Start cooldown
      setPhase("cooling");
      cooldownStartRef.current = performance.now();
      if (svgRef.current) {
        svgRef.current.style.strokeDashoffset = "0";
      }
      rafRef.current = requestAnimationFrame(animateCooldown);

      cooldownTimerRef.current = setTimeout(() => {
        setPhase("ready");
        if (svgRef.current) {
          svgRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
        }
      }, COOLDOWN_DURATION_MS);
    }, BOOST_DURATION_MS);
  }, [phase, animateCooldown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isReady = phase === "ready";
  const isActive = phase === "active";

  const borderColor = isReady
    ? "rgba(0,200,255,0.8)"
    : isActive
      ? "rgba(255,180,0,0.9)"
      : "rgba(80,80,80,0.5)";

  const bgColor = isReady
    ? "rgba(0,200,255,0.12)"
    : isActive
      ? "rgba(255,180,0,0.18)"
      : "rgba(30,30,30,0.4)";

  const labelColor = isReady
    ? "#00ccff"
    : isActive
      ? "#ffb400"
      : "rgba(100,100,100,0.6)";

  const glowColor = isReady
    ? "rgba(0,200,255,0.4)"
    : isActive
      ? "rgba(255,180,0,0.4)"
      : "transparent";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        onClick={activate}
        disabled={!isReady}
        data-ocid="boost.button"
        style={{
          position: "relative",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          cursor: isReady ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
          boxShadow: `0 0 12px ${glowColor}`,
          transition:
            "background 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
          padding: 0,
        }}
      >
        {/* SVG cooldown ring — rendered on top of button content */}
        <svg
          aria-hidden="true"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(-90deg)",
            pointerEvents: "none",
            opacity: phase === "cooling" ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          {/* Background track */}
          <circle
            cx="24"
            cy="24"
            r={RADIUS}
            fill="none"
            stroke="rgba(80,80,80,0.3)"
            strokeWidth="2.5"
          />
          {/* Animated drain ring */}
          <circle
            ref={svgRef}
            cx="24"
            cy="24"
            r={RADIUS}
            fill="none"
            stroke="rgba(0,200,255,0.6)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            style={{ transition: "none" }}
          />
        </svg>

        {/* Icon */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "18px",
            lineHeight: 1,
            position: "relative",
            zIndex: 1,
            filter: isActive ? "brightness(1.5)" : "none",
          }}
        >
          {isActive ? "⚡" : "🚀"}
        </span>
      </button>

      <span
        style={{
          fontFamily: "monospace",
          fontSize: "8px",
          fontWeight: "bold",
          letterSpacing: "0.15em",
          color: labelColor,
          textShadow: isReady ? `0 0 5px ${labelColor}` : "none",
          transition: "color 200ms ease",
        }}
      >
        {phase === "cooling" ? "COOL" : "BOOST"}
      </span>
    </div>
  );
}
