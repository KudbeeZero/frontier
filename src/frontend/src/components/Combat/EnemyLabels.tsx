import { Html } from "@react-three/drei";
import { useEnemyStore } from "../../stores/useEnemyStore";
import { ENEMY_WORLD_RADIUS } from "./Projectile";

/** SVG targeting brackets rendered around the locked target */
function TargetBrackets() {
  const SIZE = 32;
  const GAP = 6;
  const ARM = 8;
  const STROKE = "rgba(0,255,255,0.85)";
  return (
    <svg
      width={SIZE + GAP * 2}
      height={SIZE + GAP * 2}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <polyline
        points={`${GAP + ARM},${GAP} ${GAP},${GAP} ${GAP},${GAP + ARM}`}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <polyline
        points={`${GAP + SIZE - ARM},${GAP} ${GAP + SIZE},${GAP} ${GAP + SIZE},${GAP + ARM}`}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <polyline
        points={`${GAP},${GAP + SIZE - ARM} ${GAP},${GAP + SIZE} ${GAP + ARM},${GAP + SIZE}`}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <polyline
        points={`${GAP + SIZE},${GAP + SIZE - ARM} ${GAP + SIZE},${GAP + SIZE} ${GAP + SIZE - ARM},${GAP + SIZE}`}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EnemyLabel({
  dist,
  theta,
  phi,
  isLocked,
}: {
  dist: number;
  theta: number;
  phi: number;
  isLocked: boolean;
}) {
  const x = dist * Math.cos(phi) * Math.cos(theta);
  const y = dist * Math.sin(phi);
  const z = dist * Math.cos(phi) * Math.sin(theta);

  return (
    <group position={[x, y, z]}>
      <Html
        center
        occlude
        distanceFactor={dist * 0.6}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {isLocked && <TargetBrackets />}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "9px",
              color: isLocked ? "#00ffff" : "rgba(0,200,220,0.7)",
              textShadow: isLocked
                ? "0 0 6px rgba(0,255,255,0.9)"
                : "0 0 4px rgba(0,180,200,0.5)",
              background: "rgba(0,0,0,0.4)",
              padding: "1px 4px",
              borderRadius: "3px",
              whiteSpace: "nowrap",
              marginTop: isLocked ? "24px" : "0",
              letterSpacing: "0.05em",
            }}
          >
            ◈ {Math.round(dist)}u
          </span>
        </div>
      </Html>
    </group>
  );
}

export function EnemyLabels() {
  const enemies = useEnemyStore((s) => s.enemies);
  const lockedTarget = useEnemyStore((s) => s.lockedTarget);

  return (
    <>
      {enemies.map((enemy) => (
        <EnemyLabel
          key={enemy.id}
          dist={enemy.distance ?? ENEMY_WORLD_RADIUS}
          theta={enemy.theta}
          phi={enemy.phi}
          isLocked={lockedTarget === enemy.id}
        />
      ))}
    </>
  );
}
