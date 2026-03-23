import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";

// ─── EARTH MESH ────────────────────────────────────────────────────────────────
function EarthMesh() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(
    THREE.TextureLoader,
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  );
  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.08;
  });
  return (
    <mesh ref={earthRef} position={[0.8, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
    </mesh>
  );
}
function EarthFallback() {
  const earthRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.08;
  });
  return (
    <mesh ref={earthRef} position={[0.8, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#1a3a7a" roughness={0.7} metalness={0.2} />
    </mesh>
  );
}
function AtmosphereGlow() {
  return (
    <group position={[0.8, 0, 0]}>
      <mesh>
        <sphereGeometry args={[2.18, 32, 32]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#2255cc"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.9, 32, 32]} />
        <meshBasicMaterial
          color="#1133aa"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
function Stars() {
  const geo = useRef<THREE.BufferGeometry>(null);
  useEffect(() => {
    if (geo.current) {
      const pos = new Float32Array(200 * 3);
      for (let i = 0; i < 200; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 20 + Math.random() * 30;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      }
      geo.current.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    }
  }, []);
  return (
    <points>
      <bufferGeometry ref={geo} />
      <pointsMaterial size={0.08} color="#aaccff" transparent opacity={0.7} />
    </points>
  );
}

// ─── CARRIER SHIP (simple geometry) ───────────────────────────────────────────
function CarrierShip({ progress }: { progress: number }) {
  // progress 0→1: ship descends from above into view
  const y = 6 - progress * 3;
  const opacity = Math.min(progress * 3, 1);
  return (
    <group position={[0.8, y, 0]} rotation={[0.1, 0, 0.05]}>
      {/* Main hull */}
      <mesh>
        <boxGeometry args={[2.5, 0.3, 0.7]} />
        <meshStandardMaterial
          color="#334455"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Bridge tower */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.5]} />
        <meshStandardMaterial
          color="#223344"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Left wing */}
      <mesh position={[-1.6, -0.05, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial
          color="#2a3a4a"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Right wing */}
      <mesh position={[1.6, -0.05, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial
          color="#2a3a4a"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Engine glow left */}
      <pointLight
        position={[-1.2, 0, -0.4]}
        color="#4488ff"
        intensity={opacity * 3}
        distance={2}
      />
      {/* Engine glow right */}
      <pointLight
        position={[1.2, 0, -0.4]}
        color="#4488ff"
        intensity={opacity * 3}
        distance={2}
      />
    </group>
  );
}

// ─── DROP POD ──────────────────────────────────────────────────────────────────
function DropPod({ progress }: { progress: number }) {
  // progress 0→1: pod shoots downward from carrier position
  const y = 3 - progress * 9;
  const opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;
  const trailLength = progress * 2;
  return (
    <group position={[0.8, y, 0.2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.2, 8]} />
        <meshStandardMaterial
          color="#ff8844"
          emissive="#ff4400"
          emissiveIntensity={2}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Engine trail */}
      <mesh position={[0, trailLength / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.04, trailLength, 6]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={opacity * 0.5}
        />
      </mesh>
      <pointLight color="#ff8844" intensity={opacity * 4} distance={1.5} />
    </group>
  );
}

// ─── SCENE ─────────────────────────────────────────────────────────────────────
function Scene(_props: { phase?: number }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={2.2} color="#ffffff" />
      <Stars />
      <AtmosphereGlow />
      <Suspense fallback={<EarthFallback />}>
        <EarthMesh />
      </Suspense>
    </>
  );
}

// ─── LAUNCH SCENE (carrier + pod) ─────────────────────────────────────────────
function LaunchScene({
  carrierProgress,
  podProgress,
  showPod,
}: {
  carrierProgress: number;
  podProgress: number;
  showPod: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
      <Stars />
      <AtmosphereGlow />
      <Suspense fallback={<EarthFallback />}>
        <EarthMesh />
      </Suspense>
      <CarrierShip progress={carrierProgress} />
      {showPod && <DropPod progress={podProgress} />}
    </>
  );
}

// ─── CORNER DECORATION ────────────────────────────────────────────────────────
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const isl = pos.includes("l");
  const ist = pos.includes("t");
  const style: React.CSSProperties = {
    position: "absolute",
    width: 32,
    height: 32,
    ...(ist ? { top: 20 } : { bottom: 20 }),
    ...(isl ? { left: 20 } : { right: 20 }),
    borderTop: ist ? "1.5px solid rgba(0,200,255,0.55)" : undefined,
    borderBottom: !ist ? "1.5px solid rgba(0,200,255,0.55)" : undefined,
    borderLeft: isl ? "1.5px solid rgba(0,200,255,0.55)" : undefined,
    borderRight: !isl ? "1.5px solid rgba(0,200,255,0.55)" : undefined,
  };
  return <div style={style} />;
}

// ─── SETTINGS OVERLAY ─────────────────────────────────────────────────────────
function SettingsOverlay({ onClose }: { onClose: () => void }) {
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [audio, setAudio] = useState(true);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,5,15,0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0,8,20,0.95)",
          border: "1px solid rgba(0,200,255,0.5)",
          borderRadius: 10,
          padding: "32px 40px",
          minWidth: 320,
          fontFamily: "monospace",
          boxShadow: "0 0 40px rgba(0,200,255,0.15)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: "bold",
            letterSpacing: "0.25em",
            color: "#00ccff",
            textShadow: "0 0 10px rgba(0,200,255,0.7)",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          ⚙ SYSTEM SETTINGS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 11,
                letterSpacing: "0.15em",
              }}
            >
              AUDIO
            </span>
            <button
              type="button"
              onClick={() => setAudio((v) => !v)}
              data-ocid="settings.audio_toggle"
              style={{
                padding: "4px 16px",
                borderRadius: 4,
                border: `1px solid ${audio ? "rgba(0,255,136,0.6)" : "rgba(255,255,255,0.2)"}`,
                background: audio
                  ? "rgba(0,255,136,0.1)"
                  : "rgba(255,255,255,0.05)",
                color: audio ? "#00ff88" : "rgba(255,255,255,0.4)",
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                cursor: "pointer",
              }}
            >
              {audio ? "ON" : "OFF"}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 11,
                letterSpacing: "0.15em",
              }}
            >
              QUALITY
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {(["high", "medium", "low"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: `1px solid ${quality === q ? "rgba(0,200,255,0.7)" : "rgba(255,255,255,0.2)"}`,
                    background:
                      quality === q
                        ? "rgba(0,200,255,0.12)"
                        : "rgba(255,255,255,0.03)",
                    color: quality === q ? "#00ccff" : "rgba(255,255,255,0.4)",
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-ocid="settings.close_button"
          style={{
            width: "100%",
            marginTop: 28,
            padding: 12,
            borderRadius: 6,
            border: "1px solid rgba(0,200,255,0.4)",
            background: "rgba(0,200,255,0.08)",
            color: "#00ccff",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            letterSpacing: "0.2em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ─── LAUNCH CINEMATIC OVERLAY ─────────────────────────────────────────────────
type LaunchPhase =
  | "idle"
  | "carrier_approach"
  | "launch_sequence"
  | "pod_drop"
  | "complete";

const _PHASE_LABELS: Record<string, string> = {
  carrier_approach: "CARRIER SHIP INBOUND",
  launch_sequence: "LAUNCH SEQUENCE INITIATED",
  pod_drop: "DEPLOYING OPERATIVE",
  complete: "BREACH COMPLETE",
};

function LaunchCinematic({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<LaunchPhase>("carrier_approach");
  const [carrierProgress, setCarrierProgress] = useState(0);
  const [podProgress, setPodProgress] = useState(0);
  const [statusText, setStatusText] = useState("CARRIER SHIP INBOUND");
  const [fadeOut, setFadeOut] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Phase 1: Carrier approaches (0→1.5s)
    const t1 = setTimeout(() => {
      setPhase("launch_sequence");
      setStatusText("LAUNCH SEQUENCE INITIATED");
      setCountdown(3);
    }, 1500);

    // Countdown ticks
    const c3 = setTimeout(() => setCountdown(3), 1500);
    const c2 = setTimeout(() => setCountdown(2), 2200);
    const c1 = setTimeout(() => setCountdown(1), 3000);
    const c0 = setTimeout(() => setCountdown(0), 3800);

    // Phase 2: Pod drops (3.8s)
    const t2 = setTimeout(() => {
      setPhase("pod_drop");
      setStatusText("DEPLOYING OPERATIVE");
    }, 3800);

    // Phase 3: Complete (5.8s)
    const t3 = setTimeout(() => {
      setPhase("complete");
      setStatusText("BREACH COMPLETE — GOOD LUCK, COMMANDER");
    }, 5800);

    // Fade out (6.5s)
    const t4 = setTimeout(() => setFadeOut(true), 6500);

    // Callback (7.2s)
    const t5 = setTimeout(onComplete, 7200);

    return () => [t1, t2, t3, t4, t5, c3, c2, c1, c0].forEach(clearTimeout);
  }, [onComplete]);

  // Animate carrier progress
  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    const raf = requestAnimationFrame(function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      setCarrierProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animate pod progress
  useEffect(() => {
    if (phase !== "pod_drop") return;
    const start = performance.now();
    const dur = 2000;
    const raf = requestAnimationFrame(function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      setPodProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 700ms ease-in",
        background: "#010a18",
        overflow: "hidden",
      }}
    >
      {/* 3D Launch Scene */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          camera={{ position: [0, 1, 6], fov: 50 }}
          gl={{ antialias: true }}
        >
          <LaunchScene
            carrierProgress={carrierProgress}
            podProgress={podProgress}
            showPod={phase === "pod_drop" || phase === "complete"}
          />
        </Canvas>
      </div>

      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Status overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 80,
          pointerEvents: "none",
        }}
      >
        {/* Phase label */}
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: "0.4em",
            color: "rgba(0,200,255,0.6)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {statusText}
        </div>

        {/* Countdown */}
        {phase === "launch_sequence" && countdown > 0 && (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 72,
              fontWeight: "bold",
              color: "#00e5ff",
              textShadow:
                "0 0 30px rgba(0,229,255,0.9), 0 0 80px rgba(0,229,255,0.4)",
              lineHeight: 1,
              animation: "pulseNum 0.8s ease",
            }}
          >
            {countdown}
          </div>
        )}

        {/* Progress bar */}
        <div
          style={{
            width: 280,
            height: 2,
            background: "rgba(0,200,255,0.15)",
            borderRadius: 1,
            marginTop: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(0,200,255,0.3), #00e5ff)",
              borderRadius: 1,
              boxShadow: "0 0 8px rgba(0,200,255,0.8)",
              width: `${
                phase === "carrier_approach"
                  ? carrierProgress * 33
                  : phase === "launch_sequence"
                    ? 33 + countdown * -4 + 45
                    : phase === "pod_drop"
                      ? 66 + podProgress * 34
                      : 100
              }%`,
              transition: "width 200ms linear",
            }}
          />
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={onComplete}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "rgba(0,200,255,0.5)",
            background: "none",
            border: "1px solid rgba(0,200,255,0.25)",
            borderRadius: 4,
            padding: "6px 14px",
            cursor: "pointer",
            textTransform: "uppercase",
            pointerEvents: "auto",
          }}
        >
          SKIP ▶
        </button>
      </div>

      {/* Corner brackets */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 24,
          height: 24,
          borderTop: "1px solid rgba(0,200,255,0.4)",
          borderLeft: "1px solid rgba(0,200,255,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 24,
          height: 24,
          borderTop: "1px solid rgba(0,200,255,0.4)",
          borderRight: "1px solid rgba(0,200,255,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          width: 24,
          height: 24,
          borderBottom: "1px solid rgba(0,200,255,0.4)",
          borderLeft: "1px solid rgba(0,200,255,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: 24,
          height: 24,
          borderBottom: "1px solid rgba(0,200,255,0.4)",
          borderRight: "1px solid rgba(0,200,255,0.4)",
        }}
      />
    </div>
  );
}

