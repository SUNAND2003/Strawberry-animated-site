import { useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll, pointer } from '../state'
import { track, seg } from './utils'
import { Env } from './env'
import { isMobile, dpr } from './hooks'
import { BerrySystem } from './Strawberry'
import { JuiceSplash } from './JuiceSplash'
import { Bottle } from './Bottle'

gsap.registerPlugin(ScrollTrigger)

/** Cinematic camera dolly, steered entirely by scroll progress. */
function Rig() {
  const camera = useThree((s) => s.camera)
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const p = scroll.progress
    const t = clock.elapsedTime

    const z = track(p, [
      [0, 7.2],
      [0.1, 6.6],
      [0.24, 5.8],
      [0.44, 6.9],
      [0.56, 7.9],
      [0.7, 8.5],
      [0.86, 7.8],
      [1, 7.2],
    ])
    const y = track(p, [
      [0, 0.22],
      [0.24, 0.12],
      [0.44, 0.2],
      [0.62, 0.38],
      [0.85, 0.22],
      [1, 0.38],
    ])
    const x = track(p, [
      [0, 0],
      [0.24, 0],
      [0.4, 0.9],
      [0.54, -0.8],
      [0.7, 0],
      [1, 0],
    ])
    const ly = track(p, [
      [0, 0.05],
      [0.24, 0.05],
      [0.62, 0.12],
      [0.85, 0.05],
      [1, 0.42],
    ])

    const idle = seg(p, 0.02, 0.18)
    camera.position.set(
      x + pointer.x * 0.3 * idle,
      y + pointer.y * 0.18 * idle + Math.sin(t * 0.35) * 0.03,
      z
    )
    look.set(0, ly, 0)
    camera.lookAt(look)
  })

  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4.5, 6.5, 4]}
        intensity={2.2}
        color="#fff5ed"
      />
      <directionalLight position={[-4.5, 2.5, -3]} intensity={1.2} color="#ff6584" />
      <pointLight position={[-3.5, 2, 3]} intensity={22} color="#ff3b5c" distance={22} />
      <pointLight position={[3.5, -2, 3]} intensity={16} color="#ffd7c2" distance={20} />
    </>
  )
}

export default function Scene() {
  const [active, setActive] = useState(true)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '.experience',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => setActive(self.isActive),
    })
    setActive(st.isActive)
    return () => st.kill()
  }, [])

  return (
    <div className={`webgl${active ? ' is-active' : ''}`} aria-hidden="true">
      <Canvas
        dpr={dpr}
        frameloop={active ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          powerPreference: 'high-performance',
          localClippingEnabled: true,
        }}
        camera={{ fov: 32, near: 0.1, far: 60, position: [0, 0.5, 7.5] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.0
          gl.localClippingEnabled = true
        }}
      >
        <Env intensity={1} />
        <Lights />
        <Rig />
        <BerrySystem />
        <JuiceSplash count={isMobile ? 90 : 160} />
        <Bottle scrollDriven />
      </Canvas>
    </div>
  )
}
