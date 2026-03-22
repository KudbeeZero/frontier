import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WEAPONS } from "../../config/weapons";
import {
  type Projectile,
  useProjectilesStore,
} from "../../stores/useProjectilesStore";

function ProjectileMesh({ projectile }: { projectile: Projectile }) {
  const config = WEAPONS[projectile.weaponType];

  const geometry = () => {
    switch (projectile.weaponType) {
      case "pulse":
        return <sphereGeometry args={[0.025, 8, 8]} />;
      case "railgun":
        return <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />;
      case "missile":
        return <cylinderGeometry args={[0.015, 0.025, 0.1, 6]} />;
      case "emp":
        return <sphereGeometry args={[0.04, 10, 10]} />;
    }
  };

  return (
    <group position={projectile.position}>
      <mesh>
        {geometry()}
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        color={config.color}
        intensity={1.5}
        distance={0.8}
        decay={2}
      />
    </group>
  );
}

export function ProjectileSystem() {
  const projectiles = useProjectilesStore((s) => s.projectiles);

  useFrame((_, delta) => {
    useProjectilesStore.getState().tick(delta);
  });

  return (
    <>
      {projectiles.map((proj) => (
        <ProjectileMesh key={proj.id} projectile={proj} />
      ))}
    </>
  );
}
