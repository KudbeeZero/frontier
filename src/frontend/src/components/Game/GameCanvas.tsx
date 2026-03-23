import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SpaceDepot } from "../../objects/SpaceDepot";
import { useCameraStore } from "../../stores/cameraStore";
import { useGameStore } from "../../stores/gameStore";
import { useLaneStore } from "../../stores/laneStore";
import { useExplosionStore } from "../../stores/useExplosionStore";
import { useProjectileStore } from "../../stores/useProjectileStore";
import type { ProjectileData } from "../../stores/useProjectileStore";
import { useWeaponsStore } from "../../stores/useWeaponsStore";
import { CombatTargetingSystem } from "../Combat/CombatTargetingSystem";
import { EnemyLabels } from "../Combat/EnemyLabels";
import { EnemyLayer } from "../Combat/EnemyLayer";
import { Explosion } from "../Combat/Explosion";
import { Projectile } from "../Combat/Projectile";
import CraftingPanel from "../Crafting/CraftingPanel";
import { AmbientUniverse } from "../Environment/AmbientUniverse";
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
          targetId={proj.targetId}
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
  keysDown: React.MutableRefObject<Set<string>>;
}

// Camera sits this many units above the lane plane in orbital mode
const ORBITAL_HEIGHT = 0.6;
// How far behind the ship the camera sits in combat mode (in orbit-angle radians)
const COMBAT_BEHIND_ANGLE = 0.18;
// Camera rides slightly outside the lane ring
const ORBITAL_PULL_BACK = 0.5;
const COCKPIT_Z = 2.0;
const COCKPIT_Y = 0.22;
const FREE_ROAM_SPEED = 1.5;
// Combat camera height above the lane plane
const COMBAT_HEIGHT = 0.28;

