import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useShipStore } from "../../stores/shipStore";

interface MiningLaserProps {
  targetId: string | null;
  targetDistance: number;
}

export default function MiningLaser({
  targetId,
  targetDistance,
}: MiningLaserProps) {
  const laserRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera, clock }) => {
    const isMining = useShipStore.getState().isMining;
    const visible = isMining && targetId !== null;

    if (laserRef.current) {
      laserRef.current.visible = visible;
    }
    if (glowRef.current) {
      glowRef.current.visible = visible;
      if (visible) {
        const pulse = Math.sin(clock.getElapsedTime() * 20) * 0.3 + 0.7;
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
          pulse * 0.4;
      }
    }

    if (visible && laserRef.current) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
        camera.quaternion,
      );
      const laserLength = Math.min(targetDistance, 30);

      laserRef.current.position.copy(camera.position);
      laserRef.current.position.addScaledVector(forward, laserLength / 2);
      laserRef.current.lookAt(
        camera.position.x + forward.x * laserLength,
        camera.position.y + forward.y * laserLength,
        camera.position.z + forward.z * laserLength,
      );
      laserRef.current.scale.set(1, 1, laserLength);
    }
  });

  return (
    <>
      <mesh ref={laserRef} visible={false}>
        <cylinderGeometry args={[0.05, 0.05, 1, 4]} />
        <meshBasicMaterial color="#00E6FF" transparent opacity={0.9} />
      </mesh>
      <mesh ref={glowRef} visible={false}>
        <cylinderGeometry args={[0.15, 0.15, 1, 4]} />
        <meshBasicMaterial color="#00E6FF" transparent opacity={0.3} />
      </mesh>
    </>
  );
}
