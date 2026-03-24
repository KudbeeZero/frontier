import { useMenuStore } from "../../stores/menuStore";

const NAV_ITEMS = [
  { id: "cargo", icon: "📦", label: "CARGO", disabled: false },
  { id: "build", icon: "🔧", label: "BUILD", disabled: true },
  { id: "map", icon: "🗺", label: "MAP", disabled: false },
  { id: "chat", icon: "💬", label: "COMM", disabled: false },
  { id: "stats", icon: "📊", label: "STATS", disabled: false },
  { id: "menu", icon: "☰", label: "MENU", disabled: false },
] as const;

type NavItemId = (typeof NAV_ITEMS)[number]["id"];

export function BottomNavStrip() {
  const { activePanel, togglePanel, showCircularMenu, toggleCircularMenu } =
    useMenuStore();

  const handleClick = (id: NavItemId) => {
    if (id === "cargo") {
      togglePanel("cargo");
    } else if (id === "menu") {
      toggleCircularMenu();
    } else if (id === "stats") {
      togglePanel("scan");
    } else if (id === "chat") {
      togglePanel("comm");
    } else if (id === "map") {
      togglePanel("nav");
    }
  };

  const isActive = (id: NavItemId) => {
    if (id === "cargo") return activePanel === "cargo";
    if (id === "menu") return showCircularMenu;
    if (id === "stats") return activePanel === "scan";
    if (id === "chat") return activePanel === "comm";
    if (id === "map") return activePanel === "nav";
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
        const disabled = item.disabled;
        return (
          <button
            key={item.id}
            type="button"
            onClick={disabled ? undefined : () => handleClick(item.id)}
            disabled={disabled}
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
              background: disabled
                ? "rgba(0,0,0,0.2)"
                : active
                  ? "rgba(0,200,255,0.18)"
                  : "rgba(0,0,0,0.5)",
              border: `1.5px solid ${
                disabled
                  ? "rgba(0,200,255,0.1)"
                  : active
                    ? "rgba(0,200,255,0.8)"
                    : "rgba(0,200,255,0.25)"
              }`,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 150ms ease",
              boxShadow: active ? "0 0 12px rgba(0,200,255,0.35)" : "none",
              flexShrink: 0,
              padding: 0,
              opacity: disabled ? 0.35 : 1,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
