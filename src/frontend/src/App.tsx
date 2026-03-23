import { useEffect } from "react";
import { MobileControls } from "./components/Controls/MobileControls";
import GameCanvas from "./components/Game/GameCanvas";
import { StoryPanel } from "./components/Story/StoryPanel";
import { VoicePlayer } from "./components/Story/VoicePlayer";
import { PanelRouter } from "./components/UI/PanelRouter";
import { useDeviceStore } from "./stores/deviceStore";
import { useInventoryStore } from "./stores/inventoryStore";
import { useShipStore } from "./stores/shipStore";
import { useStoryStore } from "./stores/storyStore";
import { SAVE_KEY } from "./utils/constants";

export default function App() {
  const { detectDevice } = useDeviceStore();
  const isStoryMode = useStoryStore((s) => s.isStoryMode);

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

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#081626]">
      <GameCanvas />
      <PanelRouter />
      <MobileControls />
      <StoryPanel />
      <VoicePlayer />
    </div>
  );
}
