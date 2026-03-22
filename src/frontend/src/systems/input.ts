import { THRUST_RATE, useShipStore } from "../stores/useShipStore";

const keys = new Set<string>();

export function initKeyboardControls() {
  const handleKeyDown = async (e: KeyboardEvent) => {
    // Prevent spacebar from scrolling
    if (e.code === "Space") {
      e.preventDefault();
    }

    keys.add(e.code);

    if (e.code === "Escape") {
      const { useTargetingStore } = await import("../stores/useTargetingStore");
      useTargetingStore.getState().clearTarget();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}

export function processKeyboardInput(deltaTime: number) {
  const shipStore = useShipStore.getState();

  let thrustTheta = 0;
  let thrustPhi = 0;

  if (keys.has("KeyW")) thrustPhi -= THRUST_RATE * deltaTime;
  if (keys.has("KeyS")) thrustPhi += THRUST_RATE * deltaTime;
  if (keys.has("KeyA")) thrustTheta -= THRUST_RATE * deltaTime;
  if (keys.has("KeyD")) thrustTheta += THRUST_RATE * deltaTime;

  if (thrustTheta !== 0 || thrustPhi !== 0) {
    shipStore.applyThrust(thrustTheta, thrustPhi);
  }

  // Fire with spacebar (once per press)
  if (keys.has("Space")) {
    keys.delete("Space");
    import("../stores/useWeaponsStore").then(({ useWeaponsStore }) => {
      useWeaponsStore.getState().fire();
    });
  }
}
