import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useShipStore } from "../../stores/shipStore";
import type { Vector3Tuple } from "../../types/game";
import { PHYSICS } from "../../utils/constants";
import { applyDrag, applyThrust, clampVelocity } from "../../utils/physics";
import { touchCameraMovement } from "../../utils/touchCamera";

export default function ShipController() {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const mouseMovement = useRef({ x: 0, y: 0 });
  const yaw = useRef(0);
  const pitch = useRef(0);
  const roll = useRef(0);
  const isPointerLocked = useRef(false);
  const velocityRef = useRef<Vector3Tuple>([0, 0, 0]);
  const positionRef = useRef<Vector3Tuple>([0, 0, 0]);
  const hudUpdateTimer = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      if (e.code === "Tab") {
        e.preventDefault();
        useGameStore.getState().toggleHUD();
      }
      if (e.code === "KeyI") useGameStore.getState().toggleInventory();
      if (e.code === "KeyC") useGameStore.getState().toggleCrafting();
      if (e.code === "Escape") {
        if (isPointerLocked.current) {
          document.exitPointerLock();
        } else {
          useGameStore.getState().togglePauseMenu();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      mouseMovement.current.x += e.movementX;
      mouseMovement.current.y += e.movementY;
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const handleClick = () => {
      const gameStore = useGameStore.getState();
      if (
        gameStore.showInventory ||
        gameStore.showCrafting ||
        gameStore.showPauseMenu
      )
        return;
      if (!isPointerLocked.current) {
        gl.domElement.requestPointerLock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange,
      );
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const gameState = useGameStore.getState();
    if (gameState.isPaused || gameState.showInventory || gameState.showCrafting)
      return;

    const dt = Math.min(delta, 0.05);
    const shipState = useShipStore.getState();
    const settings = useSettingsStore.getState();

    const mouseSensitivity = 0.002;
    const touchSensitivity = 0.0015 * settings.cameraSensitivity;

    yaw.current -= mouseMovement.current.x * mouseSensitivity;
    pitch.current -= mouseMovement.current.y * mouseSensitivity;

    // Apply touch camera input
    yaw.current -= touchCameraMovement.x * touchSensitivity;
    pitch.current -= touchCameraMovement.y * touchSensitivity;
    touchCameraMovement.x = 0;
    touchCameraMovement.y = 0;

    pitch.current = Math.max(
      -Math.PI / 2.5,
      Math.min(Math.PI / 2.5, pitch.current),
    );
    mouseMovement.current = { x: 0, y: 0 };

    if (keys.current.has("KeyQ")) roll.current += PHYSICS.ROTATION_SPEED * dt;
    if (keys.current.has("KeyE")) roll.current -= PHYSICS.ROTATION_SPEED * dt;

    const quaternion = new THREE.Quaternion();
    const yawQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw.current,
    );
    const pitchQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      pitch.current,
    );
    const rollQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      roll.current,
    );
    quaternion.multiplyQuaternions(yawQ, pitchQ).multiply(rollQ);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion);

    const hasFuel = shipState.fuel > 0;
    let thrust: Vector3Tuple = [0, 0, 0];
    const isBoosting = keys.current.has("Space") && hasFuel;
    const acc = isBoosting
      ? PHYSICS.ACCELERATION * PHYSICS.BOOST_MULTIPLIER
      : PHYSICS.ACCELERATION;

    if (keys.current.has("KeyW") && hasFuel) {
      thrust = applyThrust(thrust, [forward.x, forward.y, forward.z], acc, dt);
    }
    if (keys.current.has("KeyS") && hasFuel) {
      thrust = applyThrust(
        thrust,
        [-forward.x, -forward.y, -forward.z],
        acc * 0.6,
        dt,
      );
    }
    if (keys.current.has("KeyA") && hasFuel) {
      thrust = applyThrust(
        thrust,
        [-right.x, -right.y, -right.z],
        acc * 0.5,
        dt,
      );
    }
    if (keys.current.has("KeyD") && hasFuel) {
      thrust = applyThrust(thrust, [right.x, right.y, right.z], acc * 0.5, dt);
    }

    const isThrusting = thrust[0] !== 0 || thrust[1] !== 0 || thrust[2] !== 0;

    if (isThrusting && hasFuel) {
      const fuelRate = isBoosting
        ? PHYSICS.BOOST_FUEL_RATE
        : PHYSICS.FUEL_CONSUMPTION_RATE;
      useShipStore.getState().consumeFuel(fuelRate * dt * 60);
    }

    const drag =
      keys.current.has("ShiftLeft") || keys.current.has("ShiftRight")
        ? PHYSICS.BRAKE_FORCE
        : PHYSICS.DRAG;

    let vel = velocityRef.current;
    vel = [vel[0] + thrust[0], vel[1] + thrust[1], vel[2] + thrust[2]];
    vel = applyDrag(vel, drag);
    const maxSpeed = isBoosting
      ? PHYSICS.MAX_SPEED * PHYSICS.BOOST_MULTIPLIER
      : PHYSICS.MAX_SPEED;
    vel = clampVelocity(vel, maxSpeed);
    velocityRef.current = vel;

    const pos = positionRef.current;
    const newPos: Vector3Tuple = [
      pos[0] + vel[0] * dt,
      pos[1] + vel[1] * dt,
      pos[2] + vel[2] * dt,
    ];
    positionRef.current = newPos;

    camera.position.set(...newPos);
    camera.quaternion.copy(quaternion);

    hudUpdateTimer.current += dt;
    if (hudUpdateTimer.current >= 0.1) {
      hudUpdateTimer.current = 0;
      useShipStore.getState().setPosition(newPos);
      useShipStore.getState().setVelocity(vel);
    }
  });

  return null;
}
