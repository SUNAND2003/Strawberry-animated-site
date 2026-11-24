import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll } from '../state'
import { track, seg, smooth, easeOutBack, clamp01 } from './utils'
import { labelTexture } from './textures'
import { isMobile } from './hooks'

const SEGMENTS = 56
export const LIQUID_TOP = 1.95
const CAP_SEALED_Y = 2.40
const CAP_OPEN_Y = 4.60
const BUBBLES = 36
const SPLASH_COUNT = 18

/** Lathe profile of the artisan luxury juice bottle, from base (y=0) to crown lip (y≈2.41). */
export function bottleProfile() {
  const p = []
  const add = (x, y) => p.push(new THREE.Vector2(x, y))

  // 1. Heavy indented base punt (solid glass bottom)
  add(0.001, 0.0)
  add(0.08, 0.02)
  add(0.20, 0.01)
  add(0.33, 0.004)
  add(0.365, 0.016)
  add(0.38, 0.045)

  // 2. Tall cylindrical body
  add(0.38, 0.12)
  add(0.38, 0.40)
  add(0.38, 0.80)
  add(0.38, 1.15)
  add(0.38, 1.22)

  // 3. Graceful sloping artisan shoulder (conical-swept curve)
  for (let i = 1; i <= 16; i++) {
    const k = i / 16
    const y = 1.22 + k * 0.46
    const ease = 0.5 - 0.5 * Math.cos(k * Math.PI)
    const r = 0.38 - (0.38 - 0.125) * ease
    add(r, y)
  }

  // 4. Slender elegant neck
  add(0.125, 1.75)
  add(0.125, 1.92)
  add(0.125, 2.12)
  add(0.128, 2.22)

  // 5. Crown finish collar & lip
  add(0.145, 2.26)
  add(0.150, 2.30)
  add(0.138, 2.33)
  add(0.155, 2.36)
  add(0.155, 2.40)
  add(0.130, 2.41)
  add(0.001, 2.41)
  return p
}

export function getLiquidRadius(y) {
  if (y <= 0.08) return 0.001
  if (y <= 0.14) {
    const k = (y - 0.08) / 0.06
    return Math.max(0.01, 0.355 * Math.sqrt(k))
  }
  if (y <= 1.22) return 0.355
  if (y <= 1.68) {
    const k = (y - 1.22) / 0.46
    const ease = 0.5 - 0.5 * Math.cos(k * Math.PI)
    return Math.max(0.105, 0.355 - (0.355 - 0.105) * ease)
  }
  return 0.105
}

function liquidProfile() {
  const pts = []
  pts.push(new THREE.Vector2(0.001, 0.08))
  const N = 56
  for (let i = 0; i <= N; i++) {
    const y = 0.08 + (i / N) * (LIQUID_TOP - 0.08)
    pts.push(new THREE.Vector2(getLiquidRadius(y), y))
  }
  pts.push(new THREE.Vector2(0.001, LIQUID_TOP))
  return pts
}

