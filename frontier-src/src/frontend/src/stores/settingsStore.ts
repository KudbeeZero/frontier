import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  joystickSensitivity: number;
  cameraSensitivity: number;
  buttonSize: "small" | "medium" | "large";
  hapticsEnabled: boolean;
  setJoystickSensitivity: (v: number) => void;
  setCameraSensitivity: (v: number) => void;
  setButtonSize: (v: "small" | "medium" | "large") => void;
  setHapticsEnabled: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      joystickSensitivity: 1.0,
      cameraSensitivity: 1.0,
      buttonSize: "medium",
      hapticsEnabled: true,

      setJoystickSensitivity: (v) => set({ joystickSensitivity: v }),
      setCameraSensitivity: (v) => set({ cameraSensitivity: v }),
      setButtonSize: (v) => set({ buttonSize: v }),
      setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
    }),
    { name: "frontier-settings" },
  ),
);
