import { useEffect } from "react";
import GameCanvas from "./components/Game/GameCanvas";
import PauseMenu from "./components/UI/PauseMenu";
import StartScreen from "./components/UI/StartScreen";
import { StoryEventPanel } from "./components/Story/StoryEventPanel";
import { useGameStore } from "./stores/gameStore";
import { useInventoryStore } from "./stores/inventoryStore";
import { useShipStore } from "./stores/shipStore";
import { useStoryStore } from "./stores/storyStore";
import { useDeviceStore } from "./stores/deviceStore";
import { SAVE_KEY } from "./utils/constants";

export default function App() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const showPauseMenu = useGameStore((s) => s.showPauseMenu);
  const triggerEvent = useStoryStore((s) => s.triggerEvent);
  const detectDevice = useDeviceStore((s) => s.detectDevice);

  // Device detection
  useEffect(() => {
    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, [detectDevice]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      const ship = useShipStore.getState();
      const inv = useInventoryStore.getState();
      const saveData = {
        hull: ship.hull,
        fuel: ship.fuel,
        credits: useGameStore.getState().credits,
        resources: inv.resources,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }, 30000);
    return () => clearInterval(interval);
  }, [gameStarted]);

  // Trigger first story event 3 seconds after game starts
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setTimeout(() => {
      triggerEvent("p1_systems_damaged");
    }, 3000);
    return () => clearTimeout(timer);
  }, [gameStarted, triggerEvent]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#081626]">
      {!gameStarted && <StartScreen />}
      {gameStarted && (
        <>
          <GameCanvas />
          {showPauseMenu && <PauseMenu />}
        </>
      )}
      <StoryEventPanel />
    </div>
  );
}
