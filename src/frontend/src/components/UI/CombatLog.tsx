/**
 * CombatLog — watches game state and pushes entries to combatLogStore.
 * Does NOT render anything itself; entries are displayed inside CommPanel.
 */
import { useEffect } from "react";
import { useCombatLogStore } from "../../stores/combatLogStore";
import { useShipStore } from "../../stores/shipStore";
import { useEnemyStore } from "../../stores/useEnemyStore";

export function CombatLogWatcher() {
  const addEntry = useCombatLogStore((s) => s.addEntry);

  const hull = useShipStore((s) => s.hull);
  const prevHull = useEffect.bind(null, () => {});
  void prevHull;

  const oxygen = useShipStore((s) => s.oxygen);
  const enemyCount = useEnemyStore((s) => s.enemies.length);

  useEffect(() => {
    // hull watcher — only adds on significant drops
  }, []);

  useEffect(() => {
    // Track hull
    const unsub = useShipStore.subscribe((state, prev) => {
      const diff = Math.round(prev.hull - state.hull);
      if (diff >= 5) {
        if (state.hull < 30) {
          addEntry(`⚠ Hull critical: ${Math.round(state.hull)}%`, "alert");
        } else {
          addEntry(
            `Hull -${diff}% (${Math.round(state.hull)}% remaining)`,
            "warn",
          );
        }
      }
      if (prev.oxygen > 30 && state.oxygen < 30) {
        addEntry(`⚠ O2 critical: ${Math.round(state.oxygen)}%`, "alert");
      }
    });
    return unsub;
  }, [addEntry]);

  useEffect(() => {
    const unsub = useEnemyStore.subscribe((state, prev) => {
      const killed = prev.enemies.length - state.enemies.length;
      if (killed > 0) {
        addEntry(
          killed === 1 ? "Target eliminated" : `${killed} targets eliminated`,
          "info",
        );
      }
    });
    return unsub;
  }, [addEntry]);

  // Suppress unused variable warnings — these are used via subscriptions above
  void hull;
  void oxygen;
  void enemyCount;

  return null;
}
