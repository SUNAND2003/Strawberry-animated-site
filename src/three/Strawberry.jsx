import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll } from '../state'
import { track, seg, smooth, lerp, easeInOutCubic } from './utils'
import { skinTexture, skinBumpTexture, fleshTexture } from './textures'
import { isMobile } from './hooks'

/**
 * Photorealistic organic strawberry silhouette curve matching farm-fresh berries.
 * Slender conical apex, luscious convex body, rounded shoulder plateau, and calyx basin.
 */
export const STRAWBERRY_POINTS = [
  new THREE.Vector2(0.001, -0.84), // bottom apex center
  new THREE.Vector2(0.12, -0.80),  // soft blunt apex curve
  new THREE.Vector2(0.28, -0.68),  // lower conical curve
  new THREE.Vector2(0.48, -0.46),  // luscious lower body
  new THREE.Vector2(0.63, -0.18),  // plump mid body
  new THREE.Vector2(0.71, 0.12),   // full waist
  new THREE.Vector2(0.73, 0.30),   // widest rounded shoulders
  new THREE.Vector2(0.65, 0.48),   // rounding over shoulders
  new THREE.Vector2(0.46, 0.60),   // crown plateau
  new THREE.Vector2(0.22, 0.64),   // calyx basin
  new THREE.Vector2(0.001, 0.62),  // central stem indentation
]

const PROFILE_CURVE = new THREE.SplineCurve(STRAWBERRY_POINTS)
const PROFILE_POINTS = PROFILE_CURVE.getPoints(120)

export function strawberryProfile() {
  return PROFILE_POINTS
}

/** 4 chunky, natural culinary slices */
export const SLICES_COUNT = 4

// Partition indices along the 120 spline points:
// Slice 3 (Tip): index 0 to 32 (y: -0.84 to -0.42)
// Slice 2 (Lower mid): index 32 to 58 (y: -0.42 to 0.02)
// Slice 1 (Upper mid): index 58 to 82 (y: 0.02 to 0.38)
// Slice 0 (Crown cap): index 82 to 120 (y: 0.38 to 0.64)
const SLICE_CUTS = [
  { start: 82, end: 120, midY: 0.51, isTop: true, isBottom: false },
  { start: 58, end: 82, midY: 0.20, isTop: false, isBottom: false },
  { start: 32, end: 58, midY: -0.20, isTop: false, isBottom: false },
  { start: 0, end: 32, midY: -0.63, isTop: false, isBottom: true },
]

/** Applies sun-ripened organic color gradient to strawberry geometry vertices */
export function applyStrawberryVertexColors(geo, yMin = -0.84, yMax = 0.64) {
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const range = Math.max(0.001, yMax - yMin)

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = Math.min(1, Math.max(0, (y - yMin) / range))

    // Base color: radiant strawberry crimson
    let r = 1.0
    let g = 0.88
    let b = 0.88

    if (t < 0.14) {
      // Deep darker ruby at the apex tip
      const k = t / 0.14
      r = 0.82 + 0.18 * k
      g = 0.68 + 0.20 * k
      b = 0.72 + 0.16 * k
    } else if (t > 0.74) {
      // Natural ripening sun-blush: warm golden-amber transitioning to fresh pale green at calyx junction
      const k = (t - 0.74) / 0.26
      r = 1.0 - 0.08 * k
      g = 0.88 + 0.32 * k
      b = 0.88 - 0.12 * k
    }

    colors[i * 3] = r
    colors[i * 3 + 1] = g
    colors[i * 3 + 2] = b
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

/* ------------------------------------------------------------------ */
/* Materials                                                          */
/* ------------------------------------------------------------------ */

let _mats = null
export function berryMaterials() {
  if (_mats) return _mats
  const skin = skinTexture()
  const bump = skinBumpTexture()
  const flesh = fleshTexture()

  _mats = {
    skin: new THREE.MeshPhysicalMaterial({
      map: skin,
      bumpMap: bump,
      bumpScale: 0.042,
      roughness: 0.20,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      sheen: 0.8,
      sheenColor: new THREE.Color('#ff1744'),
      vertexColors: true,
    }),
    flesh: new THREE.MeshStandardMaterial({
      map: flesh,
      bumpMap: flesh,
      bumpScale: 0.024,
      roughness: 0.35,
      side: THREE.DoubleSide,
    }),
    leafPrimary: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.32,
      metalness: 0.02,
      vertexColors: true,
      side: THREE.DoubleSide,
    }),
    leafSecondary: new THREE.MeshStandardMaterial({
      color: '#d4eed4',
      roughness: 0.35,
      metalness: 0.02,
      vertexColors: true,
      side: THREE.DoubleSide,
    }),
    stem: new THREE.MeshStandardMaterial({
      color: '#286a28',
      roughness: 0.45,
      metalness: 0.02,
    }),
    drop: new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.02,
      transmission: 0.98,
      thickness: 0.35,
      ior: 1.333,
      clearcoat: 1.0,
    }),
  }
  return _mats
}

