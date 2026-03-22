import { useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import { useShipStore } from "../../stores/shipStore";
import type { AsteroidData } from "../../types/game";
import type { ResourceType } from "../../types/game";
import { PHYSICS, RESOURCES } from "../../utils/constants";
import { generateAsteroidField } from "../../utils/generation";

const ASTEROID_COUNT = 80;
const FIELD_RADIUS = 300;

interface AsteroidFieldProps {
  onTargetChange?: (targetId: string | null, distance: number) => void;
}

export default function AsteroidField({ onTargetChange }: AsteroidFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [asteroids, setAsteroids] = useState<AsteroidData[]>(() =>
    generateAsteroidField(ASTEROID_COUNT, FIELD_RADIUS),
  );
  const asteroidCount = asteroids.length;

  const shipStore = useShipStore();
  const inventoryStore = useInventoryStore();
  const gameStore = useGameStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only regenerate when count changes
  const rotations = useMemo(
    () =>
      Array.from(
        { length: asteroidCount },
        () =>
          new THREE.Euler(
            Math.random() * 0.005,
            Math.random() * 0.003,
            Math.random() * 0.004,
          ),
      ),
    [asteroidCount],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => {
    const colors = new Float32Array(ASTEROID_COUNT * 3);
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const shade = 0.3 + Math.random() * 0.2;
      colors[i * 3] = shade * 0.8;
      colors[i * 3 + 1] = shade * 0.7;
      colors[i * 3 + 2] = shade * 0.6;
    }
    return colors;
  }, []);

  const lastNotifTime = useRef(0);

  const startMining = useCallback(
    (asteroid: AsteroidData) => {
      if (shipStore.isMining || asteroid.depleted) return;

      shipStore.setMining(true, asteroid.id);
      gameStore.addNotification(`Mining ${asteroid.id} initiated`, "info");

      const duration = PHYSICS.MINING_DURATION;
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        shipStore.setMiningProgress(progress);

        if (progress >= 1) {
          clearInterval(interval);

          let totalWeight = 0;
          const extracted: string[] = [];
          for (const [resType, amount] of Object.entries(
            asteroid.resources,
          ) as [ResourceType, number][]) {
            if (amount > 0) {
              const weight = RESOURCES[resType].weight * amount;
              if (
                inventoryStore.totalWeight() + totalWeight + weight <=
                useShipStore.getState().maxCargo
              ) {
                inventoryStore.addResource(resType, amount);
                shipStore.addCargo(weight);
                totalWeight += weight;
                extracted.push(`${amount}x ${RESOURCES[resType].name}`);
              }
            }
          }

          if (extracted.length > 0) {
            gameStore.addNotification(
              `Extracted: ${extracted.join(", ")}`,
              "success",
            );
          } else {
            gameStore.addNotification("Cargo full!", "warning");
          }

          setAsteroids((prev) =>
            prev.map((a) =>
              a.id === asteroid.id ? { ...a, depleted: true, health: 0 } : a,
            ),
          );

          shipStore.setMining(false, null);
        }
      }, 50);
    },
    [shipStore, inventoryStore, gameStore],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    const shipPos = useShipStore.getState().position;
    let closestDist = Number.POSITIVE_INFINITY;
    let closestId: string | null = null;

    for (let i = 0; i < asteroids.length; i++) {
      const a = asteroids[i];
      dummy.position.set(...a.position);
      dummy.rotation.x += rotations[i].x;
      dummy.rotation.y += rotations[i].y;
      dummy.rotation.z += rotations[i].z;
      const scale = a.depleted ? 0.01 : a.scale;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const dist = Math.sqrt(
        (shipPos[0] - a.position[0]) ** 2 +
          (shipPos[1] - a.position[1]) ** 2 +
          (shipPos[2] - a.position[2]) ** 2,
      );

      if (
        !a.depleted &&
        dist < closestDist &&
        dist < PHYSICS.MINING_RANGE * 2
      ) {
        closestDist = dist;
        closestId = a.id;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    onTargetChange?.(closestId, closestDist);

    if (
      closestDist < PHYSICS.COLLISION_DISTANCE + 2 &&
      Date.now() - lastNotifTime.current > 1000
    ) {
      useShipStore.getState().takeDamage(PHYSICS.COLLISION_DAMAGE);
      lastNotifTime.current = Date.now();
      useGameStore
        .getState()
        .addNotification("Hull damage from collision!", "danger");
    }
  });

  const handleClick = useCallback(() => {
    const shipPos = useShipStore.getState().position;
    let closestDist = Number.POSITIVE_INFINITY;
    let closestAsteroid: AsteroidData | null = null;

    for (const a of asteroids) {
      if (a.depleted) continue;
      const dist = Math.sqrt(
        (shipPos[0] - a.position[0]) ** 2 +
          (shipPos[1] - a.position[1]) ** 2 +
          (shipPos[2] - a.position[2]) ** 2,
      );
      if (dist < closestDist && dist < PHYSICS.MINING_RANGE) {
        closestDist = dist;
        closestAsteroid = a;
      }
    }

    if (closestAsteroid) {
      startMining(closestAsteroid);
    }
  }, [asteroids, startMining]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 3D canvas element
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, ASTEROID_COUNT]}
      onClick={handleClick}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial vertexColors roughness={0.9} metalness={0.1} />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colorArray, 3]}
      />
    </instancedMesh>
  );
}
