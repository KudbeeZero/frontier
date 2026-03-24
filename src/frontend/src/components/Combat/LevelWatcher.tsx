import { useEffect } from "react";
import { useCameraStore } from "../../stores/cameraStore";
import { useGameStore } from "../../stores/gameStore";
import { useGroundTargetStore } from "../../stores/groundTargetStore";
import { useOrbitalLevelStore } from "../../stores/orbitalLevelStore";

/** Watches target destruction and triggers level advancement when all targets on current level are gone. */
export function LevelWatcher() {
  const targets = useGroundTargetStore((s) => s.targets);
  const currentLevel = useOrbitalLevelStore((s) => s.currentLevel);
  const isAdvancing = useOrbitalLevelStore((s) => s.isAdvancing);
  const levelStatus = useOrbitalLevelStore((s) => s.levelStatus);
  const mode = useCameraStore((s) => s.mode);

  useEffect(() => {
    if (mode !== "combat") return;
    if (isAdvancing) return;
    if (levelStatus[currentLevel] === "completed") return;

    const total = targets.length;
    if (total === 0) return;

    const alive = targets.filter((t) => t.status !== "destroyed").length;
    if (alive > 0) return;

    // All cleared — trigger level complete
    const { completeCurrentLevel } = useOrbitalLevelStore.getState();
    completeCurrentLevel();

    const nextLevel = currentLevel + 1;
    if (nextLevel <= 5) {
      useGameStore
        .getState()
        .addNotification(
          `LEVEL ${currentLevel} COMPLETE! Advancing to ${["Low", "Medium", "High", "Geo", "Outer"][nextLevel - 1]} Orbit...`,
          "success",
        );
    } else {
      useGameStore
        .getState()
        .addNotification("ALL LEVELS COMPLETE! Sector 7 cleared.", "success");
    }
  }, [targets, currentLevel, isAdvancing, levelStatus, mode]);

  return null;
}
