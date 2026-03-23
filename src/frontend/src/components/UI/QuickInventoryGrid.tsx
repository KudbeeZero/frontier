import { useInventoryStore } from "../../stores/inventoryStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import type { ResourceType, WeaponId } from "../../types/game";
import { RESOURCES } from "../../utils/constants";

// IMG_7487-style slot colors: purple, blue, orange, green, blue, red
const SLOT_COLORS = [
  { border: "#9b59b6", bg: "rgba(155,89,182,0.12)", label: "SPEC" },
  { border: "#3498db", bg: "rgba(52,152,219,0.12)", label: "RARE" },
  { border: "#e67e22", bg: "rgba(230,126,34,0.12)", label: "ENRG" },
  { border: "#2ecc71", bg: "rgba(46,204,113,0.12)", label: "RES" },
  { border: "#3498db", bg: "rgba(52,152,219,0.12)", label: "AMMO" },
  { border: "#e74c3c", bg: "rgba(231,76,60,0.12)", label: "WEAP" },
];

const AMMO_ITEMS: { id: WeaponId; label: string; icon: string }[] = [
  { id: "pulse", label: "PULSE", icon: "🔫" },
  { id: "rail", label: "RAIL", icon: "⚡" },
  { id: "missile", label: "MISS", icon: "🚀" },
];

export function QuickInventoryGrid() {
  const resources = useInventoryStore((s) => s.resources);
  const removeResource = useInventoryStore((s) => s.removeResource);
  const { ammo, activeWeapon, setActiveWeapon } = useWeaponsStore();

  const topResources = (Object.entries(resources) as [ResourceType, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div
      data-ocid="inventory.panel"
      style={{
        position: "fixed",
        // sit below the top status bar, leave room at bottom for joystick
        top: 92,
        right: 8,
        zIndex: 25,
        pointerEvents: "auto",
        width: 162,
        // cap height so it never reaches the joystick area
        maxHeight: "calc(100vh - 260px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 7,
          letterSpacing: "0.3em",
          color: "#00e5ff",
          textTransform: "uppercase",
          marginBottom: 5,
          textAlign: "right",
          textShadow: "0 0 6px rgba(0,229,255,0.5)",
          flexShrink: 0,
        }}
      >
        QUICK INVENTORY
      </div>

      {/* 3×2 grid — both rows always fully visible */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
          marginBottom: 5,
          flexShrink: 0,
        }}
      >
        {/* Row 1: Ammo slots */}
        {AMMO_ITEMS.map((item, idx) => {
          const isActive = activeWeapon === item.id;
          const currentAmmo = ammo[item.id];
          const ammoDisplay =
            typeof currentAmmo === "number" && Number.isFinite(currentAmmo)
              ? currentAmmo
              : "∞";
          const col = SLOT_COLORS[idx];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveWeapon(item.id)}
              title={`Switch to ${item.label}`}
              data-ocid={`inventory.${item.id}_button`}
              style={{
                position: "relative",
                height: 50,
                border: `1.5px solid ${
                  isActive ? "rgba(0,229,255,0.9)" : `${col.border}99`
                }`,
                background: isActive ? "rgba(0,229,255,0.12)" : col.bg,
                borderRadius: 5,
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                transition: "all 150ms ease",
                boxShadow: isActive
                  ? `0 0 10px ${col.border}50`
                  : `0 0 4px ${col.border}20`,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
              {/* Ammo count — bottom right corner */}
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 3,
                  fontFamily: "monospace",
                  fontSize: 7,
                  fontWeight: "bold",
                  color: isActive ? "#00e5ff" : "rgba(255,255,255,0.75)",
                  lineHeight: 1,
                }}
              >
                {ammoDisplay}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 6,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Row 2: Resource slots */}
        {[0, 1, 2].map((idx) => {
          const entry = topResources[idx];
          const col = SLOT_COLORS[idx + 3];
          const hasItem = !!entry;
          const name = hasItem
            ? (RESOURCES[entry[0]]?.name ?? entry[0]).slice(0, 5)
            : null;
          return (
            <button
              key={`res-${idx}`}
              type="button"
              disabled={!hasItem}
              onClick={() => hasItem && removeResource(entry[0], 1)}
              title={
                hasItem
                  ? `Use 1x ${RESOURCES[entry[0]]?.name ?? entry[0]}`
                  : "Empty"
              }
              style={{
                position: "relative",
                height: 50,
                border: `1.5px solid ${
                  hasItem ? `${col.border}99` : "rgba(255,255,255,0.08)"
                }`,
                background: hasItem ? col.bg : "rgba(0,0,0,0.35)",
                borderRadius: 5,
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: hasItem ? "pointer" : "default",
                transition: "all 300ms ease",
                padding: 0,
                overflow: "hidden",
              }}
            >
              {hasItem ? (
                <>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 7,
                      color: "rgba(255,255,255,0.7)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: "bold",
                      color: col.border,
                      textShadow: `0 0 5px ${col.border}60`,
                    }}
                  >
                    {entry[1]}
                  </span>
                  {/* Qty in corner */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 3,
                      fontFamily: "monospace",
                      fontSize: 6,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    USE
                  </span>
                </>
              ) : (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "rgba(0,200,255,0.15)",
                  }}
                >
                  ─ ─
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* BUILD button */}
      <button
        type="button"
        data-ocid="inventory.build_button"
        style={{
          width: "100%",
          padding: "7px 0",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(0,200,255,0.5)",
          borderRadius: 4,
          color: "#00e5ff",
          fontFamily: "monospace",
          fontSize: 8,
          fontWeight: "bold",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          cursor: "pointer",
          marginBottom: 4,
          transition: "background 150ms, border-color 150ms",
          textShadow: "0 0 5px rgba(0,229,255,0.5)",
          flexShrink: 0,
        }}
      >
        BUILD
      </button>

      {/* SCOPE button — right aligned */}
      <div
        style={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}
      >
        <button
          type="button"
          data-ocid="inventory.scope_button"
          style={{
            padding: "5px 12px",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,200,0,0.5)",
            borderRadius: 4,
            color: "rgba(255,200,0,0.9)",
            fontFamily: "monospace",
            fontSize: 8,
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 150ms",
            textShadow: "0 0 4px rgba(255,200,0,0.5)",
          }}
        >
          SCOPE
        </button>
      </div>
    </div>
  );
}
