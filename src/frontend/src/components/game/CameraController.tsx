import { useFrame, useThree } from '@react-three/fiber'
import { useShipStore } from '../../stores/useShipStore'

export function CameraController() {
  const { camera } = useThree()
  const { theta, phi } = useShipStore()

  useFrame(() => {
    const radius = 3
    const x = radius * Math.cos(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi)
    const z = radius * Math.cos(phi) * Math.sin(theta)

    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  })

  return null
}
