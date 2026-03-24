import { create } from "zustand";

interface DeviceState {
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceState {
  device: DeviceType;
  isMobile: boolean;
  detectDevice: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  isMobile: false,
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,

  detectDevice: () => {
    const width = window.innerWidth;
    const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    set({
      isMobile: width < 768 || isMobileUA,
      screenWidth: width,
      screenHeight: window.innerHeight,
    });
  device: "desktop",
  isMobile: false,
  detectDevice: () => {
    const w = window.innerWidth;
    const device: DeviceType =
      w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
    set({ device, isMobile: device === "mobile" || device === "tablet" });
  },
}));
