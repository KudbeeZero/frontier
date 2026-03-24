import { ENEMY_TYPES } from "../../config/enemies";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { useShipStore } from "../../stores/useShipStore";

export function RadarPanel() {
  const enemies = useEnemyStore((s) => s.enemies);
  const { theta, phi } = useShipStore();
  const activeContacts = enemies.filter((e) => e.status === "active");

  const playerLng = (theta * 180) / Math.PI;
  const playerLat = (phi * 180) / Math.PI;

  const sweepAngle = (Date.now() / 30) % 360;

  return (
    <div className="hud-panel p-3 pointer-events-none">
      <div className="text-cyan-400 text-xs uppercase tracking-widest mb-2 text-glow-cyan">
        Radar
      </div>

      <div className="relative w-28 h-28">
        {/* Radar circles */}
        <div className="absolute inset-0 border border-cyan-400/20 rounded-full" />
        <div className="absolute inset-[25%] border border-cyan-400/15 rounded-full" />

        {/* Sweep line */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-t from-cyan-400/60 to-transparent"
          style={{
            height: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${sweepAngle}deg)`,
          }}
        />

        {/* Enemy dots */}
        {activeContacts.map((enemy) => {
          const config = ENEMY_TYPES[enemy.type];
          const dLng = enemy.position.lng - playerLng;
          const dLat = enemy.position.lat - playerLat;
          // Scale to radar: ±90 maps to ±50% of radius
          const x = 50 + (dLng / 90) * 40;
          const y = 50 + (dLat / 90) * 40;
          if (x < 5 || x > 95 || y < 5 || y > 95) return null;
          return (
            <div
              key={enemy.id}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: config.color,
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 4px ${config.color}`,
              }}
            />
          );
        })}

        {/* Player dot */}
        <div
          className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-cyan-400 rounded-full"
          style={{ boxShadow: "0 0 6px #00e6ff" }}
        />
      </div>

      <div className="text-xs text-cyan-400/50 mt-2 text-center">
        {activeContacts.length} CONTACT{activeContacts.length !== 1 ? "S" : ""}
      </div>
    </div>
  );
}
