import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import CraftingPanel from "../Crafting/CraftingPanel";
import AsteroidField from "../Environment/AsteroidField";
import DerelictShips from "../Environment/DerelictShips";
import SpaceStation from "../Environment/SpaceStation";
import StarField from "../Environment/StarField";
import InventoryPanel from "../Inventory/InventoryPanel";
import MiningLaser from "../Ship/MiningLaser";
import ShipController from "../Ship/ShipController";
import HUD from "../UI/HUD";
import { EarthGlobe } from "../game/EarthGlobe";

export default function GameCanvas() {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetDistance, setTargetDistance] = useState(
    Number.POSITIVE_INFINITY,
  );
  const { showInventory, showCrafting, setNearestTargetDistance } =
    useGameStore();

  const handleTargetChange = useCallback(
    (id: string | null, dist: number) => {
      setTargetId(id);
      setTargetDistance(dist);
      setNearestTargetDistance(dist);
    },
    [setNearestTargetDistance],
  );

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 0] }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#081626" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.08} />
        <directionalLight
          position={[100, 100, 50]}
          intensity={1.2}
          color="#fff8e7"
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={0.5}
          color="#00E6FF"
          distance={50}
        />

        {/* Scene */}
        <StarField />
        <AsteroidField onTargetChange={handleTargetChange} />
        <SpaceStation />
        <DerelictShips />
        <MiningLaser targetId={targetId} targetDistance={targetDistance} />

        {/* Earth Globe - positioned ahead of player start */}
        <group position={[0, 0, -8]}>
          <EarthGlobe />
        </group>

        {/* Player controller */}
        <ShipController />
      </Canvas>

      {/* HUD Overlay */}
      <HUD targetId={targetId} targetDistance={targetDistance} />

      {/* Panels */}
      {showInventory && <InventoryPanel />}
      {showCrafting && <CraftingPanel />}
    </div>
  );
}
