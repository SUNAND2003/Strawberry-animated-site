// Animation math helpers shared by the scroll-driven scene.

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const lerp = (a, b, t) => a + (b - a) * t

export const smooth = (t) => {
  t = clamp01(t)
  return t * t * (3 - 2 * t)
}

export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3)

export const easeInOutCubic = (t) => {
  t = clamp01(t)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const easeOutBack = (t) => {
  t = clamp01(t)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Normalised, eased progress between two scroll values. */
export const seg = (p, a, b) => smooth((p - a) / (b - a))

/** Piecewise keyframe track: [[progress, value], ...] with smoothstep easing. */
export function track(p, stops) {
  if (p <= stops[0][0]) return stops[0][1]
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, v0] = stops[i]
    const [t1, v1] = stops[i + 1]
    if (p <= t1) {
      const k = smooth((t1 - t0) === 0 ? 1 : (p - t0) / (t1 - t0))
      return v0 + (v1 - v0) * k
    }
  }
  return stops[stops.length - 1][1]
}
