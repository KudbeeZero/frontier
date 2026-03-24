import { WEAPONS } from "../../config/weapons";
import { useCameraStore } from "../../stores/cameraStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { handleFireButton } from "../../systems/combat";
import type { WeaponId } from "../../types/game";

function WeaponTab({
  weaponId,
  side,
}: { weaponId: string; side: "left" | "right" }) {
  const { activeWeapon, setActiveWeapon, cooldowns, ammo } = useWeaponsStore();
  const weapon = WEAPONS.find((w) => w.id === weaponId);
  if (!weapon) return null;

  const isActive = activeWeapon === weaponId;
  const cd = cooldowns[weaponId] ?? 0;
  const currentAmmo = ammo[weaponId];
  const hasAmmo = typeof currentAmmo !== "number" || currentAmmo > 0;
  const ready = cd <= 0 && hasAmmo;

  const LABELS: Record<string, string> = {
    pulse: "PULSE CANNON",
    rail: "RAIL GUN",
    missile: "MISSILE",
  };
  const label = LABELS[weaponId] ?? weapon.label.toUpperCase();

  return (
    <button
      type="button"
      onClick={() => setActiveWeapon(weaponId as WeaponId)}
      data-ocid={`weapons.${weaponId}_tab`}
      style={{
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        minWidth: 130,
        minHeight: 48,
        background: isActive ? "rgba(0,200,255,0.12)" : "rgba(0,0,0,0.6)",
        border: `1px solid ${isActive ? "rgba(0,200,255,0.8)" : "rgba(0,200,255,0.25)"}`,
        borderRadius: side === "left" ? "8px 0 0 8px" : "0 8px 8px 0",
        cursor: "pointer",
        backdropFilter: "blur(10px)",
        transition: "all 150ms ease",
        boxShadow: isActive ? "0 0 16px rgba(0,200,255,0.2)" : "none",
      }}
    >
      {/* Color dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isActive ? weapon.color : "rgba(255,255,255,0.2)",
          boxShadow: isActive ? `0 0 6px ${weapon.color}` : "none",
          flexShrink: 0,
          transition: "all 150ms ease",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: side === "left" ? "flex-start" : "flex-end",
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            fontWeight: "bold",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isActive ? "#00ccff" : "rgba(255,255,255,0.7)",
            textShadow: isActive ? "0 0 8px rgba(0,200,255,0.7)" : "none",
            transition: "all 150ms ease",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 7,
            letterSpacing: "0.12em",
            color: ready ? "#00ff88" : "#ff6644",
            textShadow: ready
              ? "0 0 5px rgba(0,255,136,0.6)"
              : "0 0 5px rgba(255,100,60,0.6)",
          }}
        >
          {cd > 0 ? `CD ${cd.toFixed(1)}s` : ready ? "■ READY" : "NO AMMO"}
        </span>
      </div>
    </button>
  );
}

export function BottomWeaponBar() {
  const mode = useCameraStore((s) => s.mode);
  const isCombat = mode === "combat";
  const { activeWeapon, cooldowns, ammo } = useWeaponsStore();

  const cd = cooldowns[activeWeapon] ?? 0;
  const currentAmmo = ammo[activeWeapon];
  const canFire =
    cd <= 0 && (typeof currentAmmo !== "number" || currentAmmo > 0);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 60, // above BottomNavStrip
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        pointerEvents: isCombat ? "auto" : "none",
        opacity: isCombat ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      {/* Weapon tabs + FIRE button row */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {/* Left weapon tab */}
        <WeaponTab weaponId="pulse" side="left" />

        {/* Center: large FIRE button with gold ring */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "0 12px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(0,200,255,0.25)",
            borderBottom: "1px solid rgba(0,200,255,0.25)",
          }}
        >
          <button
            type="button"
            onClick={handleFireButton}
            disabled={!canFire}
            data-ocid="weapons.fire_button"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: canFire
                ? "radial-gradient(circle at 38% 35%, #ff5533, #aa1100)"
                : "radial-gradient(circle at 38% 35%, #5a2020, #2a0a0a)",
              border: "none",
              boxShadow: canFire
                ? "0 0 0 3px #cc2200, 0 0 0 7px #cc8800, 0 0 0 11px rgba(200,120,0,0.35), 0 0 30px rgba(255,60,0,0.5), 0 0 60px rgba(200,50,0,0.2)"
                : "0 0 0 3px #4a1500, 0 0 0 7px #3a2200, 0 0 0 11px rgba(60,30,0,0.2)",
              cursor: canFire ? "pointer" : "not-allowed",
              color: canFire ? "#ffffff" : "rgba(180,100,80,0.5)",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: "bold",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textShadow: canFire ? "0 1px 3px rgba(0,0,0,0.9)" : "none",
              transition: "all 150ms ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glare */}
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 14,
                width: 28,
                height: 14,
                borderRadius: "50%",
                background: canFire
                  ? "rgba(255,220,200,0.18)"
                  : "rgba(255,200,180,0.05)",
                pointerEvents: "none",
              }}
            />
            FIRE
          </button>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.25em",
              color: "rgba(0,200,255,0.6)",
              textTransform: "uppercase",
              textShadow: "0 0 4px rgba(0,200,255,0.3)",
            }}
          >
            FIRE CONTROL
          </span>
        </div>

        {/* Right weapon tab */}
        <WeaponTab weaponId="rail" side="right" />
      </div>
    </div>
  );
}
