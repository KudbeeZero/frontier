import { WEAPONS } from "../../config/weapons";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { handleFireButton } from "../../systems/combat";
import type { WeaponId } from "../../types/game";

export default function WeaponPanel() {
  const { activeWeapon, cooldowns, ammo, setActiveWeapon } = useWeaponsStore();

  const currentCooldown = cooldowns[activeWeapon] ?? 0;
  const canFire = currentCooldown <= 0 && (ammo[activeWeapon] ?? 1) > 0;

  return (
    <div
      className="bg-black/70 backdrop-blur-md border border-cyan-500/30 rounded-lg px-3 py-2 pointer-events-auto"
      data-ocid="weapons.panel"
    >
      <div className="flex items-center gap-2">
        {/* Weapon selector — horizontal row */}
        {WEAPONS.map((w) => {
          const isActive = w.id === activeWeapon;
          const cd = cooldowns[w.id] ?? 0;
          const a = ammo[w.id];
          const ammoDisplay = typeof a === "number" ? a : "∞";

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveWeapon(w.id as WeaponId)}
              data-ocid={`weapons.${w.id}_button`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded border transition-all text-xs font-mono whitespace-nowrap ${
                isActive
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-cyan-500/40 hover:text-gray-300"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: w.color }}
              />
              <span className="font-bold tracking-wide">{w.label}</span>
              <span className="text-[10px] opacity-70">▸{ammoDisplay}</span>
              {cd > 0 && isActive && (
                <span className="text-[10px] text-amber-400 ml-0.5">CD</span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-cyan-500/20 mx-1" />

        {/* FIRE button */}
        <button
          type="button"
          onClick={handleFireButton}
          disabled={!canFire}
          data-ocid="weapons.fire_button"
          className={`px-5 py-2 rounded border-2 font-bold text-sm tracking-widest transition-all select-none self-stretch ${
            canFire
              ? "border-red-500 bg-red-600/30 text-red-400 hover:bg-red-500/50 hover:text-white active:scale-95 shadow-lg shadow-red-500/30"
              : "border-gray-600 bg-gray-800/40 text-gray-600 cursor-not-allowed"
          }`}
        >
          FIRE
        </button>
      </div>
    </div>
  );
}
