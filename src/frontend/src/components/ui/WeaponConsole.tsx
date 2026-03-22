import { useWeaponsStore } from '../../stores/useWeaponsStore'
import { WEAPONS } from '../../config/weapons'

export function WeaponConsole() {
  const { activeWeapon, setActiveWeapon, cooldowns } = useWeaponsStore()

  return (
    <div className="bg-black/60 border-2 border-primary/30 p-4 rounded pointer-events-auto">
      <div className="text-primary text-xs uppercase tracking-wider mb-2 text-center">Weapons</div>
      <div className="flex gap-2">
        {WEAPONS.map((weapon) => {
          const isActive = activeWeapon === weapon.id
          const onCooldown = (cooldowns[weapon.id] ?? 0) > 0

          return (
            <button
              key={weapon.id}
              onClick={() => setActiveWeapon(weapon.id)}
              disabled={onCooldown}
              className={`px-4 py-2 border rounded transition text-sm ${
                isActive
                  ? 'bg-primary/30 border-primary text-primary'
                  : 'bg-primary/10 hover:bg-primary/20 border-primary/50 text-primary/70'
              } ${onCooldown ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {weapon.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
