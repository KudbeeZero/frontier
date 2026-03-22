import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWeaponsStore } from '../../stores/useWeaponsStore'

interface Projectile {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
}

export function WeaponSystem() {
  const projectilesRef = useRef<Projectile[]>([])
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const { activeWeapon } = useWeaponsStore()

  useFrame((_, delta) => {
    // Update projectile positions
    projectilesRef.current = projectilesRef.current.filter((p) => {
      p.position.addScaledVector(p.velocity, delta)
      p.life -= delta

      const mesh = meshesRef.current.get(p.id)
      if (mesh) {
        mesh.position.copy(p.position)
      }

      return p.life > 0
    })
  })

  // Weapon system renders projectiles imperatively
  return null
}
