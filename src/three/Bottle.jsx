import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll } from '../state'
import { track, seg, smooth, easeOutBack, clamp01 } from './utils'
import { labelTexture } from './textures'
import { isMobile } from './hooks'

const SEGMENTS = 56
export const LIQUID_TOP = 1.34
const CAP_SEALED_Y = 1.90
const CAP_OPEN_Y = 4.25
const BUBBLES = 32
const SPLASH_COUNT = 16

/** Lathe profile of the juice bottle, from base (y=0) to lip (y≈1.915). */
export function bottleProfile() {
  const p = []
  const add = (x, y) => p.push(new THREE.Vector2(x, y))

  add(0.001, 0.0)
  add(0.2, 0.004)
  add(0.34, 0.016)
  add(0.405, 0.048)
  add(0.42, 0.09)
  for (let y = 0.16; y < 1.14; y += 0.07) add(0.42, y)
  add(0.42, 1.15)

  // shoulder
  for (let i = 1; i <= 14; i++) {
    const k = i / 14
    const y = 1.15 + k * 0.37
    const r = 0.17 + (0.42 - 0.17) * Math.pow(Math.cos((k * Math.PI) / 2), 1.4)
    add(r, y)
  }

  // neck + lip
  add(0.17, 1.58)
  add(0.17, 1.8)
  add(0.198, 1.845)
  add(0.198, 1.9)
  add(0.17, 1.915)
  add(0.001, 1.915)
  return p
}

export function getLiquidRadius(y) {
  if (y <= 0.05) return Math.max(0.01, 0.398 * Math.sqrt(Math.max(0, y / 0.05)))
  if (y <= 1.15) return 0.398
  const k = Math.min(1, Math.max(0, (y - 1.15) / 0.37))
  return Math.max(0.12, 0.17 + (0.42 - 0.17) * Math.pow(Math.cos((k * Math.PI) / 2), 1.4) - 0.022)
}

function liquidProfile() {
  const pts = []
  pts.push(new THREE.Vector2(0.001, 0))
  const N = 48
  for (let i = 0; i <= N; i++) {
    const y = (i / N) * LIQUID_TOP
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
  const frothGeo = useMemo(() => new THREE.RingGeometry(0.03, 0.18, 36), [])
  const bubGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])
  const splashGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])
  const streamGeo = useMemo(() => new THREE.CylinderGeometry(0.045, 0.075, 1, 24, 16), [])

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.05,
        metalness: 0,
        transmission: 0.98,
        thickness: 0.38,
        ior: 1.48,
        clearcoat: 0.6,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.05,
        side: THREE.FrontSide,
        specularIntensity: 1,
      }),
    []
  )

  // Luminous cold-pressed strawberry liquid with GPU clipping
  const liquidMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ce0b2b',
        roughness: 0.12,
        clearcoat: 0.65,
        clearcoatRoughness: 0.15,
        emissive: new THREE.Color('#7a0218'),
        emissiveIntensity: 0.46,
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
        color: '#e21034',
        roughness: 0.22,
        emissive: new THREE.Color('#8a021b'),
        emissiveIntensity: 0.48,
        side: THREE.DoubleSide,
      }),
    []
  )

  // Central effervescence / impact froth ring
  const frothMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff8ca4',
        roughness: 0.32,
        emissive: new THREE.Color('#ff3b65'),
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      }),
    []
  )

  // Dynamic pouring stream of cold-pressed strawberry juice (Opaque pass so glass refracts it)
  const streamMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ff143c',
        emissive: new THREE.Color('#9e001f'),
        emissiveIntensity: 0.65,
        roughness: 0.12,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12,
        side: THREE.DoubleSide,
      }),
    []
  )

  const bubMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffe5eb',
        roughness: 0.2,
        emissive: new THREE.Color('#ff8fa6'),
        emissiveIntensity: 0.4,
      }),
    []
  )

  // Sleek brushed chrome / silver metal cap
  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0f0f4',
        roughness: 0.18,
        metalness: 0.92,
      }),
    []
  )
  const capBandMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d00c28',
        roughness: 0.28,
        metalness: 0.55,
      }),
    []
  )

  const labelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: labelTexture(),
        transparent: true,
        roughness: 0.3,
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
        const yTop = 1.910
        const yBottom = fillY
        const streamH = Math.max(0.01, yTop - yBottom)
        const streamMidY = (yTop + yBottom) / 2

        // Pulsing fluid flow
        const streamRadius = pourIntensity * (0.95 + Math.sin(time * 18) * 0.08)
        stream.position.set(
          Math.sin(time * 12) * 0.006,
          streamMidY,
          Math.cos(time * 11) * 0.006
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
          const y = 0.06 + k * Math.max(0.04, fillY - 0.08)
          const squeeze = y > 1.15 ? 0.55 : 1
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
      <group position={[0, -0.975, 0]}>
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
        <mesh position={[0, 0.65, 0]} material={labelMat}>
          <cylinderGeometry args={[0.422, 0.422, 0.68, 56, 1, true, -Math.PI * 0.42, Math.PI * 0.84]} />
        </mesh>

        {/* Brushed chrome cap & ruby seal band */}
        <group ref={capRef} position={[0, CAP_OPEN_Y, 0]}>
          <mesh material={capMat} castShadow>
            <cylinderGeometry args={[0.207, 0.207, 0.2, 44]} />
          </mesh>
          <mesh position={[0, -0.078, 0]} material={capBandMat}>
            <cylinderGeometry args={[0.214, 0.214, 0.05, 44]} />
          </mesh>
          <mesh position={[0, 0.104, 0]} material={capBandMat}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
