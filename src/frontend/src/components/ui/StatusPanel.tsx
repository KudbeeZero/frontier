import { useShipStore } from '../../stores/useShipStore'

export function StatusPanel() {
  const { hull, fuel, oxygen } = useShipStore()

  return (
    <div className="bg-black/60 border-2 border-primary/30 p-4 rounded">
      <div className="text-primary text-xs uppercase tracking-wider mb-2">Status</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-8">
          <span className="text-primary/60">Hull</span>
          <span className={hull < 30 ? 'text-danger' : 'text-white'}>{hull}%</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-primary/60">Fuel</span>
          <span className={fuel < 20 ? 'text-warning' : 'text-white'}>{fuel}%</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-primary/60">O₂</span>
          <span className={oxygen < 25 ? 'text-danger' : 'text-white'}>{oxygen}%</span>
        </div>
      </div>
    </div>
  )
}
