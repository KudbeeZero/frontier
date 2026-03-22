import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import { useCameraStore } from "../../stores/cameraStore";
import { useGameStore } from "../../stores/gameStore";
import { useLaneStore } from "../../stores/laneStore";
import { useExplosionStore } from "../../stores/useExplosionStore";
import { useProjectileStore } from "../../stores/useProjectileStore";
import type { ProjectileData } from "../../stores/useProjectileStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { EnemyLayer } from "../Combat/EnemyLayer";
import { Explosion } from "../Combat/Explosion";
import { Projectile } from "../Combat/Projectile";
import CraftingPanel from "../Crafting/CraftingPanel";
import AsteroidField from "../Environment/AsteroidField";
import DerelictShips from "../Environment/DerelictShips";
import { EarthGlobe } from "../Environment/EarthGlobe";
import SpaceStation from "../Environment/SpaceStation";
import StarField from "../Environment/StarField";
import InventoryPanel from "../Inventory/InventoryPanel";
import MiningLaser from "../Ship/MiningLaser";
import ShipController from "../Ship/ShipController";
import HUD from "../UI/HUD";

function ProjectileLayer() {
  const { projectiles, removeProjectile } = useProjectileStore();

  useFrame((_, delta) => {
    useWeaponsStore.getState().tickCooldowns(delta);
  });

  return (
    <>
      {projectiles.map((proj: ProjectileData) => (
        <Projectile
          key={proj.id}
          {...proj}
          onExpire={removeProjectile}
          onHit={removeProjectile}
        />
      ))}
    </>
  );
}

function ExplosionLayer() {
  const { explosions, removeExplosion } = useExplosionStore();

  return (
    <>
      {explosions.map((exp) => (
        <Explosion
          key={exp.id}
          position={exp.position}
          onComplete={() => removeExplosion(exp.id)}
        />
      ))}
    </>
  );
}

interface CameraOrbitControllerProps {
  thetaRef: React.MutableRefObject<number>;
  phiRef: React.MutableRefObject<number>;
  isDragging: React.MutableRefObject<boolean>;
}

/**
 * Camera distances (Earth radius = 1.4 units in world space):
 *   Orbital  — far back, clear planet view   (~5x Earth radius away)
 *   Cockpit  — close, immersive, near-surface (~1.5x Earth radius)
 */
const ORBITAL_RADIUS_OFFSET = 2.2; // added on top of lane radius (~2.8 max) → total ~5
const ORBITAL_HEIGHT_PHI = 0.35; // ~20° elevation angle
const COCKPIT_Z = 2.0; // units in front of origin (Earth is at 0)
const COCKPIT_Y = 0.22; // slight elevation above equator

function CameraOrbitController({
  thetaRef,
  phiRef,
  isDragging,
}: CameraOrbitControllerProps) {
  const { camera } = useThree();
  // Smooth interpolation refs
  const currentPosRef = useRef({ x: 0, y: 0.22, z: 2.0 });

  useFrame((_, delta) => {
    const cameraMode = useCameraStore.getState().mode;

    if (cameraMode === "cockpit") {
      // Smoothly lerp to cockpit position
      const lerpSpeed = 3.5 * delta;
      currentPosRef.current.x += (0 - currentPosRef.current.x) * lerpSpeed;
      currentPosRef.current.y +=
        (COCKPIT_Y - currentPosRef.current.y) * lerpSpeed;
      currentPosRef.current.z +=
        (COCKPIT_Z - currentPosRef.current.z) * lerpSpeed;

      camera.position.set(
        currentPosRef.current.x,
        currentPosRef.current.y,
        currentPosRef.current.z,
      );
      camera.lookAt(0, 0, 0);
      return;
    }

    // Orbital mode — far orbit using lane radius + generous offset
    const laneRadius = useLaneStore.getState().getCurrentRadius();
    const RADIUS = laneRadius + ORBITAL_RADIUS_OFFSET;

    // Auto-rotate when not dragging
    if (!isDragging.current) {
      thetaRef.current += delta * 0.03;
    }
    const theta = thetaRef.current;
    // Clamp phi but default to a nicer elevated view
    const phi = Math.max(-0.3, Math.min(0.8, phiRef.current));
    const targetX = RADIUS * Math.cos(phi) * Math.cos(theta);
    const targetY = RADIUS * Math.sin(phi) + ORBITAL_HEIGHT_PHI;
    const targetZ = RADIUS * Math.cos(phi) * Math.sin(theta);

    // Smoothly lerp toward orbital position
    const lerpSpeed = 3.0 * delta;
    currentPosRef.current.x += (targetX - currentPosRef.current.x) * lerpSpeed;
    currentPosRef.current.y += (targetY - currentPosRef.current.y) * lerpSpeed;
    currentPosRef.current.z += (targetZ - currentPosRef.current.z) * lerpSpeed;

    camera.position.set(
      currentPosRef.current.x,
      currentPosRef.current.y,
      currentPosRef.current.z,
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function GameCanvas() {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetDistance, setTargetDistance] = useState(
    Number.POSITIVE_INFINITY,
  );
  const { showInventory, showCrafting, setNearestTargetDistance } =
    useGameStore();

  // Spherical camera orbit state
  const thetaRef = useRef(0);
  const phiRef = useRef(0.35); // start at elevated orbital angle
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handleTargetChange = useCallback(
    (id: string | null, dist: number) => {
      setTargetId(id);
      setTargetDistance(dist);
      setNearestTargetDistance(dist);
    },
    [setNearestTargetDistance],
  );

  return (
    <div
      className="w-full h-full relative"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        isDragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;
        thetaRef.current -= dx * 0.005;
        phiRef.current -= dy * 0.005;
        lastPointer.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => {
        isDragging.current = false;
      }}
      onPointerLeave={() => {
        isDragging.current = false;
      }}
    >
      <Canvas
        camera={{ fov: 55, near: 0.05, far: 1000, position: [0, 0.5, 5.0] }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#081626" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[100, 100, 50]}
          intensity={3.5}
          color="#ffffff"
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={1.2}
          color="#4488ff"
          distance={200}
        />
        <pointLight
          position={[0, 80, 0]}
          intensity={0.6}
          color="#ffffff"
          distance={300}
        />

        {/* Camera controller with smooth orbital/cockpit transitions */}
        <CameraOrbitController
          thetaRef={thetaRef}
          phiRef={phiRef}
          isDragging={isDragging}
        />

        {/* Scene */}
        <StarField />

        {/* Earth Globe — centered at world origin */}
        <group position={[0, 0, 0]}>
          <EarthGlobe />
        </group>

        <AsteroidField onTargetChange={handleTargetChange} />
        <SpaceStation />
        <DerelictShips />
        <MiningLaser targetId={targetId} targetDistance={targetDistance} />

        {/* Combat */}
        <EnemyLayer />
        <ProjectileLayer />
        <ExplosionLayer />

        {/* Player */}
        <ShipController />
      </Canvas>

      <HUD targetId={targetId} targetDistance={targetDistance} />

      {showInventory && <InventoryPanel />}
      {showCrafting && <CraftingPanel />}
    </div>
  );
}
