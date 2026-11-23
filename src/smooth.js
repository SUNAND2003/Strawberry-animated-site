import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll, pointer } from './state'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let raf = null

export function initSmooth() {
  if (lenis) return lenis

  lenis = new Lenis({
    duration: 1.35,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    syncTouch: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  // exposed for automated visual testing / debugging
  if (typeof window !== 'undefined') window.__lenis = lenis

  raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(500, 33)

  const onMove = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  lenis._onMove = onMove

  return lenis
}

export function destroySmooth() {
  if (!lenis) return
  if (raf) gsap.ticker.remove(raf)
  window.removeEventListener('mousemove', lenis._onMove)
  lenis.destroy()
  lenis = null
  raf = null
}

export function scrollToId(id) {
  const el = document.getElementById(id.replace('#', ''))
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, {
      offset: -12,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