function CameraOrbitController({
  thetaRef,
  phiRef,
  isDragging,
  keysDown,
}: CameraOrbitControllerProps) {
  const { camera } = useThree();
  const currentPosRef = useRef({ x: 0, y: 0.22, z: 2.0 });

  useFrame((_, delta) => {
    const state = useCameraStore.getState();
    const cameraMode = state.mode;

    // ── COMBAT: rail-shooter ───────────────────────────────────────────────
    if (cameraMode === "combat") {
      const laneRadius = useLaneStore.getState().getCurrentRadius();

      thetaRef.current += delta * 0.04;
      const theta = thetaRef.current;

      const camAngle = theta - COMBAT_BEHIND_ANGLE;
      const camRadius = laneRadius + ORBITAL_PULL_BACK;

      const targetX = Math.sin(camAngle) * camRadius;
      const targetY = COMBAT_HEIGHT;
      const targetZ = Math.cos(camAngle) * camRadius;

      const lerpSpeed = 5.0 * delta;
      currentPosRef.current.x +=
        (targetX - currentPosRef.current.x) * lerpSpeed;
      currentPosRef.current.y +=
        (targetY - currentPosRef.current.y) * lerpSpeed;
      currentPosRef.current.z +=
        (targetZ - currentPosRef.current.z) * lerpSpeed;

      camera.position.set(
        currentPosRef.current.x,
        currentPosRef.current.y,
        currentPosRef.current.z,
      );

      const aimPitch = state.aimPitch;
      const aimYaw = state.aimYaw;

      const toEarth = new THREE.Vector3(
        -currentPosRef.current.x,
        -currentPosRef.current.y,
        -currentPosRef.current.z,
      ).normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(toEarth, up).normalize();

      const lookTarget = new THREE.Vector3(
        0 + right.x * Math.tan(aimYaw) * 1.5,
        Math.tan(aimPitch) * 1.5,
        0 + right.z * Math.tan(aimYaw) * 1.5,
      );
      camera.lookAt(lookTarget);
      return;
    }

    // ── FREE ROAM ─────────────────────────────────────────────────────────
    if (cameraMode === "freeRoam") {
      const yaw = state.freeRoamYaw;
      const pitch = state.freeRoamPitch;
      const pos = { ...state.freeRoamPos };

      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      const speed = FREE_ROAM_SPEED * delta;

      if (keysDown.current.has("KeyW")) {
        pos.x += forward.x * speed;
        pos.z += forward.z * speed;
      }
      if (keysDown.current.has("KeyS")) {
        pos.x -= forward.x * speed;
        pos.z -= forward.z * speed;
      }
      if (keysDown.current.has("KeyA")) {
        pos.x -= right.x * speed;
        pos.z -= right.z * speed;
      }
      if (keysDown.current.has("KeyD")) {
        pos.x += right.x * speed;
        pos.z += right.z * speed;
      }

      useCameraStore.getState().setFreeRoamPos(pos);
      camera.position.set(pos.x, pos.y, pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
      return;
    }

    // ── ORBITAL: lane-locked ring ──────────────────────────────────────────
    const laneRadius = useLaneStore.getState().getCurrentRadius();
    const RADIUS = laneRadius + ORBITAL_PULL_BACK;

    if (!isDragging.current) {
      thetaRef.current += delta * 0.025;
    }
    const theta = thetaRef.current;
    const phi = Math.max(-0.2, Math.min(0.6, phiRef.current));

    const targetX = RADIUS * Math.cos(phi) * Math.cos(theta);
    const targetY = RADIUS * Math.sin(phi) + ORBITAL_HEIGHT;
    const targetZ = RADIUS * Math.cos(phi) * Math.sin(theta);

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

  useFrame((_, delta) => {
    const cameraMode = useCameraStore.getState().mode;
    if (
      cameraMode !== "orbital" &&
      cameraMode !== "combat" &&
      cameraMode !== "freeRoam"
    ) {
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
    }
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

  const thetaRef = useRef(0);
  const phiRef = useRef(0.35);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const keysDown = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keysDown.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keysDown.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const mode = useCameraStore.getState().mode;
      if (mode !== "combat") return;
      const { aimPitch, aimYaw, setAimPitch, setAimYaw } =
        useCameraStore.getState();
      const sensitivity = 0.0015;
      setAimYaw(aimYaw + e.movementX * sensitivity);
      setAimPitch(aimPitch - e.movementY * sensitivity);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const mode = useCameraStore.getState().mode;
      if (mode !== "freeRoam") return;
      const { freeRoamYaw, freeRoamPitch, setFreeRoamYaw, setFreeRoamPitch } =
        useCameraStore.getState();
      const sensitivity = 0.0015;
      setFreeRoamYaw(freeRoamYaw + e.movementX * sensitivity);
      setFreeRoamPitch(freeRoamPitch - e.movementY * sensitivity);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const handleTargetChange = useCallback(
    (id: string | null, dist: number) => {
      setTargetId(id);
      setTargetDistance(dist);
      setNearestTargetDistance(dist);
    },
    [setNearestTargetDistance],
  );

  const mode = useCameraStore((s) => s.mode);
  const isCombatOrFreeRoam = mode === "combat" || mode === "freeRoam";

  return (
    <div
      className="w-full h-full relative"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        if (mode !== "orbital") return;
        isDragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!isDragging.current || isCombatOrFreeRoam) return;
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
        camera={{ fov: 55, near: 0.05, far: 2000, position: [0, 0.5, 5.0] }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#050d1a" }}
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

        <CameraOrbitController
          thetaRef={thetaRef}
          phiRef={phiRef}
          isDragging={isDragging}
          keysDown={keysDown}
        />

        <CombatTargetingSystem />

        <StarField />
        <AmbientUniverse />

        <group position={[0, 0, 0]}>
          <EarthGlobe />
        </group>

        <AsteroidField onTargetChange={handleTargetChange} />
        <SpaceStation />
        <DerelictShips />
        <SpaceDepot />
        <MiningLaser targetId={targetId} targetDistance={targetDistance} />

        <EnemyLayer />
        <EnemyLabels />
        <ProjectileLayer />
        <ExplosionLayer />

        <ShipController />
      </Canvas>

      <HUD targetId={targetId} targetDistance={targetDistance} />

      {showInventory && <InventoryPanel />}
      {showCrafting && <CraftingPanel />}
    </div>
  );
}
