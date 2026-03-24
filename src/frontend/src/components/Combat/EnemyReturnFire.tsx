import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useCameraStore } from "../../stores/cameraStore";
import { useGameStore } from "../../stores/gameStore";
import { useGroundTargetStore } from "../../stores/groundTargetStore";
import { useOrbitalLevelStore } from "../../stores/orbitalLevelStore";
import { useShipStore } from "../../stores/shipStore";

/** Handles enemy return fire for levels 4 and 5. */
export function EnemyReturnFire() {
  const timerRef = useRef(0);

  useFrame((_, delta) => {
    const mode = useCameraStore.getState().mode;
    if (mode !== "combat") return;

    const config = useOrbitalLevelStore.getState().getCurrentConfig();
    if (!config.returnFire) return;

    const aliveTargets = useGroundTargetStore
      .getState()
      .targets.filter((t) => t.status !== "destroyed").length;
    if (aliveTargets === 0) return;

    timerRef.current += delta;
    if (timerRef.current >= config.returnFireInterval) {
      timerRef.current = 0;
      useShipStore.getState().takeDamage(config.returnFireDamage);
      useGameStore
        .getState()
        .addNotification(`Hull hit! -${config.returnFireDamage} HP`, "danger");
    }
  });

  return null;
}
