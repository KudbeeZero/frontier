import { Canvas } from "@react-three/fiber";
import { CameraController } from "./components/game/CameraController";
import { EarthGlobe } from "./components/game/EarthGlobe";
import { EnemyLayer } from "./components/game/EnemyLayer";
import { HUD } from "./components/game/HUD";
import { ProjectileSystem } from "./components/game/ProjectileSystem";
import { SpaceBackground } from "./components/game/SpaceBackground";
import { TargetingReticle } from "./components/game/TargetingReticle";

function App() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ fov: 60, near: 0.05, far: 1000, position: [3, 0, 0] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
      >
        {/* Brighter ambient so Earth dayside is well-lit */}
        <ambientLight intensity={0.45} />
        {/* Main sun directional light */}
        <directionalLight
          position={[10, 8, 5]}
          intensity={2.8}
          color="#fff5e0"
          castShadow={false}
        />
        {/* Subtle fill from opposite side */}
        <directionalLight
          position={[-8, -4, -5]}
          intensity={0.25}
          color="#3366aa"
        />

        <SpaceBackground />
        <EarthGlobe />
        <TargetingReticle />
        <EnemyLayer />
        <ProjectileSystem />
        <CameraController />
      </Canvas>

      <HUD />
    </div>
  );
}

export default App;
