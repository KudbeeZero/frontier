import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";
import { useInventoryStore } from "../../stores/inventoryStore";
import type { DerelictShipData } from "../../types/game";

const DERELICT_POSITIONS: [number, number, number][] = [
  [80, 15, -120],
  [-180, -20, 60],
  [130, -40, 200],
  [-90, 30, -200],
  [220, 10, -60],
];

const initialShips: DerelictShipData[] = DERELICT_POSITIONS.map((pos, i) => ({
  id: `derelict-${i}`,
  position: pos,
  rotation: [
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  ] as [number, number, number],
  salvaged: false,
}));

export default function DerelictShips() {
  const [ships, setShips] = useState<DerelictShipData[]>(initialShips);
  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    groupRefs.current.forEach((group, i) => {
      if (group && !ships[i]?.salvaged) {
        group.rotation.x += delta * 0.05;
        group.rotation.y += delta * 0.03;
      }
    });
  });

  const handleSalvage = (index: number) => {
    if (ships[index].salvaged) return;
    const resources: Array<["iron" | "silicon" | "carbon", number]> = [
      ["iron", Math.floor(Math.random() * 10) + 5],
      ["silicon", Math.floor(Math.random() * 8) + 3],
      ["carbon", Math.floor(Math.random() * 6) + 2],
    ];
    const inv = useInventoryStore.getState();
    for (const [type, amount] of resources) {
      inv.addResource(type, amount);
    }
    useGameStore
      .getState()
      .addNotification(
        "Salvage complete! Found iron, silicon, carbon.",
        "success",
      );
    setShips((prev) =>
      prev.map((s, i) => (i === index ? { ...s, salvaged: true } : s)),
    );
  };

  return (
    <>
      {ships.map((ship, i) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: 3D canvas element
        <group
          key={ship.id}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          position={ship.position}
          rotation={ship.rotation}
          onClick={() => handleSalvage(i)}
        >
          <mesh>
            <capsuleGeometry args={[0.8, 5, 4, 8]} />
            <meshStandardMaterial
              color={ship.salvaged ? "#1a1a1a" : "#2a3a2a"}
              metalness={0.7}
              roughness={0.6}
              emissive={
                ship.salvaged
                  ? new THREE.Color(0, 0, 0)
                  : new THREE.Color(0.1, 0.05, 0)
              }
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[3, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[3, 0.15, 1.5]} />
            <meshStandardMaterial
              color="#1a2a1a"
              metalness={0.8}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[-3, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[3, 0.15, 1.5]} />
            <meshStandardMaterial
              color="#1a2a1a"
              metalness={0.8}
              roughness={0.5}
            />
          </mesh>
          {!ship.salvaged && (
            <pointLight color="#FF6B00" intensity={1.5} distance={15} />
          )}
        </group>
      ))}
    </>
  );
}
