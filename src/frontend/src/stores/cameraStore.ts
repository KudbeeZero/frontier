import { Vector3 } from "three";
import { create } from "zustand";

export type CameraMode = "orbital" | "cockpit";

interface CameraState {
  mode: CameraMode;
  target: Vector3;
  distance: number;
  orbitAngle: number;
  orbitHeight: number;
  orbitSpeed: number;
  setMode: (mode: CameraMode) => void;
  setTarget: (target: Vector3) => void;
  setOrbitAngle: (angle: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  mode: "orbital",
  target: new Vector3(0, 0, 0),
  distance: 2.8,
  orbitAngle: 0,
  orbitHeight: 0.18,
  orbitSpeed: 0.03,
  setMode: (mode) => set({ mode }),
  setTarget: (target) => set({ target }),
  setOrbitAngle: (angle) => set({ orbitAngle: angle }),
}));
