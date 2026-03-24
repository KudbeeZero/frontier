import { useMenuStore } from "../../stores/menuStore";
import { OverlayPanel } from "./OverlayPanel";
import { CargoPanel } from "./Panels/CargoPanel";
import { CommPanel } from "./Panels/CommPanel";
import { NavPanel } from "./Panels/NavPanel";
import { ScanPanel } from "./Panels/ScanPanel";
import { ShipPanel } from "./Panels/ShipPanel";

export function PanelRouter() {
  const { activePanel } = useMenuStore();
  if (!activePanel) return null;

  const panels: Record<string, { title: string; content: React.ReactNode }> = {
    ship: { title: "SHIP STATUS", content: <ShipPanel /> },
    cargo: { title: "CARGO HOLD", content: <CargoPanel /> },
    nav: { title: "NAVIGATION", content: <NavPanel /> },
    scan: { title: "SCANNER", content: <ScanPanel /> },
    comm: { title: "COMM LOG", content: <CommPanel /> },
  };

  const panel = panels[activePanel];
  if (!panel) return null;

  return <OverlayPanel title={panel.title}>{panel.content}</OverlayPanel>;
}
