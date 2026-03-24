import { WEAPONS, type WeaponId } from "../../config/weapons";
import { useTargetingStore } from "../../stores/useTargetingStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";

export function WeaponConsole() {
  const { weapons, selectedWeaponId, selectWeapon, fire } = useWeaponsStore();
  const { isLocked } = useTargetingStore();

  const selectedWeapon = weapons.find((w) => w.id === selectedWeaponId);
  const selectedConfig = WEAPONS[selectedWeaponId];
  const requiresLock =
    "requiresLock" in selectedConfig && selectedConfig.requiresLock;
  const canFire =
    selectedWeapon?.status === "READY" && (!requiresLock || isLocked);

  return (
    <div className="bg-black/60 border-2 border-primary/30 rounded-lg p-3 pointer-events-auto">
      {/* Weapon selection buttons */}
      <div className="flex gap-2 mb-3">
        {weapons.map((weapon) => {
          const config = WEAPONS[weapon.id as WeaponId];
          const isSelected = weapon.id === selectedWeaponId;

          return (
            <button
              key={weapon.id}
              type="button"
              onClick={() => selectWeapon(weapon.id as WeaponId)}
              className={`
                relative px-4 py-2 rounded border-2 transition-all min-w-[80px]
                ${
                  isSelected
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-primary/30 bg-black/40 text-primary/60 hover:border-primary/50"
                }
              `}
              style={{
                boxShadow: isSelected ? `0 0 10px ${config.glowColor}` : "none",
              }}
            >
              <div className="text-sm font-bold">{config.shortName}</div>

              <div className="text-xs mt-1">
                {weapon.status === "RELOADING" && (
                  <span className="text-warning">RELOAD</span>
                )}
                {weapon.status === "COOLDOWN" && (
                  <span className="text-warning">COOL</span>
                )}
                {weapon.status === "READY" && (
                  <span className="text-success">RDY</span>
                )}
              </div>

              {weapon.maxAmmo != null && (
                <div className="text-xs mt-1">
                  {weapon.ammo}/{weapon.maxAmmo}
                </div>
              )}

              {weapon.status !== "READY" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-b">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        (weapon.status === "RELOADING"
                          ? (weapon.reloadProgress ?? 0)
                          : 1 - weapon.cooldownProgress) * 100
                      }%`,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* FIRE button */}
      <button
        type="button"
        onClick={fire}
        disabled={!canFire}
        className={`
          w-full py-4 rounded-lg text-xl font-bold border-2 transition-all
          ${
            canFire
              ? "bg-danger border-danger text-white hover:bg-danger/80 active:scale-95"
              : "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
          }
        `}
        style={{
          minHeight: "60px",
          boxShadow: canFire ? "0 0 20px rgba(255, 68, 68, 0.5)" : "none",
        }}
      >
        {canFire
          ? "FIRE"
          : selectedWeapon?.status === "READY"
            ? "NO LOCK"
            : selectedWeapon?.status?.toUpperCase()}
      </button>

      {/* Selected weapon info */}
      {selectedWeapon && (
        <div className="mt-2 text-xs text-primary/60 text-center">
          {selectedConfig.description}
          {requiresLock && !isLocked && (
            <span className="text-warning ml-2">⚠ REQUIRES LOCK</span>
          )}
        </div>
      )}
    </div>
  );
}
