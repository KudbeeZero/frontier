import { useEffect, useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useShipStore } from "../../stores/shipStore";
import type { ResourceType } from "../../types/game";
import { SAVE_KEY } from "../../utils/constants";

interface SaveData {
  hull: number;
  fuel: number;
  credits: number;
  resources: Record<ResourceType, number>;
}

export default function StartScreen() {
  const { setGameStarted, addCredits } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    setHasSave(!!saved);
    const interval = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(interval);
  }, []);

  const startNew = () => {
    useShipStore.getState().reset();
    useInventoryStore.getState().reset();
    setGameStarted(true);
  };

  const loadGame = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) {
        startNew();
        return;
      }
      const data: SaveData = JSON.parse(saved);
      const ship = useShipStore.getState();
      if (data.hull < ship.maxHull) ship.takeDamage(ship.maxHull - data.hull);
      if (data.fuel < ship.maxFuel) ship.consumeFuel(ship.maxFuel - data.fuel);
      addCredits(data.credits);
      const inv = useInventoryStore.getState();
      for (const [type, amount] of Object.entries(data.resources) as [
        ResourceType,
        number,
      ][]) {
        if (amount > 0) inv.addResource(type, amount);
      }
      setGameStarted(true);
    } catch {
      startNew();
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #0d1f35 0%, #081626 60%, #020a14 100%)",
      }}
    >
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static decoration
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${(i * 13.7) % 100}%`,
              top: `${(i * 7.3) % 100}%`,
              opacity: (i % 5) * 0.2 + 0.1,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i % 30) * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-cyan-500/50" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-cyan-500/50" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-cyan-500/50" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-cyan-500/50" />

      <div className="relative z-10 text-center px-8">
        <div className="text-cyan-500/60 text-sm tracking-[0.4em] font-mono mb-3 uppercase">
          Deep Space Exploration
        </div>
        <h1
          className="text-5xl md:text-7xl font-bold tracking-[0.15em] font-mono mb-2 uppercase"
          style={{
            color: "#00E6FF",
            textShadow: "0 0 20px #00E6FF, 0 0 60px rgba(0,230,255,0.4)",
          }}
        >
          FRONTIER
        </h1>
        <h2
          className="text-xl md:text-2xl tracking-[0.3em] font-mono mb-8 uppercase"
          style={{
            color: "#D7E2EA",
            textShadow: "0 0 10px rgba(215,226,234,0.3)",
          }}
        >
          Lost in Space
        </h2>
        <p className="text-gray-400 text-sm font-mono mb-12 tracking-wider">
          Navigate. Mine. Craft. Survive.
        </p>

        <div className="flex flex-col gap-3 items-center mb-8">
          {hasSave && (
            <button
              type="button"
              onClick={loadGame}
              className="px-10 py-3 text-sm font-mono tracking-widest uppercase rounded border transition-all hover:scale-105 pointer-events-auto"
              style={{
                backgroundColor: "rgba(0,255,136,0.1)",
                borderColor: "#00FF88",
                color: "#00FF88",
                textShadow: "0 0 10px #00FF88",
                boxShadow: "0 0 20px rgba(0,255,136,0.2)",
              }}
            >
              Continue Mission
            </button>
          )}
          <button
            type="button"
            onClick={startNew}
            className="px-10 py-3 text-sm font-mono tracking-widest uppercase rounded border transition-all hover:scale-105 pointer-events-auto"
            style={{
              backgroundColor: "rgba(0,230,255,0.1)",
              borderColor: "#00E6FF",
              color: "#00E6FF",
              textShadow: "0 0 10px #00E6FF",
              boxShadow: "0 0 20px rgba(0,230,255,0.2)",
            }}
          >
            New Mission
          </button>
        </div>

        <div
          className="border border-white/10 rounded px-6 py-3 text-[10px] font-mono text-gray-500 grid grid-cols-5 gap-4"
          style={{ background: "rgba(10,20,35,0.6)" }}
        >
          {[
            ["WASD", "Move"],
            ["MOUSE", "Aim"],
            ["SPACE", "Boost"],
            ["CLICK", "Mine"],
            ["I/C", "Panels"],
          ].map(([key, action]) => (
            <div key={key} className="text-center">
              <div className="text-cyan-500">{key}</div>
              <div>{action}</div>
            </div>
          ))}
        </div>

        {blink && (
          <p className="text-gray-500 text-xs font-mono mt-6 tracking-widest">
            CLICK TO LOCK CONTROLS
          </p>
        )}
      </div>
    </div>
  );
}