// ─── MAIN MENU ─────────────────────────────────────────────────────────────────
export default function MainMenu() {
  const setGameStarted = useGameStore((s) => s.setGameStarted);
  const [showSettings, setShowSettings] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);

  const handleDeploy = () => setShowCinematic(true);
  const handleCinematicComplete = () => setGameStarted(true);

  return (
    <>
      {showCinematic && (
        <LaunchCinematic onComplete={handleCinematicComplete} />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#030c1a",
          overflow: "hidden",
        }}
      >
        {/* 3D Canvas background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 55 }}
            gl={{ antialias: true }}
          >
            <Scene />
          </Canvas>
        </div>

        {/* Dark left gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to right, rgba(3,8,20,0.92) 0%, rgba(3,8,20,0.6) 45%, rgba(3,8,20,0.1) 70%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Corners */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </div>

        {/* Top badge */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: "0.35em",
            color: "rgba(0,200,255,0.45)",
            textTransform: "uppercase",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          ◆ SECTOR 7 — CLASSIFIED ◆
        </div>

        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Main overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "clamp(24px, 6vw, 80px)",
            pointerEvents: "none",
          }}
        >
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "clamp(9px,1.2vw,12px)",
                letterSpacing: "0.55em",
                color: "rgba(0,200,255,0.55)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              ── FRONTIER SYSTEMS INC.
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "clamp(3.2rem,7vw,5.5rem)",
                fontWeight: "bold",
                letterSpacing: "0.06em",
                color: "#00e5ff",
                textShadow:
                  "0 0 20px rgba(0,229,255,0.7), 0 0 60px rgba(0,229,255,0.25)",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              FRONTIER
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "clamp(1rem,2.5vw,1.7rem)",
                fontWeight: "bold",
                letterSpacing: "0.45em",
                color: "rgba(255,255,255,0.8)",
                textTransform: "uppercase",
                marginTop: 4,
                textShadow: "0 0 15px rgba(255,255,255,0.2)",
              }}
            >
              LOST IN SPACE
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "clamp(9px,1.1vw,12px)",
                letterSpacing: "0.3em",
                color: "rgba(180,220,255,0.5)",
                marginTop: 12,
              }}
            >
              Navigate. Mine. Survive.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 280,
              pointerEvents: "auto",
            }}
          >
            {/* DEPLOY */}
            <button
              type="button"
              onClick={handleDeploy}
              data-ocid="menu.deploy_button"
              style={{
                height: 60,
                padding: "0 24px",
                borderRadius: 6,
                border: "2px solid rgba(255,80,40,0.85)",
                background: "rgba(160,30,10,0.5)",
                color: "#ff6644",
                fontFamily: "monospace",
                fontSize: 14,
                fontWeight: "bold",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow:
                  "0 0 20px rgba(255,80,40,0.35), inset 0 0 10px rgba(255,60,20,0.08)",
                textShadow: "0 0 10px rgba(255,100,60,0.8)",
                transition: "all 150ms ease",
                backdropFilter: "blur(8px)",
              }}
            >
              ▶ DEPLOY
            </button>

            {/* STORY MODE */}
            <button
              type="button"
              onClick={() => {
                setShowCinematic(true);
              }}
              data-ocid="menu.story_button"
              style={{
                height: 50,
                padding: "0 24px",
                borderRadius: 6,
                border: "1.5px solid rgba(0,200,255,0.5)",
                background: "rgba(0,10,25,0.4)",
                color: "rgba(0,200,255,0.8)",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: "bold",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(0,200,255,0.1)",
                textShadow: "0 0 8px rgba(0,200,255,0.4)",
                transition: "all 150ms ease",
                backdropFilter: "blur(8px)",
              }}
            >
              ◆ STORY MODE
            </button>

            {/* SETTINGS */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              data-ocid="menu.settings_button"
              style={{
                height: 44,
                padding: "0 24px",
                borderRadius: 6,
                border: "1px solid rgba(0,200,255,0.3)",
                background: "rgba(0,10,25,0.35)",
                color: "rgba(0,200,255,0.6)",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: "bold",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 150ms ease",
                backdropFilter: "blur(8px)",
              }}
            >
              ⚙ SETTINGS
            </button>
          </div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "rgba(0,200,255,0.28)",
              marginTop: 44,
              textTransform: "uppercase",
            }}
          >
            v1.0 — FRONTIER SYSTEMS
          </div>
        </div>

        {showSettings && (
          <SettingsOverlay onClose={() => setShowSettings(false)} />
        )}
      </div>
    </>
  );
}
