import { useGameStore } from "../../stores/gameStore";
import { useShipStore } from "../../stores/shipStore";
import CargoPanel from "./CargoPanel";
import ControlsGuide from "./ControlsGuide";
import Crosshair from "./Crosshair";
import MiningAlert from "./MiningAlert";
import NotificationSystem from "./NotificationSystem";
import RadarMinimap from "./RadarMinimap";
import StatusPanel from "./StatusPanel";

interface HUDProps {
  targetId: string | null;
  targetDistance: number;
}

export default function HUD({ targetId, targetDistance }: HUDProps) {
  const showHUD = useGameStore((s) => s.showHUD);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Scanlines overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none" />

      {showHUD && (
        <>
          <StatusPanel />
          <RadarMinimap />
          <CargoPanel />
          <MiningAlert />
        </>
      )}

      {/* Always visible */}
      <Crosshair targetId={targetId} targetDistance={targetDistance} />
      <NotificationSystem />
      <ControlsGuide />
    </div>
  );
}
