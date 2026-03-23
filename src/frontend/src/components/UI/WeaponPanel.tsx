import { WEAPONS } from "../../config/weapons";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { handleFireButton } from "../../systems/combat";
import type { WeaponId } from "../../types/game";

// Short display labels for nav-tab style — no ammo clutter on the face
const SHORT_LABEL: Record<string, string> = {
  pulse: "PULSE",
  rail: "RAIL",
  missile: "MISS",
};

export default function WeaponPanel() {
  const { activeWeapon, cooldowns, ammo, setActiveWeapon } = useWeaponsStore();

  const currentCooldown = cooldowns[activeWeapon] ?? 0;
  const currentAmmo = ammo[activeWeapon];
  const canFire =
    currentCooldown <= 0 &&
    (typeof currentAmmo === "number" ? currentAmmo > 0 : true);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,200,255,0.5)",
        borderRadius: "8px",
        padding: "4px 6px",
        boxShadow: "0 0 12px rgba(0,200,255,0.1)",
        // Constrained to not bleed into joystick zones
        maxWidth: "280px",
        width: "100%",
      }}
      data-ocid="weapons.panel"
    >
      {/* Weapon tab selector — nav-bar style */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "2px",
          maxWidth: "180px",
        }}
      >
        {WEAPONS.map((w) => {
          const isActive = w.id === activeWeapon;
          const cd = cooldowns[w.id] ?? 0;
          const label = SHORT_LABEL[w.id] ?? w.id.toUpperCase().slice(0, 4);

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveWeapon(w.id as WeaponId)}
              data-ocid={`weapons.${w.id}_button`}
              style={{
                flex: 1,
                position: "relative",
                padding: "4px 6px",
                minHeight: "36px",
                minWidth: 0,
                borderRadius: "5px",
                border: isActive
                  ? "1px solid rgba(0,200,255,0.9)"
                  : "1px solid rgba(0,200,255,0.2)",
                background: isActive
                  ? "rgba(0,200,255,0.15)"
                  : "rgba(255,255,255,0.03)",
                color: isActive ? "#00ccff" : "rgba(255,255,255,0.6)",
                fontFamily: "monospace",
                fontSize: "9px",
                fontWeight: "bold",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                transition: "all 150ms ease",
                textShadow: isActive ? "0 0 6px rgba(0,200,255,0.7)" : "none",
                overflow: "hidden",
              }}
            >
              {/* dot indicator */}
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: isActive ? w.color : "rgba(255,255,255,0.3)",
                  boxShadow: isActive ? `0 0 4px ${w.color}` : "none",
                }}
              />
              <span>{label}</span>
              {/* animated underline — matches top nav style */}
              <span
                style={{
                  position: "absolute",
                  bottom: "3px",
                  left: "6px",
                  right: "6px",
                  height: "1.5px",
                  background: "#00ccff",
                  borderRadius: "1px",
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  transition: "transform 150ms ease",
                  transformOrigin: "center",
                  boxShadow: isActive ? "0 0 4px rgba(0,200,255,0.9)" : "none",
                }}
              />
              {cd > 0 && isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "3px",
                    fontSize: "7px",
                    color: "#ffaa00",
                    lineHeight: 1,
                  }}
                >
                  CD
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "28px",
          background: "rgba(0,200,255,0.25)",
          flexShrink: 0,
        }}
      />

      {/* FIRE button */}
      <button
        type="button"
        onClick={handleFireButton}
        disabled={!canFire}
        data-ocid="weapons.fire_button"
        style={{
          padding: "4px 14px",
          minHeight: "36px",
          flexShrink: 0,
          borderRadius: "5px",
          border: canFire
            ? "1px solid rgba(255,60,60,0.9)"
            : "1px solid rgba(100,100,100,0.4)",
          background: canFire ? "rgba(255,50,50,0.2)" : "rgba(100,100,100,0.1)",
          color: canFire ? "#ff6666" : "rgba(100,100,100,0.5)",
          fontFamily: "monospace",
          fontSize: "11px",
          fontWeight: "bold",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: canFire ? "pointer" : "not-allowed",
          transition: "all 150ms ease",
          textShadow: canFire ? "0 0 8px rgba(255,80,80,0.8)" : "none",
          boxShadow: canFire ? "0 0 10px rgba(255,60,60,0.25)" : "none",
        }}
      >
        FIRE
      </button>
    </div>
  );
}
