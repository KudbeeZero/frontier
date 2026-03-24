import { useEffect } from "react";
import { useMenuStore } from "../../stores/menuStore";

interface OverlayPanelProps {
  title: string;
  children: React.ReactNode;
}

export function OverlayPanel({ title, children }: OverlayPanelProps) {
  const { closePanel } = useMenuStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closePanel]);

  return (
    <>
      {/* Backdrop — 300ms ease-out */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
          zIndex: 48,
          // Panel show: 300ms ease-out
          animation: "backdropIn 300ms ease-out",
        }}
        onClick={closePanel}
        onKeyDown={(e) => e.key === "Escape" && closePanel()}
        role="button"
        tabIndex={-1}
        aria-label="Close panel"
      />

      {/* Panel — 300ms ease-out slide-in */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          maxWidth: "480px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          overflow: "hidden",
          zIndex: 50,
          // Standardized 30% opacity
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,200,255,0.5)",
          boxShadow: "0 0 40px rgba(0,200,255,0.12)",
          // Panel show: 300ms ease-out
          animation: "panelIn 300ms ease-out",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            flexShrink: 0,
            borderBottom: "1px solid rgba(0,200,255,0.25)",
            background: "rgba(0,200,255,0.06)",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              fontWeight: "bold",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              // Primary cyan for interactive labels
              color: "#00ccff",
              textShadow: "0 0 8px rgba(0,200,255,0.5)",
            }}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={closePanel}
            style={{
              color: "rgba(255,255,255,0.7)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              padding: "4px",
              // 150ms interactive
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.7)";
            }}
            data-ocid="overlay.close_button"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