/* ------------------------------------------------------------------ */
/* Organic Curved Calyx (Leafy Green Crown)                           */
/* ------------------------------------------------------------------ */

function createCurvedLeafGeo(length = 0.64, width = 0.26, arch = 0.24) {
  const segX = 14
  const segY = 24
  const geo = new THREE.PlaneGeometry(width, length, segX, segY)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const halfLen = length / 2
  const halfWid = width / 2

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const v = Math.min(1, Math.max(0, (y + halfLen) / length)) // 0 at base, 1 at tip
    const u = Math.min(1, Math.max(-1, x / halfWid)) // -1 to +1

    // Natural leaf profile: narrow stem connection, expanding into an ovate body, pointed tip
    const widthProfile = Math.sin(Math.pow(v, 0.58) * Math.PI) * (1.18 - 0.28 * v)

    // Deep jagged botanical serrations
    const serration = 1.0 + (v > 0.12 && v < 0.92 ? Math.sin(v * 34) * 0.12 : 0)
    const newX = x * widthProfile * serration

    // Botanical S-curvature: drapes down over shoulder, tip curls outwards
    const drapeZ = -arch * Math.pow(v, 1.4)
    const tipCurl = 0.08 * Math.pow(Math.max(0, v - 0.65) / 0.35, 2)
    const foldZ = 0.032 * Math.abs(u) * (1 - v * 0.45)

    pos.setXYZ(i, newX, y + halfLen, drapeZ + tipCurl + foldZ)

    // Botanical gradient: rich emerald in body, lime in veins, touch of sun-bronze at tip
    const isRib = Math.abs(u) < 0.18
    const ribBoost = isRib ? 0.18 * (1 - Math.abs(u) / 0.18) : 0
    const tipRed = v > 0.82 ? ((v - 0.82) / 0.18) * 0.15 : 0

    colors[i * 3] = 0.16 + ribBoost * 0.2 + tipRed
    colors[i * 3 + 1] = 0.48 + ribBoost * 0.28 - tipRed * 0.4
    colors[i * 3 + 2] = 0.14 + ribBoost * 0.08
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  return geo
}

