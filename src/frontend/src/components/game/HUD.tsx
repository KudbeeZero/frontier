import { StatusPanel } from '../ui/StatusPanel'
import { RadarPanel } from '../ui/RadarPanel'
import { WeaponConsole } from '../ui/WeaponConsole'
import { TargetingReticle } from './TargetingReticle'

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left: ship status */}
      <div className="p-4">
        <StatusPanel />
      </div>

      {/* Top-right: radar */}
      <div className="absolute top-4 right-4">
        <RadarPanel />
      </div>

      {/* Center: targeting reticle */}
      <TargetingReticle />

      {/* Bottom-center: weapon console */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <WeaponConsole />
      </div>
    </div>
  )
}
