import { useEnemyStore } from "../../stores/useEnemyStore";

export function WaveIndicator() {
  const wave = useEnemyStore((s) => s.wave);
  const enemyCount = useEnemyStore((s) => s.enemies.length);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-500/60 rounded-lg px-6 py-2 backdrop-blur pointer-events-none">
      <div className="text-center">
        <div className="text-cyan-500 text-[10px] font-bold tracking-[0.2em] uppercase">
          Wave
        </div>
        <div className="text-white text-2xl font-bold font-mono leading-none">
          {wave}
        </div>
        <div className="text-gray-400 text-[10px] mt-0.5 tracking-wider">
          {enemyCount} HOSTILE{enemyCount !== 1 ? "S" : ""}
        </div>
      </div>
    </div>
  );
}
