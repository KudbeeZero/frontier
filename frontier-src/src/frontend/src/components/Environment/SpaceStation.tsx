import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { STATION_POSITIONS } from "../../utils/constants";

export default function SpaceStation() {
  const panelRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    panelRefs.current.forEach((panel, i) => {
      if (panel) {
        panel.rotation.y = t * 0.3 * (i % 2 === 0 ? 1 : -1);
      }
    });
  });

  return (
    <>
      {STATION_POSITIONS.map((pos) => (
        <group key={`station-${pos[0]}-${pos[2]}`} position={pos}>
          <mesh>
            <cylinderGeometry args={[4, 4, 8, 8]} />
            <meshStandardMaterial
              color="#2a3f55"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[8, 1.2, 8, 16]} />
            <meshStandardMaterial
              color="#1a2f45"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) panelRefs.current.push(el);
            }}
            position={[12, 0, 0]}
          >
            <boxGeometry args={[8, 0.2, 4]} />
            <meshStandardMaterial
              color="#0a1f35"
              emissive={new THREE.Color(0, 0.1, 0.3)}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) panelRefs.current.push(el);
            }}
            position={[-12, 0, 0]}
          >
            <boxGeometry args={[8, 0.2, 4]} />
            <meshStandardMaterial
              color="#0a1f35"
              emissive={new THREE.Color(0, 0.1, 0.3)}
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight
            color="#00E6FF"
            intensity={3}
            distance={30}
            position={[0, 5, 0]}
          />
          <pointLight
            color="#FFB700"
            intensity={2}
            distance={20}
            position={[0, -5, 0]}
          />
          <mesh position={[0, 4.2, 0]}>
            <cylinderGeometry args={[4.2, 4.2, 0.3, 8]} />
            <meshStandardMaterial
              color="#00E6FF"
              emissive={new THREE.Color(0, 0.9, 1)}
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
