import { create } from "zustand";

type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceState {
  device: DeviceType;
  detectDevice: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  device: "desktop",
  detectDevice: () => {
    const w = window.innerWidth;
    const device: DeviceType =
      w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
    set({ device });
  },
}));
