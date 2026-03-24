import { useState } from "react";

export default function ControlsGuide() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20 p-3 text-[10px] font-mono text-gray-400 w-36 animate-slide-in-right"
      style={{ animationDelay: "0.2s", animationFillMode: "both" }}
    >
      <button
        type="button"
        className="w-full text-left text-cyan-400 tracking-widest font-bold mb-2 cursor-pointer select-none hover:text-cyan-300 transition-colors flex items-center bg-transparent border-0 p-0"
        onClick={() => setCollapsed((c) => !c)}
      >
        CONTROLS
        <span className="ml-1 text-[8px]">{collapsed ? "▶" : "▼"}</span>
      </button>
      <div className={collapsed ? "hidden" : ""}>
        <div className="space-y-0.5">
          {[
            ["WASD", "Move"],
            ["MOUSE", "Aim"],
            ["SPACE", "Boost"],
            ["SHIFT", "Brake"],
            ["Q/E", "Roll"],
            ["CLICK", "Mine"],
            ["I", "Inventory"],
            ["C", "Crafting"],
            ["TAB", "HUD"],
            ["ESC", "Pause"],
          ].map(([key, action]) => (
            <div key={key} className="flex justify-between">
              <span className="text-cyan-500">{key}</span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
