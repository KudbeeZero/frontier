import { create } from "zustand";

interface DeviceState {
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
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
  },
}));