export function Calyx({ scale = 1 }) {
  const mats = berryMaterials()
  const primaryLeafGeo = useMemo(() => createCurvedLeafGeo(0.64, 0.26, 0.24), [])
  const secondaryLeafGeo = useMemo(() => createCurvedLeafGeo(0.42, 0.18, 0.16), [])
  const stemGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.034, 0.048, 0.26, 16)
    geo.translate(0, 0.13, 0)
    return geo
  }, [])

  const mainLeaves = 10
  const subLeaves = 6

  return (
    <group position={[0, 0.62, 0]} scale={scale}>
      {/* 1. Primary cascading leaves draping over strawberry shoulders */}
      {Array.from({ length: mainLeaves }, (_, i) => {
        const angle = (i / mainLeaves) * Math.PI * 2
        return (
          <group key={`leaf-main-${i}`} rotation-y={angle}>
            <mesh
              geometry={primaryLeafGeo}
              material={mats.leafPrimary}
              rotation-x={Math.PI * 0.5 - 0.10 + (i % 2) * 0.08}
              rotation-z={Math.sin(i * 1.7) * 0.12}
              scale={0.92 + ((i * 3) % 5) * 0.05}
              castShadow
            />
          </group>
        )
      })}

      {/* 2. Secondary smaller inner sepals */}
      {Array.from({ length: subLeaves }, (_, i) => {
        const angle = (i / subLeaves) * Math.PI * 2 + 0.32
        return (
          <group key={`leaf-sub-${i}`} rotation-y={angle}>
            <mesh
              geometry={secondaryLeafGeo}
              material={mats.leafSecondary}
              rotation-x={Math.PI * 0.5 + 0.06}
              rotation-z={Math.sin(i * 2.1) * 0.14}
              position={[0, 0.015, 0]}
              castShadow
            />
          </group>
        )
      })}

      {/* 3. Central fresh green stalk */}
      <mesh
        geometry={stemGeo}
        material={mats.stem}
        rotation-x={0.16}
        rotation-z={-0.10}
        castShadow
      />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Glistening Surface Dew Droplets                                    */
/* ------------------------------------------------------------------ */

function SurfaceDew() {
  const mats = berryMaterials()
  const dropGeo = useMemo(() => new THREE.SphereGeometry(1, 14, 12), [])

  const drops = useMemo(() => {
    const list = []
    const total = 36
    for (let i = 0; i < total; i++) {
      const idx = 12 + Math.floor((i / total) * 82)
      const pt = PROFILE_POINTS[idx]
      const phi = (i * 2.39996) % (Math.PI * 2) // Golden angle distribution
      const r = pt.x + 0.008
      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r
      const y = pt.y
      const size = 0.014 + (i % 6) * 0.006
      list.push({ pos: [x, y, z], size, scaleY: 1.25 })
    }
    // 3 succulent hanging teardrops near the tip
    list.push({ pos: [0.03, -0.78, 0.04], size: 0.024, scaleY: 1.5 })
    list.push({ pos: [-0.04, -0.76, -0.03], size: 0.022, scaleY: 1.4 })
    list.push({ pos: [0.01, -0.83, 0.01], size: 0.026, scaleY: 1.6 })
    return list
  }, [])

  return (
    <group>
      {drops.map((d, i) => (
        <mesh
          key={i}
          geometry={dropGeo}
          material={mats.drop}
          position={d.pos}
          scale={[d.size, d.size * d.scaleY, d.size]}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Transverse slice (Exported for Showcase decor)                    */
/* ------------------------------------------------------------------ */

export function Slice({ radius = 0.45, height = 0.18 }) {
  const mats = berryMaterials()
  return (
    <mesh material={[mats.skin, mats.flesh, mats.flesh]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius * 0.96, height, 56, 1]} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Whole berry (Used in decor / floaters & Hero)                      */
/* ------------------------------------------------------------------ */

export function WholeBerry({ scale = 1, withCalyx = true, withDew = true }) {
  const mats = berryMaterials()
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(PROFILE_POINTS, 64)
    applyStrawberryVertexColors(g, -0.84, 0.64)
    return g
  }, [])

  return (
    <group scale={scale}>
      <mesh geometry={geo} material={mats.skin} castShadow receiveShadow />
      {withDew && <SurfaceDew />}
      {withCalyx && <Calyx />}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Ambient floaters                                                   */
/* ------------------------------------------------------------------ */

const FLOATERS = [
  { type: 'berry', pos: [2.95, 1.15, -1.4], scale: 0.32, rot: [0.3, 0.8, 0.4] },
  { type: 'berry', pos: [2.45, 0.65, -1.6], scale: 0.26, rot: [-0.4, 0.2, 0.7] },
  { type: 'berry', pos: [1.8, 1.65, -2.3], scale: 0.22, rot: [0.6, 1.4, -0.3] },
  { type: 'berry', pos: [2.9, -0.85, -1.2], scale: 0.22, rot: [-0.7, 0.5, 0.5] },
  { type: 'berry', pos: [1.4, -1.35, -1.8], scale: 0.18, rot: [0.2, -0.7, 0.5] },
  { type: 'leaf', pos: [3.3, 0.35, -1.5], scale: 0.8, rot: [1.1, 0.4, 0.6] },
  { type: 'leaf', pos: [2.7, 1.55, -1.9], scale: 0.7, rot: [1.6, 2.1, -0.4] },
  { type: 'leaf', pos: [1.05, 1.85, -2.2], scale: 0.6, rot: [2.2, 0.9, 0.2] },
  { type: 'drop', pos: [1.35, 1.45, -0.4], scale: 0.08, rot: [0, 0, 0] },
  { type: 'drop', pos: [1.65, 0.55, -0.2], scale: 0.065, rot: [0, 0, 0] },
  { type: 'drop', pos: [2.75, 1.65, -2.0], scale: 0.09, rot: [0, 0, 0] },
  { type: 'drop', pos: [2.65, 0.95, -1.1], scale: 0.06, rot: [0, 0, 0] },
]

function Floaters() {
  const mats = berryMaterials()
  const leafGeo = useMemo(() => createCurvedLeafGeo(0.5, 0.22, 0.2), [])
  const ref = useRef()

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    g.children.forEach((c, i) => {
      c.position.y = FLOATERS[i].pos[1] + Math.sin(t * 0.55 + i * 1.3) * 0.16
      c.rotation.y = FLOATERS[i].rot[1] + t * (0.12 + (i % 4) * 0.05)
      c.rotation.z = FLOATERS[i].rot[2] + Math.sin(t * 0.4 + i) * 0.18
    })
  })

  return (
    <group ref={ref}>
      {FLOATERS.map((f, i) => (
        <group key={i} position={f.pos} scale={f.scale} rotation={f.rot}>
          {f.type === 'berry' && <WholeBerry withDew={false} />}
          {f.type === 'leaf' && <mesh geometry={leafGeo} material={mats.leafPrimary} />}
          {f.type === 'drop' && (
            <mesh material={mats.drop} scale={[1, 1.3, 1]}>
              <sphereGeometry args={[1, 16, 12]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* The scroll-driven hero berry: seamless whole, then slices apart     */
/* ------------------------------------------------------------------ */

export function BerrySystem() {
  const mats = berryMaterials()
  const root = useRef()
  const wholeRef = useRef()
  const floaties = useRef()
  const sliceRefs = useRef([])
  const spin = useRef(0)

  // 1. Flawless Whole Berry in Hero
  const wholeGeo = useMemo(() => {
    const geo = new THREE.LatheGeometry(PROFILE_POINTS, 64)
    applyStrawberryVertexColors(geo, -0.84, 0.64)
    return geo
  }, [])

  // 2. Thick appetizing slices
  const sliceData = useMemo(() => {
    return SLICE_CUTS.map((cut) => {
      const slicePts = PROFILE_POINTS.slice(cut.start, cut.end + 1)
      const latheGeo = new THREE.LatheGeometry(slicePts, 64)
      applyStrawberryVertexColors(latheGeo, slicePts[0].y, slicePts[slicePts.length - 1].y)

      // Remap side wall UVs so seed texture aligns with vertical strawberry height
      const uv = latheGeo.attributes.uv
      const v0 = cut.start / 120
      const v1 = cut.end / 120
      for (let k = 0; k < uv.count; k++) {
        const rawV = uv.getY(k)
        uv.setY(k, v0 + rawV * (v1 - v0))
      }
      uv.needsUpdate = true

      // Shift lathe so the slice local origin is at cut.midY for natural tilt/spin
      latheGeo.translate(0, -cut.midY, 0)

      const rTop = slicePts[slicePts.length - 1].x
      const rBottom = slicePts[0].x
      const yTop = slicePts[slicePts.length - 1].y
      const yBottom = slicePts[0].y

      const topDiscGeo = !cut.isTop ? new THREE.CircleGeometry(Math.max(0.02, rTop), 48) : null
      const bottomDiscGeo = !cut.isBottom ? new THREE.CircleGeometry(Math.max(0.02, rBottom), 48) : null

      return {
        latheGeo,
        topDiscGeo,
        bottomDiscGeo,
        yTopRel: yTop - cut.midY,
        yBottomRel: yBottom - cut.midY,
        calyxYRel: 0.62 - cut.midY,
        midY: cut.midY,
        isTop: cut.isTop,
      }
    })
  }, [])

  const motionData = useMemo(
    () => [
      { x: 0.04, z: 0.1, rx: -0.22, ry: 0.20, rz: 0.08, ph: 0.2 },   // Slice 0 (Crown) - tilted slightly back
      { x: -0.14, z: 0.08, rx: 0.36, ry: -0.25, rz: -0.15, ph: 1.8 }, // Slice 1 (Upper mid) - tilted forward to reveal flesh
      { x: 0.16, z: -0.1, rx: 0.38, ry: 0.22, rz: 0.14, ph: 3.4 },   // Slice 2 (Lower mid) - tilted forward to reveal flesh
      { x: -0.06, z: 0.12, rx: 0.18, ry: -0.14, rz: -0.08, ph: 5.1 }, // Slice 3 (Tip)
    ],
    []
  )

  useFrame((state, delta) => {
    const p = scroll.progress
    const time = state.clock.elapsedTime

    /* --- whole berry transform --- */
    const hero = 1 - seg(p, 0.02, 0.18)
    spin.current += delta * 0.24 * hero

    const g = root.current
    if (g) {
      g.position.y = track(p, [
        [0, isMobile ? 1.32 : 0.12],
        [0.22, 0.05],
      ]) + Math.sin(time * 0.9) * 0.06 * hero

      // Shift right on desktop for clean side-by-side hero composition
      g.position.x = track(p, [
        [0, isMobile ? 0 : 1.72],
        [0.2, 0],
      ]) + Math.sin(time * 0.62) * 0.05 * hero

      g.rotation.y = spin.current + track(p, [
        [0.1, 0],
        [0.5, 2.5],
      ])
      g.rotation.z =
        Math.sin(time * 0.7) * 0.07 * hero +
        track(p, [
          [0.2, 0],
          [0.42, 0.16],
          [0.62, 0],
        ])
      g.rotation.x = track(p, [
        [0, 0.12],
        [0.1, 0.12],
        [0.4, -0.22],
        [0.62, 0],
      ])
      const sc = (1 + 0.12 * hero) * (isMobile ? 0.52 : 1)
      g.scale.setScalar(sc)
    }

    /* --- floaters scatter away --- */
    const fl = floaties.current
    if (fl) {
      const k = 1 - seg(p, 0.04, 0.2)
      fl.scale.setScalar(Math.max(0.001, k))
      fl.visible = k > 0.02
    }

    /* --- seamless hand-off from whole berry to slices --- */
    const whole = wholeRef.current
    const isWholeActive = p <= 0.22
    if (whole) {
      whole.visible = isWholeActive
    }

    /* --- slices spread, press, and liquefy --- */
    const spread = track(p, [
      [0.22, 0],
      [0.44, 1],
      [0.52, 0.4],
      [0.60, 0],
    ])
    // Slices compress during cold press and completely liquefy by p = 0.62
    const vanish = 1 - smooth(seg(p, 0.52, 0.62))

    for (let i = 0; i < SLICES_COUNT; i++) {
      const s = sliceRefs.current[i]
      if (!s) continue
      const m = motionData[i]
      const info = sliceData[i]

      // Separation during Phase 01, compression during Phase 02 cold press
      const spreadLift = (1.5 - i) * 0.42 * spread

      let px = m.x * 0.5 * spread + Math.sin(time * 0.6 + m.ph) * 0.04 * spread
      let py = info.midY + spreadLift + Math.sin(time * 0.85 + m.ph) * 0.05 * spread
      let pz = m.z * 0.5 * spread

      const rx = m.rx * spread + Math.sin(time * 0.55 + m.ph) * 0.16 * spread
      const ry = m.ry * spread + Math.sin(time * 0.44 + m.ph * 1.7) * 0.22 * spread
      const rz = m.rz * spread + Math.cos(time * 0.5 + m.ph) * 0.16 * spread

      s.position.set(px, py, pz)
      s.rotation.set(rx, ry, rz)
      s.scale.setScalar(Math.max(0.0001, vanish))
      s.visible = !isWholeActive && vanish > 0.015
    }
  })

  return (
    <>
      <group ref={root}>
        {/* 1. Flawless Whole Berry in Hero (p <= 0.22) */}
        <group ref={wholeRef}>
          <mesh geometry={wholeGeo} material={mats.skin} castShadow receiveShadow />
          <SurfaceDew />
          <Calyx />
        </group>

        {/* 2. Thick Appetizing Slices separating on scroll (p > 0.22) */}
        {sliceData.map((info, i) => (
          <group
            key={i}
            ref={(el) => (sliceRefs.current[i] = el)}
            position={[0, info.midY, 0]}
            visible={false}
          >
            {/* Outer skin */}
            <mesh
              geometry={info.latheGeo}
              material={mats.skin}
              castShadow
              receiveShadow
            />

            {/* Top cut face (showing luscious strawberry flesh) */}
            {info.topDiscGeo && (
              <mesh
                geometry={info.topDiscGeo}
                material={mats.flesh}
                position={[0, info.yTopRel, 0]}
                rotation-x={-Math.PI / 2}
                castShadow
                receiveShadow
              />
            )}

            {/* Bottom cut face (showing luscious strawberry flesh) */}
            {info.bottomDiscGeo && (
              <mesh
                geometry={info.bottomDiscGeo}
                material={mats.flesh}
                position={[0, info.yBottomRel, 0]}
                rotation-x={Math.PI / 2}
                castShadow
                receiveShadow
              />
            )}

            {/* If Crown Cap (Slice 0), mount the Calyx directly on its crown! */}
            {info.isTop && (
              <group position={[0, -info.midY, 0]}>
                <Calyx />
              </group>
            )}
          </group>
        ))}
      </group>

      <group ref={floaties}>
        <Floaters />
      </group>
    </>
  )
}
