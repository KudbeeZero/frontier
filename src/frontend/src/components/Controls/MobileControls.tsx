import type React from "react";
import { useRef, useState } from "react";
import { useCameraStore } from "../../stores/cameraStore";
import { useDeviceStore } from "../../stores/deviceStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { touchCameraMovement } from "../../utils/touchCamera";
import { BoostButton } from "../UI/BoostButton";

const KEY_CODES: Record<string, string> = {
  w: "KeyW",
  a: "KeyA",
  s: "KeyS",
  d: "KeyD",
  " ": "Space",
  Space: "Space",
  Shift: "ShiftLeft",
  ShiftLeft: "ShiftLeft",
};

const BTN_SIZES = {
  small: { joystick: "w-24 h-24" },
  medium: { joystick: "w-28 h-28" },
  large: { joystick: "w-32 h-32" },
};

export const MobileControls: React.FC = () => {
  const isMobile = useDeviceStore((s) => s.isMobile);
  const { joystickSensitivity, buttonSize, hapticsEnabled } =
    useSettingsStore();
  const mode = useCameraStore((s) => s.mode);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [lookPos, setLookPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const lookJoystickRef = useRef<HTMLDivElement>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());
  const aimDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Swipe camera state (orbital only)
  const swipeTouchRef = useRef<{
    id: number;
    startX: number;
    startY: number;
  } | null>(null);

  if (!isMobile) return null;

  const sizes = BTN_SIZES[buttonSize] ?? BTN_SIZES.medium;

  const haptic = (duration = 20) => {
    if (hapticsEnabled && navigator.vibrate) navigator.vibrate(duration);
  };
  void haptic;

  const releaseKey = (key: string) => {
    const code = KEY_CODES[key] ?? key;
    if (activeKeysRef.current.has(code)) {
      window.dispatchEvent(
        new KeyboardEvent("keyup", { code, key, bubbles: true }),
      );
      activeKeysRef.current.delete(code);
    }
  };

  const pressKey = (key: string) => {
    const code = KEY_CODES[key] ?? key;
    if (!activeKeysRef.current.has(code)) {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code, key, bubbles: true }),
      );
      activeKeysRef.current.add(code);
    }
  };

  const releaseKeys = (keys: string[]) => {
    for (const key of keys) releaseKey(key);
  };

  // ─── LEFT JOYSTICK ────────────────────────────────────────────────────────
  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const rawX = touch.clientX - rect.left - rect.width / 2;
    const rawY = touch.clientY - rect.top - rect.height / 2;
    const maxDist = 40 * joystickSensitivity;
    const dist = Math.hypot(rawX, rawY);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(rawY, rawX);
    const cx = Math.cos(angle) * clampedDist;
    const cy = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: cx, y: cy });

    const threshold = 15;
    const isCombat = mode === "combat";
    const allKeys = isCombat
      ? ["a", "d", "Space", "ShiftLeft"]
      : ["w", "a", "s", "d"];

    if (clampedDist > threshold) {
      const xNorm = rawX / maxDist;
      if (xNorm > 0.25) {
        pressKey("d");
        releaseKey("a");
      } else if (xNorm < -0.25) {
        pressKey("a");
        releaseKey("d");
      } else {
        releaseKey("a");
        releaseKey("d");
      }

      const yNorm = rawY / maxDist;
      if (isCombat) {
        if (yNorm < -0.25) {
          pressKey("Space");
          releaseKey("ShiftLeft");
        } else if (yNorm > 0.25) {
          pressKey("ShiftLeft");
          releaseKey("Space");
        } else {
          releaseKey("Space");
          releaseKey("ShiftLeft");
        }
      } else {
        if (yNorm < -0.25) {
          pressKey("w");
          releaseKey("s");
        } else if (yNorm > 0.25) {
          pressKey("s");
          releaseKey("w");
        } else {
          releaseKey("w");
          releaseKey("s");
        }
      }
    } else {
      releaseKeys(allKeys);
    }
  };

  const handleJoystickEnd = () => {
    setJoystickPos({ x: 0, y: 0 });
    releaseKeys(["w", "a", "s", "d", "Space", "ShiftLeft"]);
  };

  // ─── RIGHT JOYSTICK ───────────────────────────────────────────────────────
  const handleLookMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = lookJoystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const rawX = touch.clientX - rect.left - rect.width / 2;
    const rawY = touch.clientY - rect.top - rect.height / 2;
    const maxDist = 40 * joystickSensitivity;
    const dist = Math.hypot(rawX, rawY);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(rawY, rawX);
    const cx = Math.cos(angle) * clampedDist;
    const cy = Math.sin(angle) * clampedDist;

    setLookPos({ x: cx, y: cy });

    const isCombat = mode === "combat";

    if (isCombat) {
      if (aimDecayRef.current !== null) {
        clearInterval(aimDecayRef.current);
        aimDecayRef.current = null;
      }
      const { setAimYaw, setAimPitch } = useCameraStore.getState();
      setAimYaw((rawX / maxDist) * (Math.PI / 2));
      setAimPitch((rawY / maxDist) * (Math.PI / 4));
    } else {
      const { freeRoamYaw, freeRoamPitch, setFreeRoamYaw, setFreeRoamPitch } =
        useCameraStore.getState();
      const sensitivity = 0.015;
      setFreeRoamYaw(freeRoamYaw + (rawX / maxDist) * sensitivity * 2);
      setFreeRoamPitch(freeRoamPitch + (rawY / maxDist) * sensitivity * 2);
    }
  };

  const handleLookEnd = () => {
    setLookPos({ x: 0, y: 0 });
    if (mode === "combat") {
      const { setAimYaw, setAimPitch } = useCameraStore.getState();
      setAimYaw(0);
      setAimPitch(0);
    }
  };

  // Swipe camera for orbital mode
  const handleSwipeStart = (e: React.TouchEvent) => {
    if (swipeTouchRef.current !== null) return;
    const touch = e.changedTouches[0];
    swipeTouchRef.current = {
      id: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
    };
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!swipeTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === swipeTouchRef.current.id) {
        const dx = touch.clientX - swipeTouchRef.current.startX;
        const dy = touch.clientY - swipeTouchRef.current.startY;
        touchCameraMovement.x += dx * 0.8;
        touchCameraMovement.y += dy * 0.8;
        swipeTouchRef.current.startX = touch.clientX;
        swipeTouchRef.current.startY = touch.clientY;
        break;
      }
    }
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (!swipeTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === swipeTouchRef.current.id) {
        swipeTouchRef.current = null;
        break;
      }
    }
  };

  const isFreeRoam = mode === "freeRoam";
  const isCombat = mode === "combat";
  const showRightJoystick = isFreeRoam || isCombat;

  return (
    /*
     * Outer wrapper: pointer-events NONE so the center of the screen is fully
     * clear for UI taps (WeaponPanel, nav bar, etc.).
     * Only the explicit joystick/button elements get pointer-events AUTO.
     */
    <div
      data-ocid="mobile_controls.panel"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        userSelect: "none",
      }}
    >
      {/* Swipe camera zone — orbital only, right half top 60% */}
      {!isFreeRoam && !isCombat && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "60%",
            pointerEvents: "auto",
            touchAction: "none",
          }}
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          onTouchCancel={handleSwipeEnd}
        />
      )}

      {/* ─── LEFT SIDE: BoostButton + Joystick ─── */}
      <div
        style={{
          position: "absolute",
          left: "8px",
          bottom: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
        }}
      >
        {/* Boost button above left joystick */}
        <div style={{ pointerEvents: "auto" }}>
          <BoostButton />
        </div>

        {/* Left joystick */}
        <div
          style={{
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            ref={joystickRef}
            data-ocid="mobile_controls.canvas_target"
            onTouchStart={handleJoystickMove}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}
            className={`relative ${sizes.joystick} rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 touch-none`}
            style={{ touchAction: "none" }}
          >
            <div
              className="absolute w-10 h-10 rounded-full bg-cyan-500/80 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              }}
            />
          </div>
          <p className="text-xs text-cyan-500/70 mt-1 font-mono tracking-widest">
            MOVE
          </p>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Look/Aim Joystick ─── */}
      {showRightJoystick && (
        <div
          style={{
            position: "absolute",
            right: "8px",
            bottom: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              ref={lookJoystickRef}
              data-ocid="mobile_controls.look_canvas_target"
              onTouchStart={handleLookMove}
              onTouchMove={handleLookMove}
              onTouchEnd={handleLookEnd}
              onTouchCancel={handleLookEnd}
              className={`relative ${sizes.joystick} rounded-full touch-none ${
                isCombat
                  ? "bg-amber-500/20 border-2 border-amber-500/40"
                  : "bg-green-500/20 border-2 border-green-500/40"
              }`}
              style={{ touchAction: "none" }}
            >
              <div
                className={`absolute w-10 h-10 rounded-full border-2 shadow-lg ${
                  isCombat
                    ? "bg-amber-500/80 border-amber-400 shadow-amber-500/50"
                    : "bg-green-500/80 border-green-400 shadow-green-500/50"
                }`}
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(calc(-50% + ${lookPos.x}px), calc(-50% + ${lookPos.y}px))`,
                }}
              />
            </div>
            <p
              className={`text-xs mt-1 font-mono tracking-widest ${
                isCombat ? "text-amber-500/70" : "text-green-500/70"
              }`}
            >
              {isCombat ? "AIM" : "LOOK"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
