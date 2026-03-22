export default function ControlsGuide() {
  return (
    <div className="absolute bottom-4 right-4 hud-panel p-3 text-[10px] font-mono text-gray-400 w-36">
      <div className="text-cyan-400 tracking-widest font-bold mb-2">
        CONTROLS
      </div>
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
  );
}
