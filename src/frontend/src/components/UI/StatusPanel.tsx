import { useShipStore } from "../../stores/shipStore";

const DOT_LABELS = ["hull", "fuel", "o2", "pwr", "hull2", "sys"] as const;

export default function StatusPanel() {
  const { hull, maxHull, fuel, oxygen, power } = useShipStore();

  const hullPct = (hull / maxHull) * 100;

  // 6 status dots — color driven by system health
  const dots: string[] = [
    hull > 60 ? "#00ffaa" : hull > 30 ? "#ffb700" : "#ff3333",
    fuel > 60 ? "#00ff88" : fuel > 30 ? "#ffb700" : "#ff3333",
    oxygen > 60 ? "#00ff88" : oxygen > 30 ? "#ffb700" : "#ff3333",
    power > 60 ? "#ffb700" : power > 30 ? "#ffb700" : "#ff3333",
    hullPct > 40 ? "#ffb700" : "#ff3333",
    "#ff3333",
  ];

  return (
    <div className="absolute top-6 left-6 font-mono pointer-events-none select-none">
      <div
        className="rounded px-4 py-3 w-52"
        style={{
          background: "rgba(0,0,0,0.82)",
          border: "2px solid rgba(220,40,40,0.7)",
          boxShadow: "0 0 18px rgba(220,40,40,0.18)",
        }}
      >
        <div className="text-red-400 text-[10px] tracking-widest uppercase mb-0.5">
          CEP
        </div>
        <div className="text-red-400 text-4xl font-bold leading-none mb-1">
          L5
        </div>
        <div className="text-red-400/70 text-[10px] tracking-wide uppercase mb-3">
          FULL EXECUTI...
        </div>
        <div className="flex gap-1.5">
          {dots.map((color, i) => (
            <div
              key={DOT_LABELS[i]}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
