import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useShipStore } from "../../stores/shipStore";
import { SAVE_KEY } from "../../utils/constants";

export default function PauseMenu() {
  const { togglePauseMenu, setGameStarted, addNotification } = useGameStore();

  const saveGame = () => {
    const ship = useShipStore.getState();
    const inv = useInventoryStore.getState();
    const saveData = {
      hull: ship.hull,
      fuel: ship.fuel,
      credits: useGameStore.getState().credits,
      resources: inv.resources,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    addNotification("Game saved!", "success");
    togglePauseMenu();
  };

  const quit = () => {
    setGameStarted(false);
    togglePauseMenu();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="hud-panel p-8 text-center min-w-64">
        <div className="text-cyan-400 tracking-[0.2em] font-bold font-mono text-lg mb-6">
          PAUSED
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={togglePauseMenu}
            className="w-full py-2 text-sm font-mono rounded border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors pointer-events-auto"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={saveGame}
            className="w-full py-2 text-sm font-mono rounded border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-colors pointer-events-auto"
          >
            Save Game
          </button>
          <button
            type="button"
            onClick={quit}
            className="w-full py-2 text-sm font-mono rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors pointer-events-auto"
          >
            Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
