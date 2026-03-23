import { useMenuStore } from "../../stores/menuStore";

const NAV_ITEMS = [
  { id: "cargo", icon: "📦", label: "CARGO" },
  { id: "build", icon: "🔧", label: "BUILD" },
  { id: "map", icon: "🗺", label: "MAP" },
  { id: "chat", icon: "💬", label: "COMM" },
  { id: "stats", icon: "📊", label: "STATS" },
  { id: "menu", icon: "☰", label: "MENU" },
] as const;

type NavItemId = (typeof NAV_ITEMS)[number]["id"];

export function BottomNavStrip() {
  const { activePanel, togglePanel } = useMenuStore();

  const handleClick = (id: NavItemId) => {
    if (id === "cargo") {
      togglePanel("cargo" as Parameters<typeof togglePanel>[0]);
    } else if (id === "menu") {
      togglePanel("ship" as Parameters<typeof togglePanel>[0]);
    } else if (id === "stats") {
      togglePanel("scan" as Parameters<typeof togglePanel>[0]);
    } else if (id === "chat") {
      togglePanel("comm" as Parameters<typeof togglePanel>[0]);
    }
  };

  const isActive = (id: NavItemId) => {
    if (id === "cargo") return activePanel === "cargo";
    if (id === "menu") return activePanel === "ship";
    if (id === "stats") return activePanel === "scan";
    if (id === "chat") return activePanel === "comm";
    return false;
  };

  return (
    <div
      data-ocid="nav.strip"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 58,
        zIndex: 30,
        background: "rgba(0,0,0,0.3)",
        borderTop: "1px solid rgba(0,200,255,0.3)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        padding: "0 8px",
        pointerEvents: "auto",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            data-ocid={`nav.${item.id}_button`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: active ? "rgba(0,200,255,0.18)" : "rgba(0,0,0,0.5)",
              border: `1.5px solid ${
                active ? "rgba(0,200,255,0.8)" : "rgba(0,200,255,0.25)"
              }`,
              cursor: "pointer",
              transition: "all 150ms ease",
              boxShadow: active ? "0 0 12px rgba(0,200,255,0.35)" : "none",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
