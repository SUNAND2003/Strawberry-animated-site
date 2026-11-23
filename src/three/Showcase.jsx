import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Env } from './env'
import { Bottle } from './Bottle'
import { WholeBerry, Slice } from './Strawberry'
import { useInView, dpr } from './hooks'

function ShowcaseLights() {
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#fff3ea" />
      <directionalLight position={[-5, 1.5, -3]} intensity={1.25} color="#ff5a7c" />
      <pointLight position={[-3.5, 2, 3]} intensity={30} color="#ff4f74" distance={20} />
      <pointLight position={[3.5, -1.5, -3]} intensity={22} color="#ffd9c2" distance={20} />
    </>
  )
}

/** Idle floating props that orbit the product. */
function Flair({ variant }) {
  const ref = useRef()

  const items =
    variant === 'product'
      ? [
          { kind: 'slice', pos: [-1.05, 0.8, -0.9], scale: 0.6, rot: [1.1, 0.3, 0.5] },
          { kind: 'slice', pos: [1.1, -0.35, -0.6], scale: 0.48, rot: [0.4, 1.2, -0.6] },
          { kind: 'berry', pos: [1.0, 1.3, -1.5], scale: 0.3, rot: [0.4, 0.6, 0.5] },
          { kind: 'berry', pos: [-1.05, -1.05, -1.4], scale: 0.24, rot: [-0.5, 1.4, 0.3] },
        ]
      : [
          { kind: 'slice', pos: [-2.2, 0.5, -1.2], scale: 0.62, rot: [1.2, 0.4, 0.4] },
          { kind: 'slice', pos: [2.25, -0.7, -1.0], scale: 0.5, rot: [0.5, 1.1, -0.5] },
          { kind: 'berry', pos: [2.1, 0.85, -1.8], scale: 0.34, rot: [0.5, 0.9, 0.4] },
          { kind: 'berry', pos: [-2.3, -0.95, -1.6], scale: 0.26, rot: [-0.4, 1.2, 0.6] },
        ]

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    g.children.forEach((c, i) => {
      const it = items[i]
      c.position.y = it.pos[1] + Math.sin(t * 0.6 + i * 1.7) * 0.14
      c.rotation.y = it.rot[1] + t * (0.25 + (i % 3) * 0.1)
      c.rotation.x = it.rot[0] + Math.sin(t * 0.5 + i) * 0.16
    })
  })

  return (
    <group ref={ref}>
      {items.map((it, i) => (
        <group key={i} position={it.pos} scale={it.scale} rotation={it.rot}>
          {it.kind === 'slice' && <Slice radius={0.62} height={0.16} />}
          {it.kind === 'berry' && <WholeBerry />}
        </group>
      ))}
    </group>
  )
}

function IceCube({ position, scale = 1, speed = 1 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    const t = clock.elapsedTime * speed
    m.position.y = position[1] + Math.sin(t * 0.7) * 0.2
    m.rotation.x = t * 0.35
    m.rotation.y = t * 0.45
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.1} smoothness={4}>
        {/* alpha, not transmission: the showcase canvases are transparent, so a
            transmissive cube samples an empty buffer and renders as a white card */}
        <meshPhysicalMaterial
          color="#b6dbf4"
          roughness={0.08}
          transparent
          opacity={0.76}
          ior={1.31}
          clearcoat={0.6}
          clearcoatRoughness={0.06}
          envMapIntensity={0.7}
        />
      </RoundedBox>
    </group>
  )
}

function IngredientsScene() {
  const ref = useRef()

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    g.children.forEach((c, i) => {
      // IceCubes animate themselves — skip them here
      if (typeof c.userData.y !== 'number') return
      c.position.y = c.userData.y + Math.sin(t * 0.55 + i * 1.4) * 0.18
      c.rotation.y += 0.0035 * (i % 2 === 0 ? 1 : -1)
    })
  })

  const items = [
    { kind: 'slice', pos: [-2.9, 1.1, -1.2], scale: 0.75, rot: [1.15, 0.3, 0.4] },
    { kind: 'slice', pos: [3.0, -0.9, -1.0], scale: 0.6, rot: [0.45, 1.1, -0.55] },
    { kind: 'slice', pos: [2.7, 1.35, -2.0], scale: 0.5, rot: [1.4, 2.1, 0.2] },
    { kind: 'berry', pos: [-3.1, -1.15, -1.6], scale: 0.4, rot: [-0.4, 0.8, 0.5] },
    { kind: 'berry', pos: [2.6, 2.15, -2.7], scale: 0.3, rot: [0.6, 1.5, -0.3] },
  ]

  return (
    <>
      <group ref={ref}>
        {items.map((it, i) => (
          <group
            key={i}
            position={it.pos}
            scale={it.scale}
            rotation={it.rot}
            userData={{ y: it.pos[1] }}
          >
            {it.kind === 'slice' && <Slice radius={0.62} height={0.16} />}
            {it.kind === 'berry' && <WholeBerry />}
          </group>
        ))}
        <IceCube position={[-2.2, 1.75, -2.2]} scale={0.75} speed={1} />
        <IceCube position={[2.35, -1.6, -1.8]} scale={0.6} speed={1.3} />
        <IceCube position={[-3.3, -1.7, -2.6]} scale={0.5} speed={0.8} />
      </group>
    </>
  )
}

function Stage({ children, cameraPos = [0, 0.35, 5.6], fov = 30 }) {
  const [ref, inView] = useInView('400px')

  return (
    <div ref={ref} className="h-full w-full">
      <Canvas
        dpr={dpr}
        frameloop={inView ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, stencil: false, powerPreference: 'high-performance' }}
        camera={{ fov, near: 0.1, far: 60, position: cameraPos }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
        }}
      >
        <Env intensity={1} />
        <ShowcaseLights />
        {children}
      </Canvas>
    </div>
  )
}

export function BottleShowcase({ variant = 'product' }) {
  return (
    <Stage cameraPos={variant === 'cta' ? [0, 0.1, 4.4] : [0, 0.3, 5.6]} fov={30}>
      <Bottle fill={1} cap={1} reveal={1} autoRotate />
      <Flair variant={variant} />
      <ContactShadows
        position={[0, -1.04, 0]}
        opacity={0.55}
        scale={8}
        blur={2.9}
        far={4.5}
        resolution={512}
        color="#2b0009"
      />
    </Stage>
  )
}

export function IngredientsCanvas() {
  return (
    <Stage cameraPos={[0, 0, 7.4]} fov={35}>
      <IngredientsScene />
    </Stage>
  )
}
