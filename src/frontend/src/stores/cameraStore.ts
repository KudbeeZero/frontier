import { Vector3 } from "three";
import { create } from "zustand";

export type CameraMode = "orbital" | "combat" | "freeRoam";

interface CameraState {
  mode: CameraMode;
  target: Vector3;
  distance: number;
  orbitAngle: number;
  orbitHeight: number;
  orbitSpeed: number;
  // Combat aim offsets (radians)
  aimPitch: number; // -PI/4 to +PI/4
  aimYaw: number; // -PI/2 to +PI/2
  // Free roam state
  freeRoamPos: { x: number; y: number; z: number };
  freeRoamYaw: number;
  freeRoamPitch: number;
  setMode: (mode: CameraMode) => void;
  setTarget: (target: Vector3) => void;
  setOrbitAngle: (angle: number) => void;
  setAimPitch: (v: number) => void;
  setAimYaw: (v: number) => void;
  setFreeRoamPos: (pos: { x: number; y: number; z: number }) => void;
  setFreeRoamYaw: (v: number) => void;
  setFreeRoamPitch: (v: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  mode: "orbital",
  target: new Vector3(0, 0, 0),
  distance: 2.8,
  orbitAngle: 0,
  orbitHeight: 0.18,
  orbitSpeed: 0.03,
  aimPitch: 0,
  aimYaw: 0,
  freeRoamPos: { x: 0, y: 0.5, z: 4.0 },
  freeRoamYaw: 0,
  freeRoamPitch: 0,
  setMode: (mode) => set({ mode }),
  setTarget: (target) => set({ target }),
  setOrbitAngle: (angle) => set({ orbitAngle: angle }),
  setAimPitch: (v) =>
    set({ aimPitch: Math.max(-Math.PI / 4, Math.min(Math.PI / 4, v)) }),
  setAimYaw: (v) =>
    set({ aimYaw: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, v)) }),
  setFreeRoamPos: (pos) => set({ freeRoamPos: pos }),
  setFreeRoamYaw: (v) => set({ freeRoamYaw: v }),
  setFreeRoamPitch: (v) =>
    set({ freeRoamPitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, v)) }),
}));
