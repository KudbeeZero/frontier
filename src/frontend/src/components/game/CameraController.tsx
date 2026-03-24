import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useProjectilesStore } from "../../stores/useProjectilesStore";
import { useShipStore } from "../../stores/useShipStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import {
  initKeyboardControls,
  processKeyboardInput,
} from "../../systems/input";

export function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    const cleanup = initKeyboardControls();
    return cleanup;
  }, []);

  useFrame((_, delta) => {
    const shipStore = useShipStore.getState();
    const weaponsStore = useWeaponsStore.getState();

    processKeyboardInput(delta * 60);
    shipStore.applyVelocityTick(delta * 60);
    weaponsStore.tick(delta * 1000);

    // Tick projectiles (collision handled inside)
    useProjectilesStore.getState().tick(delta);

    const { theta, phi } = shipStore;
    const radius = 3;
    const x = radius * Math.cos(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.sin(theta);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
