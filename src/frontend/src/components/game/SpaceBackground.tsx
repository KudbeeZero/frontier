import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function SpaceBackground() {
  const starsRef = useRef<THREE.Points>(null)

  const starGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const starCount = 2000
    const positions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [])

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001
    }
  })

  return (
    <points ref={starsRef} geometry={starGeometry}>
      <pointsMaterial size={0.1} color="#ffffff" />
    </points>
  )
}
