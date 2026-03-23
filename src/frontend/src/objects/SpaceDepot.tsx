import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStoryStore } from "../stores/storyStore";

const DEPOT_POSITION: [number, number, number] = [500, 0, 500];
const PROXIMITY_THRESHOLD = 50;

export function SpaceDepot() {
  const { camera } = useThree();

  useFrame(() => {
    const depotVec = new THREE.Vector3(...DEPOT_POSITION);
    const dist = camera.position.distanceTo(depotVec);
    const store = useStoryStore.getState();
    const shouldBeNear = dist < PROXIMITY_THRESHOLD;
    if (store.nearDepot !== shouldBeNear) {
      store.setNearDepot(shouldBeNear);
    }
  });

  return (
    <group position={DEPOT_POSITION}>
      {/* Cyan point light for glow effect */}
      <pointLight color="#00ccff" intensity={2} distance={80} />

      {/* Central hub cylinder */}
      <mesh>
        <cylinderGeometry args={[3, 3, 8, 16]} />
        <meshStandardMaterial
          color="#334455"
          emissive="#001122"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Docking ring torus */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.4, 8, 32]} />
        <meshStandardMaterial
          color="#223344"
          emissive="#002233"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 4 radial arms */}
      {([0, 1, 2, 3] as const).map((i) => {
        const angle = (i * Math.PI) / 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 5, 0, Math.sin(angle) * 5]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[8, 1, 1]} />
            <meshStandardMaterial
              color="#334455"
              emissive="#001122"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* Antenna cylinders */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4, 6]} />
        <meshStandardMaterial
          color="#445566"
          emissive="#001133"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[1.2, 5.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.5, 6]} />
        <meshStandardMaterial
          color="#445566"
          emissive="#001133"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Small cyan status light */}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00aaff"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}
