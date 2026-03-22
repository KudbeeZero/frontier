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
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        style={{ zIndex: 48 }}
        onClick={closePanel}
        onKeyDown={(e) => e.key === "Escape" && closePanel()}
        role="button"
        tabIndex={-1}
        aria-label="Close panel"
      />

      {/* Panel */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[480px] max-h-[80vh] flex flex-col rounded-lg overflow-hidden"
        style={{
          zIndex: 50,
          background: "rgba(0,0,0,0.75)",
          border: "2px solid rgba(0,200,255,0.55)",
          boxShadow:
            "0 0 30px rgba(0,200,255,0.15), inset 0 0 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{
            borderBottom: "1px solid rgba(0,200,255,0.25)",
            background: "rgba(0,200,255,0.06)",
          }}
        >
          <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs font-mono">
            {title}
          </span>
          <button
            type="button"
            onClick={closePanel}
            className="text-cyan-500 hover:text-white text-lg leading-none transition-colors"
            data-ocid="overlay.close_button"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </>
  );
}
