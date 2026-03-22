import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color="#2244aa" />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.56, 32, 32]} />
        <meshBasicMaterial
          color="#00aaff"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
