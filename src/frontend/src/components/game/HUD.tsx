import { RadarPanel } from "../hud/RadarPanel";
import { StatusPanel } from "../hud/StatusPanel";
import { WeaponConsole } from "../hud/WeaponConsole";
import { FPSCounter } from "../ui/FPSCounter";
import { MobileJoystick } from "../ui/MobileJoystick";
import { ScorePanel } from "../ui/ScorePanel";

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left: Status */}
      <div className="absolute top-4 left-4">
        <StatusPanel />
      </div>

      {/* Top-right: Radar + Score */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 items-end">
        <ScorePanel />
        <RadarPanel />
      </div>

      {/* Bottom-center: Weapons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <WeaponConsole />
      </div>

      {/* Mobile joystick */}
      <MobileJoystick />

      {/* FPS counter */}
      <FPSCounter />
    </div>
  );
}
