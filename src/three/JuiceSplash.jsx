import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll } from '../state'
import { seg, smooth, clamp01, easeOutCubic, easeInOutCubic } from './utils'

const ORIGIN = new THREE.Vector3(0, 0.1, 0)
const MOUTH = new THREE.Vector3(0, 0.93, 0)

/**
 * One continuous, scroll-synced juice splash: the droplets burst out of the
 * berry, then spiral down into the bottle mouth and disappear inside it.
 */
export function JuiceSplash({ count = 150 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const geo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff2444',
        emissive: '#b8001d',
        emissiveIntensity: 0.5,
        roughness: 0.16,
        metalness: 0,
      }),
    []
  )

  const items = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const dir = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi) * 0.7 + 0.42,
          Math.sin(phi) * Math.sin(theta)
        ).normalize()
        return {
          dir,
          speed: 0.5 + Math.random() * 1.0,
          delay: Math.random(),
          size: 0.014 + Math.pow(Math.random(), 2.5) * 0.045,
          ph: Math.random() * Math.PI * 2,
          side: Math.random() < 0.5 ? -1 : 1,
          wob: 0.5 + Math.random() * 2,
        }
      }),
    [count]
  )

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return

    const p = scroll.progress
    if (p < 0.44 || p > 0.72) {
      m.visible = false
      return
    }
    m.visible = true

    const time = clock.elapsedTime
    const burst = seg(p, 0.46, 0.58)
    const flow = seg(p, 0.56, 0.68)
    const shrink = 1 - smooth((flow - 0.45) / 0.55)
    const flowK = easeInOutCubic(flow)

    for (let i = 0; i < count; i++) {
      const it = items[i]

      const local = clamp01((burst - it.delay * 0.42) / (1 - it.delay * 0.42))
      const e = easeOutCubic(local)

      const r = e * it.speed * 1.15
      let x = ORIGIN.x + it.dir.x * r
      let y = ORIGIN.y + it.dir.y * r - 0.55 * e * e
      let z = ORIGIN.z + it.dir.z * r

      if (flow > 0) {
        const ang = it.ph + (1 - flowK) * 4.2 * it.side
        const rad = (1 - flowK) * 0.6
        const tx = MOUTH.x + Math.cos(ang) * rad
        const ty = MOUTH.y + (1 - flowK) * 0.35
        const tz = MOUTH.z + Math.sin(ang) * rad
        x += (tx - x) * flowK
        y += (ty - y) * flowK
        z += (tz - z) * flowK
      }

      const wob = Math.sin(time * it.wob * 2 + it.ph) * 0.035 * e
      dummy.position.set(x + wob, y, z)

      const s = it.size * (local > 0 ? 1 : 0) * shrink
      if (s <= 0.002) {
        dummy.scale.setScalar(0.0001)
        dummy.rotation.set(0, 0, 0)
      } else {
        // stretch along the direction of travel for a liquid streak look
        dummy.lookAt(
          ORIGIN.x + it.dir.x * (r + 0.2),
          ORIGIN.y + it.dir.y * (r + 0.2) - 0.3 * e,
          ORIGIN.z + it.dir.z * (r + 0.2)
        )
        dummy.scale.set(s, s, s * (1 + e * 1.5))
      }

      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geo, mat, count]}
      frustumCulled={false}
      visible={false}
      castShadow
    />
  )
}
