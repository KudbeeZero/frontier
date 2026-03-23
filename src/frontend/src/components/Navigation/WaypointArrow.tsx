import { useEffect, useRef, useState } from "react";
import { useCameraStore } from "../../stores/cameraStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useStoryStore } from "../../stores/storyStore";

interface ArrowState {
  x: number;
  y: number;
  rotation: number;
  distance: number;
  onTarget: boolean;
}

/** Futuristic directional waypoint arrow — story mode only */
export function WaypointArrow() {
  const isStoryMode = useStoryStore((s) => s.isStoryMode);
  const objectivePosition = useStoryStore((s) => s.objectivePosition);
  const objectiveLabel = useStoryStore((s) => s.objectiveLabel);
  const navAidEnabled = useSettingsStore((s) => s.navAidEnabled);

  const [arrow, setArrow] = useState<ArrowState | null>(null);
  const frameRef = useRef<number>(0);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!isStoryMode || !navAidEnabled || !objectivePosition) {
      setArrow(null);
      return;
    }

    const UPDATE_INTERVAL = 1000 / 20; // 20fps is plenty for a compass needle

    const tick = (now: number) => {
      frameRef.current = requestAnimationFrame(tick);
      if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;
      lastUpdateRef.current = now;

      const cam = useCameraStore.getState();
      const { freeRoamPos, freeRoamYaw } = cam;
      const { x: ox, y: oy, z: oz } = objectivePosition;
      const { x: px, y: py, z: pz } = freeRoamPos;

      const dx = ox - px;
      const dy = oy - py;
      const dz = oz - pz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const W = window.innerWidth;
      const H = window.innerHeight;
      const EDGE_PAD = 52;
      const cx = W / 2;
      const cy = H / 2;
      const maxEdgeX = cx - EDGE_PAD;
      const maxEdgeY = cy - EDGE_PAD;

      // Project world direction into camera screen-space
      // Camera right = (cos(yaw), 0, -sin(yaw)), forward = (-sin(yaw), 0, -cos(yaw))
      const yaw = freeRoamYaw;
      const camRightX = Math.cos(yaw);
      const camRightZ = -Math.sin(yaw);
      const camFwdX = -Math.sin(yaw);
      const camFwdZ = -Math.cos(yaw);

      // Screen X = dot(dir_xz, camRight), Screen Fwd = dot(dir_xz, camFwd)
      const screenX = dx * camRightX + dz * camRightZ;
      const screenFwd = dx * camFwdX + dz * camFwdZ;
      const screenY = dy; // vertical component (simplified, ignores pitch)

      const inFront = screenFwd > 0;

      // Perspective-divide to get normalized device coordinates
      const fovH = (55 * Math.PI) / 180;
      const tanHalfFov = Math.tan(fovH / 2);
      const aspect = W / H;

      const ndcX =
        Math.abs(screenFwd) > 0.01
          ? screenX / screenFwd / tanHalfFov
          : screenX * 9999;
      const ndcY =
        Math.abs(screenFwd) > 0.01
          ? (screenY / screenFwd / tanHalfFov) * aspect
          : screenY * 9999;

      const onTarget =
        inFront &&
        Math.abs(ndcX) <= 0.95 &&
        Math.abs(ndcY) <= 0.95 &&
        distance < 40;

      let arrowX: number;
      let arrowY: number;
      let rotation: number;

      if (onTarget) {
        // Show directly over the target
        arrowX = cx + ndcX * maxEdgeX;
        arrowY = cy - ndcY * maxEdgeY;
        rotation = 0;
      } else {
        // Edge-clamp: compute 2D screen-space direction
        // dirX: rightward on screen, dirY: downward on screen
        const dirX = inFront ? ndcX : -ndcX;
        const dirY = inFront ? -ndcY : ndcY;

        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const nx = dirX / len;
        const ny = dirY / len;

        const scaleX = Math.abs(nx) > 0.0001 ? maxEdgeX / Math.abs(nx) : 9999;
        const scaleY = Math.abs(ny) > 0.0001 ? maxEdgeY / Math.abs(ny) : 9999;
        const scale = Math.min(scaleX, scaleY);

        arrowX = cx + nx * scale;
        arrowY = cy + ny * scale;
        // Rotation: 0 = pointing up, clockwise positive
        rotation = (Math.atan2(nx, -ny) * 180) / Math.PI;
      }

      setArrow({ x: arrowX, y: arrowY, rotation, distance, onTarget });
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isStoryMode, navAidEnabled, objectivePosition]);

  if (!arrow || !isStoryMode || !navAidEnabled || !objectivePosition) {
    return null;
  }

  const { x, y, rotation, distance, onTarget } = arrow;
  const distLabel =
    distance >= 1000
      ? `${(distance / 1000).toFixed(1)}ku`
      : `${Math.round(distance)}u`;

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        zIndex: 45,
        pointerEvents: "none",
        transition: "opacity 400ms ease",
      }}
    >
      {onTarget ? (
        // On-target diamond marker
        <div style={{ position: "relative", textAlign: "center" }}>
          <div
            style={{
              width: 18,
              height: 18,
              background: "transparent",
              border: "2px solid #00ffff",
              transform: "rotate(45deg)",
              boxShadow:
                "0 0 12px rgba(0,255,255,0.9), inset 0 0 6px rgba(0,255,255,0.3)",
              animation: "waypointPulse 1.2s ease-in-out infinite",
              margin: "0 auto",
            }}
          />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "9px",
              color: "#00ffff",
              letterSpacing: "0.12em",
              textShadow: "0 0 6px rgba(0,255,255,0.8)",
              marginTop: 6,
              whiteSpace: "nowrap",
            }}
          >
            {objectiveLabel}
          </div>
        </div>
      ) : (
        // Off-screen edge arrow
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Arrow head */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderBottom: "14px solid #00ffff",
              filter:
                "drop-shadow(0 0 6px rgba(0,255,255,0.9)) drop-shadow(0 0 12px rgba(0,255,255,0.5))",
              animation: "waypointPulse 1.5s ease-in-out infinite",
            }}
          />
          {/* Arrow shaft */}
          <div
            style={{
              width: 2,
              height: 8,
              background:
                "linear-gradient(to bottom, rgba(0,255,255,0.8), rgba(0,255,255,0.2))",
              borderRadius: 1,
            }}
          />
          {/* Distance + label badge */}
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(0,255,255,0.5)",
              borderRadius: 4,
              padding: "2px 6px",
              fontFamily: "monospace",
              fontSize: "9px",
              color: "#00e5ff",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
              textShadow: "0 0 5px rgba(0,229,255,0.7)",
              backdropFilter: "blur(4px)",
            }}
          >
            {objectiveLabel} {distLabel}
          </div>
        </div>
      )}
    </div>
  );
}
