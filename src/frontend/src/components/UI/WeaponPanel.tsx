import { WEAPONS } from "../../config/weapons";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { handleFireButton } from "../../systems/combat";
import type { WeaponId } from "../../types/game";

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
      data-ocid="weapons.panel"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        pointerEvents: "auto",
      }}
    >
      {/* Weapon selector tabs — horizontal above FIRE */}
      <div
        style={{
          display: "flex",
          gap: 3,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,200,255,0.4)",
          borderRadius: 7,
          padding: "3px 4px",
          boxShadow: "0 0 10px rgba(0,200,255,0.08)",
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
                position: "relative",
                padding: "4px 12px",
                minHeight: 32,
                minWidth: 52,
                borderRadius: 5,
                border: isActive
                  ? "1px solid rgba(0,200,255,0.9)"
                  : "1px solid rgba(0,200,255,0.15)",
                background: isActive
                  ? "rgba(0,200,255,0.15)"
                  : "rgba(255,255,255,0.02)",
                color: isActive ? "#00ccff" : "rgba(255,255,255,0.55)",
                fontFamily: "monospace",
                fontSize: 9,
                fontWeight: "bold",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                transition: "all 150ms ease",
                textShadow: isActive ? "0 0 6px rgba(0,200,255,0.7)" : "none",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: isActive ? w.color : "rgba(255,255,255,0.25)",
                  boxShadow: isActive ? `0 0 4px ${w.color}` : "none",
                  flexShrink: 0,
                }}
              />
              <span>{label}</span>
              {/* Active underline */}
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: 6,
                  right: 6,
                  height: "1.5px",
                  background: "#00ccff",
                  borderRadius: 1,
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
                    top: 2,
                    right: 3,
                    fontSize: 7,
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

      {/* Large FIRE button row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,200,255,0.4)",
          borderRadius: 10,
          padding: "8px 16px",
          boxShadow: "0 0 14px rgba(0,200,255,0.08)",
        }}
      >
        {/* Weapon info left */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: 64,
          }}
        >
          {WEAPONS.filter((w) => w.id === activeWeapon).map((w) => (
            <div key={w.id}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: w.color,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  textShadow: `0 0 6px ${w.color}80`,
                }}
              >
                {w.label}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                  marginTop: 2,
                }}
              >
                AMG: {typeof ammo[w.id] === "number" ? ammo[w.id] : "∞"}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Large FIRE button with gold ring */}
        <button
          type="button"
          onClick={handleFireButton}
          disabled={!canFire}
          data-ocid="weapons.fire_button"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            flexShrink: 0,
            background: canFire
              ? "radial-gradient(circle at 38% 35%, #ff4422, #aa1100)"
              : "radial-gradient(circle at 38% 35%, #5a2020, #2a0a0a)",
            border: "none",
            boxShadow: canFire
              ? "0 0 0 3px #cc2200, 0 0 0 6px #cc8800, 0 0 0 10px rgba(200,120,0,0.35), 0 0 24px rgba(255,60,0,0.5)"
              : "0 0 0 3px #4a1500, 0 0 0 6px #3a2200, 0 0 0 10px rgba(60,30,0,0.2)",
            cursor: canFire ? "pointer" : "not-allowed",
            color: canFire ? "#ffffff" : "rgba(180,100,80,0.5)",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textShadow: canFire ? "0 1px 2px rgba(0,0,0,0.8)" : "none",
            transition: "all 150ms ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glare highlight */}
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 14,
              width: 28,
              height: 14,
              borderRadius: "50%",
              background: canFire
                ? "rgba(255,200,180,0.18)"
                : "rgba(255,200,180,0.05)",
              pointerEvents: "none",
            }}
          />
          FIRE
        </button>

        {/* Lock info right */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: 60,
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 8,
              letterSpacing: "0.15em",
              color: canFire ? "rgba(0,255,136,0.7)" : "rgba(255,60,60,0.6)",
              textShadow: canFire
                ? "0 0 6px rgba(0,255,136,0.4)"
                : "0 0 6px rgba(255,60,60,0.3)",
            }}
          >
            {canFire ? "READY" : "COOLDOWN"}
          </div>
          {currentCooldown > 0 && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#ffaa00",
                textShadow: "0 0 6px rgba(255,170,0,0.6)",
              }}
            >
              {currentCooldown.toFixed(1)}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
