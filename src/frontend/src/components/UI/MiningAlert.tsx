import { useShipStore } from "../../stores/shipStore";

export default function MiningAlert() {
  const { isMining, miningTarget, miningProgress } = useShipStore();

  if (!isMining) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hud-panel px-5 py-3 text-xs font-mono text-center min-w-48">
      <div className="text-cyan-400 text-[10px] tracking-[0.2em] font-bold mb-1 text-glow-cyan animate-pulse">
        MINING INITIATED
      </div>
      <div className="text-gray-400 mb-2">Target: {miningTarget}</div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${Math.round(miningProgress * 100)}%`,
            backgroundColor: "#FFB700",
          }}
        />
      </div>
      <div className="text-amber-400 mt-1">
        {Math.round(miningProgress * 100)}%
      </div>
    </div>
  );
}
