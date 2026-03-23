import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { isMobile } from "../../utils/device";

// ─── Distant Ships ──────────────────────────────────────────────────────────────
interface ShipOrbit {
  speed: number;
  radius: number;
  height: number;
  phase: number;
  tilt: number;
}

const SHIP_COUNT = 4;

function DistantShips() {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  const orbits = useMemo<ShipOrbit[]>(
    () =>
      Array.from({ length: SHIP_COUNT }, (_, i) => ({
        speed: 0.04 + Math.random() * 0.06,
        radius: 60 + Math.random() * 60,
        height: (Math.random() - 0.5) * 30,
        phase: (i / SHIP_COUNT) * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.3,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (isMobile) return;
    const t = clock.getElapsedTime();
    orbits.forEach((orbit, i) => {
      const group = groupRefs.current[i];
      if (!group) return;
      const angle = t * orbit.speed + orbit.phase;
      group.position.set(
        Math.cos(angle) * orbit.radius,
        orbit.height + Math.sin(angle * 0.5) * 5,
        Math.sin(angle) * orbit.radius * 0.8,
      );
    });
  });

  if (isMobile) return null;

  return (
    <>
      {orbits.map((orbit, i) => (
        <group
          key={orbit.phase.toFixed(4)}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          position={[orbit.radius, orbit.height, 0]}
        >
          <mesh rotation={[0, orbit.tilt, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.8]} />
            <meshStandardMaterial
              color="#001133"
              emissive="#4488ff"
              emissiveIntensity={2.0}
              transparent
              opacity={0.7}
            />
          </mesh>
          <pointLight color="#4488ff" intensity={0.4} distance={8} />
        </group>
      ))}
    </>
  );
}

// ─── Meteor Streaks ────────────────────────────────────────────────────────────
interface MeteorState {
  active: boolean;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  progress: number;
  speed: number;
  opacity: number;
}

const METEOR_COUNT_MOBILE = 2;
const METEOR_COUNT_DESKTOP = 4;

function MeteorStreaks() {
  const COUNT = isMobile ? METEOR_COUNT_MOBILE : METEOR_COUNT_DESKTOP;
  const timers = useRef<number[]>(
    Array.from({ length: COUNT }, (_, i) => i * 4),
  );
  const meteors = useRef<MeteorState[]>(
    Array.from({ length: COUNT }, () => ({
      active: false,
      startPos: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      progress: 0,
      speed: 3,
      opacity: 0,
    })),
  );
  const INTERVAL = 10;

  const spawnMeteor = (m: MeteorState) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.6 - Math.PI * 0.3;
    const r = 150 + Math.random() * 100;
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 40,
    )
      .normalize()
      .multiplyScalar(15);

    m.startPos.set(
      r * Math.cos(phi) * Math.cos(theta),
      r * Math.sin(phi),
      r * Math.cos(phi) * Math.sin(theta),
    );
    m.endPos.copy(m.startPos).add(dir);
    m.progress = 0;
    m.speed = 4 + Math.random() * 3;
    m.opacity = 0.8;
    m.active = true;
  };

  const linePoints = useRef<[number, number, number][][]>(
    Array.from({ length: COUNT }, () => [
      [0, 0, 0],
      [0, 0, 0],
    ]),
  );
  const opacities = useRef<number[]>(Array(COUNT).fill(0));

  useFrame((_, delta) => {
    meteors.current.forEach((m, i) => {
      timers.current[i] -= delta;
      if (timers.current[i] <= 0 && !m.active) {
        spawnMeteor(m);
        timers.current[i] = INTERVAL + Math.random() * 8;
      }
      if (!m.active) return;

      m.progress += delta * m.speed;
      if (m.progress >= 1) {
        m.active = false;
        m.opacity = 0;
        opacities.current[i] = 0;
        return;
      }

      m.opacity = m.progress > 0.7 ? (1 - m.progress) / 0.3 : 1;
      opacities.current[i] = m.opacity;

      const cur = m.startPos.clone().lerp(m.endPos, m.progress);
      linePoints.current[i] = [
        [cur.x, cur.y, cur.z],
        [
          cur.x + (m.endPos.x - m.startPos.x) * 0.15,
          cur.y + (m.endPos.y - m.startPos.y) * 0.15,
          cur.z + (m.endPos.z - m.startPos.z) * 0.15,
        ],
      ];
    });
  });

  const meteorIds = Array.from(
    { length: COUNT },
    (_, i) => `meteor-id-${i + 1}`,
  );

  return (
    <>
      {meteorIds.map((id, i) => (
        <MeteorLine
          key={id}
          index={i}
          linePoints={linePoints}
          opacities={opacities}
        />
      ))}
    </>
  );
}

function MeteorLine({
  index,
  linePoints,
  opacities,
}: {
  index: number;
  linePoints: React.MutableRefObject<[number, number, number][][]>;
  opacities: React.MutableRefObject<number[]>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const pts = linePoints.current[index];
    const opacity = opacities.current[index];
    if (!groupRef.current) return;
    const child = groupRef.current.children[0] as THREE.Line;
    if (child?.material) {
      (child.material as THREE.LineBasicMaterial).opacity = opacity;
    }
    if (child?.geometry) {
      const posArr = child.geometry.getAttribute("position");
      if (posArr && pts) {
        posArr.setXYZ(0, pts[0][0], pts[0][1], pts[0][2]);
        posArr.setXYZ(1, pts[1][0], pts[1][1], pts[1][2]);
        posArr.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Line
        points={[
          [0, 0, 0],
          [1, 0, 0],
        ]}
        color="#aaddff"
        lineWidth={1.5}
        transparent
        opacity={0}
      />
    </group>
  );
}

// ─── Distant Flashes ──────────────────────────────────────────────────────────
const FLASH_COUNT_MOBILE = 1;
const FLASH_COUNT_DESKTOP = 3;

function DistantFlashes() {
  const COUNT = isMobile ? FLASH_COUNT_MOBILE : FLASH_COUNT_DESKTOP;
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const timers = useRef<number[]>(
    Array.from({ length: COUNT }, (_, i) => i * 6),
  );
  const states = useRef<{ fading: boolean; pos: THREE.Vector3 }[]>(
    Array.from({ length: COUNT }, () => ({
      fading: false,
      pos: new THREE.Vector3(80, 0, 80),
    })),
  );

  useFrame((_, delta) => {
    states.current.forEach((s, i) => {
      const light = lightRefs.current[i];
      if (!light) return;

      timers.current[i] -= delta;

      if (timers.current[i] <= 0 && !s.fading) {
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.8;
        const r = 100 + Math.random() * 100;
        s.pos.set(
          r * Math.cos(phi) * Math.cos(theta),
          r * Math.sin(phi),
          r * Math.cos(phi) * Math.sin(theta),
        );
        light.position.copy(s.pos);
        light.intensity = 2.0;
        s.fading = true;
        timers.current[i] = 15 + Math.random() * 10;
      }

      if (s.fading) {
        light.intensity = Math.max(0, light.intensity - delta * 6);
        if (light.intensity <= 0) s.fading = false;
      }
    });
  });

  const flashIds = Array.from({ length: COUNT }, (_, i) => `flash-id-${i + 1}`);

  return (
    <>
      {flashIds.map((id, i) => (
        <pointLight
          key={id}
          ref={(el) => {
            lightRefs.current[i] = el;
          }}
          color="#88ccff"
          intensity={0}
          distance={80}
          decay={2}
        />
      ))}
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function AmbientUniverse() {
  return (
    <>
      <DistantShips />
      <MeteorStreaks />
      <DistantFlashes />
    </>
  );
}
