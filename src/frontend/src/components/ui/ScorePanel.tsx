import { useEnemyStore } from "../../stores/useEnemyStore";

export function ScorePanel() {
  const score = useEnemyStore((s) => s.score);
  const enemiesDestroyed = useEnemyStore((s) => s.enemiesDestroyed);

  return (
    <div className="hud-panel px-3 py-2 pointer-events-none text-right">
      <div className="text-cyan-400/60 text-xs uppercase tracking-widest">
        Score
      </div>
      <div
        className="text-2xl font-bold text-cyan-400 text-glow-cyan"
        style={{ fontFamily: "Orbitron, monospace" }}
      >
        {score.toString().padStart(6, "0")}
      </div>
      <div className="text-xs text-cyan-400/50 mt-0.5">
        {enemiesDestroyed} destroyed
      </div>
    </div>
  );
}
