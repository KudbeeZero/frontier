import { useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useShipStore } from "../../stores/shipStore";
import { SAVE_KEY } from "../../utils/constants";

type Tab = "menu" | "settings";

export default function PauseMenu() {
  const { togglePauseMenu, setGameStarted, addNotification } = useGameStore();
  const {
    joystickSensitivity,
    cameraSensitivity,
    buttonSize,
    hapticsEnabled,
    setJoystickSensitivity,
    setCameraSensitivity,
    setButtonSize,
    setHapticsEnabled,
  } = useSettingsStore();
  const [tab, setTab] = useState<Tab>("menu");

  const saveGame = () => {
    const ship = useShipStore.getState();
    const inv = useInventoryStore.getState();
    const saveData = {
      hull: ship.hull,
      fuel: ship.fuel,
      credits: useGameStore.getState().credits,
      resources: inv.resources,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    addNotification("Game saved!", "success");
    togglePauseMenu();
  };

  const quit = () => {
    setGameStarted(false);
    togglePauseMenu();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="hud-panel p-6 text-center min-w-72 max-w-sm w-full mx-4">
        {/* Tabs */}
        <div className="flex mb-6 border border-cyan-500/30 rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setTab("menu")}
            className={`flex-1 py-2 text-xs font-mono tracking-widest transition-colors ${
              tab === "menu"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-cyan-500/50 hover:text-cyan-400"
            }`}
          >
            PAUSED
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`flex-1 py-2 text-xs font-mono tracking-widest transition-colors ${
              tab === "settings"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-cyan-500/50 hover:text-cyan-400"
            }`}
          >
            SETTINGS
          </button>
        </div>

        {tab === "menu" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={togglePauseMenu}
              className="w-full py-2 text-sm font-mono rounded border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors pointer-events-auto"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={saveGame}
              className="w-full py-2 text-sm font-mono rounded border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-colors pointer-events-auto"
            >
              Save Game
            </button>
            <button
              type="button"
              onClick={quit}
              className="w-full py-2 text-sm font-mono rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors pointer-events-auto"
            >
              Quit to Menu
            </button>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-5 text-left">
            {/* Joystick Sensitivity */}
            <label htmlFor="joystick-sens" className="block">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-mono text-cyan-400 tracking-widest">
                  JOYSTICK SENSITIVITY
                </span>
                <span className="text-xs font-mono text-cyan-300">
                  {joystickSensitivity.toFixed(1)}
                </span>
              </div>
              <input
                id="joystick-sens"
                type="range"
                min={0.3}
                max={2.0}
                step={0.1}
                value={joystickSensitivity}
                onChange={(e) =>
                  setJoystickSensitivity(Number.parseFloat(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </label>

            {/* Camera Sensitivity */}
            <label htmlFor="camera-sens" className="block">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-mono text-cyan-400 tracking-widest">
                  CAMERA SENSITIVITY
                </span>
                <span className="text-xs font-mono text-cyan-300">
                  {cameraSensitivity.toFixed(1)}
                </span>
              </div>
              <input
                id="camera-sens"
                type="range"
                min={0.3}
                max={2.0}
                step={0.1}
                value={cameraSensitivity}
                onChange={(e) =>
                  setCameraSensitivity(Number.parseFloat(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </label>

            {/* Button Size */}
            <div>
              <span className="text-xs font-mono text-cyan-400 tracking-widest block mb-2">
                BUTTON SIZE
              </span>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setButtonSize(size)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded border transition-colors ${
                      buttonSize === size
                        ? "bg-cyan-500/30 border-cyan-400 text-cyan-300"
                        : "border-cyan-500/30 text-cyan-500/60 hover:text-cyan-400"
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Haptics Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 tracking-widest">
                HAPTIC FEEDBACK
              </span>
              <button
                type="button"
                aria-label={`Haptic feedback ${hapticsEnabled ? "on" : "off"}`}
                onClick={() => setHapticsEnabled(!hapticsEnabled)}
                className={`relative w-12 h-6 rounded-full border transition-colors ${
                  hapticsEnabled
                    ? "bg-cyan-500/40 border-cyan-400"
                    : "bg-slate-700/40 border-slate-500/40"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    hapticsEnabled
                      ? "left-6 bg-cyan-400"
                      : "left-0.5 bg-slate-400"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
