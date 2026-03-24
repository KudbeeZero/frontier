import { useState } from "react";
import { WEAPONS } from "../../config/weapons";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import type { WeaponId } from "../../types/game";

const WEAPON_DESCRIPTIONS: Record<string, string> = {
  pulse: "Rapid energy bolts. High fire rate, moderate damage.",
  rail: "Electromagnetic slug. Instant hit, massive damage.",
  missile: "Heat-seeking warhead. Lock-on required.",
};

const RARITY: Record<
  string,
  { label: string; color: string; borderColor: string }
> = {
  pulse: { label: "COMMON", color: "#2ecc71", borderColor: "#2ecc71" },
  rail: { label: "RARE", color: "#3498db", borderColor: "#3498db" },
  missile: { label: "LEGENDARY", color: "#9b59b6", borderColor: "#9b59b6" },
};

const WEAPON_ICONS: Record<string, string> = {
  pulse: "🔫",
  rail: "⚡",
  missile: "🚀",
};

export function WeaponStashCards() {
  const { activeWeapon, setActiveWeapon, ammo } = useWeaponsStore();
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-ocid="stash.open_modal_button"
        style={{
          position: "fixed",
          top: 88,
          left: 0,
          zIndex: 25,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(0,200,255,0.4)",
          borderLeft: "none",
          borderRadius: "0 6px 6px 0",
          color: "rgba(0,200,255,0.8)",
          fontFamily: "monospace",
          fontSize: 9,
          letterSpacing: "0.15em",
          padding: "10px 8px",
          cursor: "pointer",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          textTransform: "uppercase",
          pointerEvents: "auto",
        }}
      >
        WEAPONS
      </button>
    );
  }

  return (
    <div
      data-ocid="stash.panel"
      style={{
        position: "fixed",
        top: 88,
        left: 0,
        zIndex: 25,
        width: 200,
        // stop well above the bottom nav + joystick area
        maxHeight: "calc(100vh - 240px)",
        background: "rgba(0,0,0,0.75)",
        border: "1px solid rgba(0,200,255,0.35)",
        borderLeft: "none",
        borderRadius: "0 8px 8px 0",
        backdropFilter: "blur(12px)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.6), 0 0 16px rgba(0,200,255,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "auto",
        animation: "panelSlideIn 300ms ease-out",
      }}
    >
      {/* Ship icon header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 0 4px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(0,200,255,0.1)",
            border: "1px solid rgba(0,200,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            boxShadow: "0 0 10px rgba(0,200,255,0.2)",
          }}
        >
          🚀
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 12px 8px",
          borderBottom: "1px solid rgba(0,200,255,0.2)",
          background: "rgba(0,200,255,0.06)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            fontWeight: "bold",
            letterSpacing: "0.25em",
            color: "#00e5ff",
            textShadow: "0 0 6px rgba(0,229,255,0.6)",
            textTransform: "uppercase",
          }}
        >
          ⚔ WEAPON STASH
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          data-ocid="stash.close_button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(0,200,255,0.6)",
            fontSize: 14,
            lineHeight: 1,
            padding: "0 2px",
            transition: "color 150ms",
          }}
        >
          ✕
        </button>
      </div>

      {/* Cards list */}
      <div style={{ overflowY: "auto", padding: "8px 0", flex: 1 }}>
        {WEAPONS.map((w) => {
          const isEquipped = activeWeapon === w.id;
          const currentAmmo = ammo[w.id];
          const ammoDisplay =
            typeof currentAmmo === "number" && Number.isFinite(currentAmmo)
              ? currentAmmo
              : "∞";
          const rarity = RARITY[w.id] ?? {
            label: "COMMON",
            color: "#2ecc71",
            borderColor: "#2ecc71",
          };
          const icon = WEAPON_ICONS[w.id] ?? "🔫";

          return (
            <div
              key={w.id}
              style={{
                margin: "0 8px 6px",
                borderRadius: 6,
                background: isEquipped
                  ? "rgba(0,200,255,0.08)"
                  : "rgba(0,0,0,0.4)",
                border: `1px solid ${
                  isEquipped ? "rgba(0,255,136,0.7)" : "rgba(255,255,255,0.08)"
                }`,
                borderLeft: `4px solid ${
                  isEquipped ? "#00ff88" : rarity.borderColor
                }`,
                boxShadow: isEquipped
                  ? "0 0 12px rgba(0,255,136,0.2), -2px 0 8px rgba(0,255,136,0.3)"
                  : `0 0 0 0 transparent, -1px 0 4px ${rarity.color}20`,
                overflow: "hidden",
                transition: "all 150ms ease",
              }}
            >
              {/* Card top: icon + name + rarity */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px 6px",
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
                  {icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      fontWeight: "bold",
                      color: isEquipped ? "#00ff88" : "rgba(255,255,255,0.9)",
                      textShadow: isEquipped
                        ? "0 0 6px rgba(0,255,136,0.7)"
                        : "none",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {w.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 7,
                      color: rarity.color,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginTop: 1,
                      textShadow: `0 0 4px ${rarity.color}60`,
                    }}
                  >
                    {rarity.label}
                  </div>
                </div>
                {isEquipped && (
                  <div
                    style={{
                      fontSize: 7,
                      fontFamily: "monospace",
                      color: "#00ff88",
                      textShadow: "0 0 4px rgba(0,255,136,0.7)",
                      letterSpacing: "0.1em",
                      flexShrink: 0,
                    }}
                  >
                    ✓ ACTIVE
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 4, padding: "0 12px 6px" }}>
                <StatChip label="DMG" value={w.damage} color="#ff8844" />
                <StatChip
                  label="RATE"
                  value={w.fireRate.toFixed(1)}
                  color="#ffe066"
                />
                <StatChip label="AMG" value={ammoDisplay} color="#00ccff" />
              </div>

              {/* Description */}
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.5,
                  padding: "0 12px 8px",
                }}
              >
                {WEAPON_DESCRIPTIONS[w.id]}
              </div>

              {/* EQUIP button */}
              <div style={{ padding: "0 12px 10px" }}>
                <button
                  type="button"
                  disabled={isEquipped}
                  onClick={() => setActiveWeapon(w.id as WeaponId)}
                  data-ocid={`stash.equip_${w.id}`}
                  style={{
                    width: "100%",
                    padding: "6px 0",
                    borderRadius: 4,
                    border: isEquipped
                      ? "1px solid rgba(0,255,136,0.4)"
                      : `1px solid ${rarity.color}80`,
                    background: isEquipped
                      ? "rgba(0,255,136,0.08)"
                      : `${rarity.color}18`,
                    color: isEquipped ? "rgba(0,255,136,0.7)" : rarity.color,
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: "bold",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: isEquipped ? "default" : "pointer",
                    transition: "all 150ms ease",
                    textShadow: isEquipped
                      ? "none"
                      : `0 0 5px ${rarity.color}60`,
                  }}
                >
                  {isEquipped ? "EQUIPPED" : "EQUIP"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: { label: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        flex: 1,
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 3,
        padding: "4px 0",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 6,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: "bold",
          color,
          textShadow: `0 0 4px ${color}60`,
        }}
      >
        {value}
      </span>
    </div>
  );
}
