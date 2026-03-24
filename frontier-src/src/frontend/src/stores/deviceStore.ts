import { create } from "zustand";

type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceState {
  device: DeviceType;
  isMobile: boolean;
  detectDevice: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  device: "desktop",
  isMobile: false,
  detectDevice: () => {
    const w = window.innerWidth;
    const device: DeviceType =
      w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
    set({ device, isMobile: device === "mobile" || device === "tablet" });
  },
}));
