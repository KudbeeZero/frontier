import { useEnemyStore } from '../../stores/useEnemyStore'
import { useShipStore } from '../../stores/useShipStore'

export function RadarPanel() {
  const enemies = useEnemyStore((s) => s.enemies)
  const { theta, phi } = useShipStore()

  return (
    <div className="bg-black/60 border-2 border-primary/30 p-4 rounded">
      <div className="text-primary text-xs uppercase tracking-wider mb-2">Radar</div>
      <div className="w-24 h-24 border border-primary/50 rounded-full relative overflow-hidden">
        {/* Sweep line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 rounded-full" />

        {/* Player dot */}
        <div className="absolute inset-1/2 w-2 h-2 -ml-1 -mt-1 bg-primary rounded-full z-10" />

        {/* Enemy dots */}
        {enemies.map((enemy) => {
          const relTheta = enemy.theta - theta
          const relPhi = enemy.phi - phi
          const x = 50 + Math.cos(relPhi) * Math.sin(relTheta) * 40
          const y = 50 - Math.sin(relPhi) * 40
          return (
            <div
              key={enemy.id}
              className="absolute w-1.5 h-1.5 bg-danger rounded-full -ml-0.75 -mt-0.75"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}
