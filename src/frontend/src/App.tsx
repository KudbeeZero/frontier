import { useEffect } from "react";
import { MobileControls } from "./components/Controls/MobileControls";
import GameCanvas from "./components/Game/GameCanvas";
import { WaypointArrow } from "./components/Navigation/WaypointArrow";
import { StoryPanel } from "./components/Story/StoryPanel";
import { VoicePlayer } from "./components/Story/VoicePlayer";
import MainMenu from "./components/UI/MainMenu";
import PauseMenu from "./components/UI/PauseMenu";
import StartScreen from "./components/UI/StartScreen";
import { StoryEventPanel } from "./components/Story/StoryEventPanel";
import { PanelRouter } from "./components/UI/PanelRouter";
import { useDeviceStore } from "./stores/deviceStore";
import { useGameStore } from "./stores/gameStore";
import { useInventoryStore } from "./stores/inventoryStore";
import { useShipStore } from "./stores/shipStore";
import { useStoryStore } from "./stores/storyStore";
import { useDeviceStore } from "./stores/deviceStore";
import { SAVE_KEY } from "./utils/constants";

export default function App() {
  const { detectDevice } = useDeviceStore();
  const isStoryMode = useStoryStore((s) => s.isStoryMode);
  const isTutorialMode = useStoryStore((s) => s.isTutorialMode);
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

  useEffect(() => {
    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, [detectDevice]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const ship = useShipStore.getState();
      const inv = useInventoryStore.getState();
      const saveData = {
        hull: ship.hull,
        fuel: ship.fuel,
        resources: inv.resources,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-trigger tutorial_welcome when tutorial mode starts
  useEffect(() => {
    if (!isTutorialMode || !gameStarted) return;
    const { triggerEvent, completedEvents } = useStoryStore.getState();
    if (!completedEvents.includes("tutorial_welcome")) {
      triggerEvent("tutorial_welcome");
    }
  }, [isTutorialMode, gameStarted]);

  // Auto-trigger "systems_critical" 30 seconds after story mode starts
  useEffect(() => {
    if (!isStoryMode) return;
    const { storyStartTime } = useStoryStore.getState();
    if (!storyStartTime) return;
    const elapsed = Date.now() - storyStartTime;
    const delay = Math.max(0, 30000 - elapsed);
    const timer = setTimeout(() => {
      const state = useStoryStore.getState();
      if (
        state.isStoryMode &&
        !state.completedEvents.includes("systems_critical") &&
        !state.isVisible
      ) {
        state.triggerEvent("systems_critical");
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isStoryMode]);

  if (!gameStarted) {
    return <MainMenu />;
  }

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
      <GameCanvas />
      <PanelRouter />
      <MobileControls />
      <StoryPanel />
      <VoicePlayer />
      {/* Waypoint navigation arrow — story mode only */}
      <WaypointArrow />
      {showPauseMenu && <PauseMenu />}
    </div>
  );
}
