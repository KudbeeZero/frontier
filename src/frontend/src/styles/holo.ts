import type { CSSProperties } from "react";

/** Standardized 30% opacity holographic panel style */
export const holoPanel: CSSProperties = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(0,200,255,0.5)",
  boxShadow:
    "0 0 14px rgba(0,200,255,0.15), inset 0 0 6px rgba(0,200,255,0.04)",
  backdropFilter: "blur(8px)",
  borderRadius: "6px",
};

export const holoText: CSSProperties = {
  fontFamily: "monospace",
  color: "rgba(0,200,255,0.9)",
  textShadow: "0 0 8px rgba(0,200,255,0.5)",
};

/** Panel transition — 300ms ease-out for show/hide */
export const panelTransition =
  "opacity 300ms ease-out, transform 300ms ease-out";

/** Interactive element transition — 150ms */
export const interactiveTransition = "all 150ms ease";