export function Bottle({
  scrollDriven = false,
  fill = 1,
  cap = 1,
  reveal = 1,
  autoRotate = false,
}) {
  const root = useRef()
  const capRef = useRef()
  const liquidRef = useRef()
  const discRef = useRef()
  const frothRef = useRef()
  const streamRef = useRef()
  const splashRef = useRef()
  const bubbleRef = useRef()

  // High-precision GPU clipping plane for silky-smooth continuous liquid fill
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), [])

  const glassGeo = useMemo(() => new THREE.LatheGeometry(bottleProfile(), SEGMENTS), [])
  const liquidPts = useMemo(liquidProfile, [])
  const liquidGeo = useMemo(() => new THREE.LatheGeometry(liquidPts, SEGMENTS), [liquidPts])
  const discGeo = useMemo(() => new THREE.CircleGeometry(1, 48), [])
  const frothGeo = useMemo(() => new THREE.RingGeometry(0.02, 0.14, 36), [])
  const bubGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])
  const splashGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])
  const streamGeo = useMemo(() => new THREE.CylinderGeometry(0.038, 0.055, 1, 24, 16), [])

  // Fluted crimped crown cap geometry with 21 flutes
  const crownGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.158, 0.168, 0.072, 42, 1, false)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      if (y < 0) {
        const x = pos.getX(i)
        const z = pos.getZ(i)
        const angle = Math.atan2(z, x)
        const crimp = 1 + 0.042 * Math.sin(angle * 21)
        pos.setX(i, x * crimp)
        pos.setZ(i, z * crimp)
      }
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  // Premium flint glass material with authentic refractive index and clarity
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.02,
        metalness: 0,
        transmission: 0.99,
        thickness: 0.45,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.4,
        side: THREE.FrontSide,
        specularIntensity: 1.0,
      }),
    []
  )

  // Luminous cold-pressed strawberry liquid with GPU clipping
  const liquidMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e50930',
        roughness: 0.14,
        clearcoat: 0.85,
        clearcoatRoughness: 0.10,
        transmission: 0.35,
        thickness: 0.65,
        ior: 1.34,
        emissive: new THREE.Color('#850218'),
        emissiveIntensity: 0.40,
        side: THREE.DoubleSide,
        clippingPlanes: [clipPlane],
        clipShadows: true,
      }),
    [clipPlane]
  )

  // Liquid meniscus / top surface disc
  const discMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#eb1236',
        roughness: 0.18,
        emissive: new THREE.Color('#94041e'),
        emissiveIntensity: 0.46,
        side: THREE.DoubleSide,
      }),
    []
  )

  // Central effervescence / impact froth ring
  const frothMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff8ca4',
        roughness: 0.28,
        emissive: new THREE.Color('#ff3b65'),
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      }),
    []
  )

  // Dynamic pouring stream of cold-pressed strawberry juice
  const streamMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ff143c',
        emissive: new THREE.Color('#9e001f'),
        emissiveIntensity: 0.65,
        roughness: 0.12,
        clearcoat: 0.95,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
      }),
    []
  )

  const bubMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffe5eb',
        roughness: 0.18,
        emissive: new THREE.Color('#ff8fa6'),
        emissiveIntensity: 0.45,
      }),
    []
  )

  // Crown cap red lacquer top
  const capMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#d60e2f',
        emissive: new THREE.Color('#780315'),
        emissiveIntensity: 0.28,
        roughness: 0.18,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
      }),
    []
  )

  // Metallic silver edge for crimp teeth
  const capBandMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0f0f5',
        roughness: 0.18,
        metalness: 0.95,
      }),
    []
  )

  const labelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: labelTexture(),
        transparent: true,
        roughness: 0.35,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    []
  )

  const bubbleData = useMemo(
    () =>
      Array.from({ length: BUBBLES }, () => ({
        r: 0.008 + Math.random() * 0.022,
        ph: Math.random() * Math.PI * 2,
        sp: 0.15 + Math.random() * 0.38,
        a: Math.random() * Math.PI * 2,
        rad: 0.04 + Math.random() * 0.28,
      })),
    []
  )

  const splashData = useMemo(
    () =>
      Array.from({ length: SPLASH_COUNT }, (_, i) => ({
        angle: (i / SPLASH_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
        radius: 0.06 + Math.random() * 0.14,
        speed: 12 + Math.random() * 10,
        height: 0.04 + Math.random() * 0.08,
        size: 0.012 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
      })),
    []
  )

  useFrame(({ clock }) => {
    const time = clock.elapsedTime

    let f, capIn, rev, rotY, pourIntensity
    if (scrollDriven) {
      const p = scroll.progress

      // Smooth continuous liquid fill across Phase 03 (0.64 to 0.86)
      f = track(p, [
        [0.64, 0],
        [0.86, 1],
      ])

      // Pouring stream active when juice funnels into mouth
      const pourIn = seg(p, 0.62, 0.66)
      const pourOut = seg(p, 0.84, 0.875)
      pourIntensity = (1 - pourOut) * smooth(pourIn)

      capIn = seg(p, 0.88, 0.94)
      rev = seg(p, 0.56, 0.68)
      rotY = track(p, [
        [0.56, -0.6],
        [0.86, 0],
        [0.89, 0],
        [1.0, isMobile ? 0 : -0.20],
      ])

      if (p <= 0.54) {
        if (root.current) root.current.visible = false
        return
      }
    } else {
      f = fill
      capIn = cap
      rev = reveal
      rotY = autoRotate ? time * 0.4 : 0
      pourIntensity = f > 0.02 && f < 0.98 ? 1 : 0
    }

    const g = root.current
    if (!g) return
    g.visible = rev > 0.002
    if (!g.visible) return

    g.scale.setScalar(Math.max(0.0001, easeOutBack(rev)))
    g.rotation.y = rotY
    if (scrollDriven) {
      const p = scroll.progress
      // After juice fill & capping, the bottle glides directly into the product showcase image area
      const targetX = isMobile ? 0 : -1.60
      const targetY = isMobile ? 0.38 : 0.08
      const targetZ = isMobile ? -0.5 : 0.0

      g.position.x = track(p, [
        [0.56, 0],
        [0.89, 0],
        [1.0, targetX],
      ])

      g.position.y = track(p, [
        [0.56, -0.35],
        [0.68, 0.12],
        [0.86, 0.28],
        [0.89, 0.28],
        [1.0, targetY],
      ])

      g.position.z = track(p, [
        [0.56, 0],
        [0.89, 0],
        [1.0, targetZ],
      ])

      g.rotation.z = track(p, [
        [0.56, 0],
        [0.89, 0],
        [1.0, isMobile ? 0 : -0.025],
      ])
    }

    /* ---- 1. Liquid fill (Smooth GPU clipping plane) ---- */
    const fillY = Math.max(0.001, f * LIQUID_TOP)
    clipPlane.constant = fillY

    const liq = liquidRef.current
    if (liq) {
      liq.visible = f > 0.005
    }

    /* ---- 2. Liquid meniscus & wave sloshing ---- */
    const disc = discRef.current
    const froth = frothRef.current
    const isLiquidActive = f > 0.01

    if (disc) {
      disc.visible = isLiquidActive
      if (isLiquidActive) {
        const curR = getLiquidRadius(fillY)
        // Slosh wave while stream is pouring into the bottle
        const sloshX = Math.sin(time * 9) * 0.024 * pourIntensity
        const sloshZ = Math.cos(time * 8) * 0.024 * pourIntensity
        const waveY = Math.sin(time * 14) * 0.005 * pourIntensity

        disc.position.set(0, fillY + 0.002 + waveY, 0)
        disc.rotation.set(-Math.PI / 2 + sloshX, sloshZ, 0)
        disc.scale.set(curR, curR, 1)

        if (froth) {
          froth.visible = pourIntensity > 0.05
          if (froth.visible) {
            froth.position.set(0, fillY + 0.004 + waveY, 0)
            froth.rotation.set(-Math.PI / 2 + sloshX, sloshZ, 0)
            froth.scale.setScalar(curR * (0.45 + Math.sin(time * 12) * 0.08))
          }
        }
      }
    }

    /* ---- 3. Dynamic Pouring Stream ---- */
    const stream = streamRef.current
    if (stream) {
      const showStream = pourIntensity > 0.01 && f < 0.99
      stream.visible = showStream
      if (showStream) {
        const yTop = 2.40
        const yBottom = fillY
        const streamH = Math.max(0.01, yTop - yBottom)
        const streamMidY = (yTop + yBottom) / 2

        // Pulsing fluid flow
        const streamRadius = pourIntensity * (0.95 + Math.sin(time * 18) * 0.08)
        stream.position.set(
          Math.sin(time * 12) * 0.005,
          streamMidY,
          Math.cos(time * 11) * 0.005
        )
        stream.scale.set(streamRadius, streamH, streamRadius)
      }
    }

    /* ---- 4. Impact Splash Droplets ---- */
    const splash = splashRef.current
    if (splash) {
      const showSplash = pourIntensity > 0.08 && f > 0.02 && f < 0.98
      splash.visible = showSplash
      if (showSplash) {
        const dummy = splash.userData.dummy || (splash.userData.dummy = new THREE.Object3D())
        for (let i = 0; i < SPLASH_COUNT; i++) {
          const sp = splashData[i]
          const bounce = (Math.sin(time * sp.speed + sp.phase) + 1) * 0.5
          const dy = bounce * sp.height * pourIntensity
          const dr = sp.radius * (0.8 + bounce * 0.5) * pourIntensity
          const px = Math.cos(sp.angle) * dr
          const pz = Math.sin(sp.angle) * dr
          const py = fillY + dy + 0.008

          dummy.position.set(px, py, pz)
          const sz = sp.size * (0.4 + bounce * 0.6) * pourIntensity
          dummy.scale.setScalar(sz)
          dummy.updateMatrix()
          splash.setMatrixAt(i, dummy.matrix)
        }
        splash.instanceMatrix.needsUpdate = true
      }
    }

    /* ---- 5. Rising Micro-Bubbles ---- */
    const bub = bubbleRef.current
    if (bub) {
      bub.visible = f > 0.05
      if (bub.visible) {
        const dummy = bub.userData.dummy || (bub.userData.dummy = new THREE.Object3D())
        for (let i = 0; i < BUBBLES; i++) {
          const b = bubbleData[i]
          const speedMultiplier = 1 + pourIntensity * 1.5
          const k = (b.ph + time * b.sp * speedMultiplier) % 1
          const y = 0.09 + k * Math.max(0.04, fillY - 0.10)
          const squeeze = y > 1.62 ? 0.32 : y > 1.22 ? 0.65 : 1
          const turb = Math.sin(time * 6 + i) * 0.015 * pourIntensity

          dummy.position.set(
            Math.cos(b.a + time * 0.6) * b.rad * squeeze + turb,
            y,
            Math.sin(b.a + time * 0.6) * b.rad * squeeze + turb
          )
          const s = b.r * (y > fillY - 0.05 ? 0.35 : 1)
          dummy.scale.setScalar(s)
          dummy.updateMatrix()
          bub.setMatrixAt(i, dummy.matrix)
        }
        bub.instanceMatrix.needsUpdate = true
      }
    }

    /* ---- 6. Cap descent + seal ---- */
    const capG = capRef.current
    if (capG) {
      const k = smooth(capIn)
      capG.position.y = CAP_OPEN_Y + (CAP_SEALED_Y - CAP_OPEN_Y) * k
      capG.rotation.y = (1 - k) * Math.PI * 3.5
      const squash =
        capIn > 0.97 && capIn < 1
          ? 1 - 0.14 * Math.sin(((capIn - 0.97) / 0.03) * Math.PI)
          : 1
      capG.scale.set(1 + (1 - squash) * 0.5, squash, 1 + (1 - squash) * 0.5)
    }
  })

  return (
    <group ref={root}>
      <group position={[0, -1.20, 0]}>
        {/* Outer glass bottle */}
        <mesh geometry={glassGeo} material={glassMat} />

        {/* Continuous rising liquid column */}
        <mesh ref={liquidRef} geometry={liquidGeo} material={liquidMat} />

        {/* Liquid surface disc with wave ripples */}
        <mesh ref={discRef} geometry={discGeo} material={discMat} rotation-x={-Math.PI / 2} visible={false} />

        {/* Central froth / stream impact ring */}
        <mesh ref={frothRef} geometry={frothGeo} material={frothMat} rotation-x={-Math.PI / 2} visible={false} />

        {/* Dynamic pouring stream from above into the bottle */}
        <mesh ref={streamRef} geometry={streamGeo} material={streamMat} visible={false} />

        {/* Impact splash droplets */}
        <instancedMesh ref={splashRef} args={[splashGeo, streamMat, SPLASH_COUNT]} visible={false} frustumCulled={false} />

        {/* Rising micro-bubbles */}
        <instancedMesh ref={bubbleRef} args={[bubGeo, bubMat, BUBBLES]} visible={false} frustumCulled={false} />

        {/* Curved luxury front label */}
        <mesh position={[0, 0.68, 0]} material={labelMat}>
          <cylinderGeometry args={[0.382, 0.382, 0.72, 56, 1, true, -Math.PI * 0.40, Math.PI * 0.80]} />
        </mesh>

        {/* Fluted crown cap with crimson enamel and metallic crimp rim */}
        <group ref={capRef} position={[0, CAP_OPEN_Y, 0]}>
          <mesh geometry={crownGeo} material={capMat} castShadow />
          <mesh position={[0, -0.036, 0]} material={capBandMat}>
            <ringGeometry args={[0.138, 0.170, 42]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
