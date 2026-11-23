import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll } from '../state'
import { scrollToId } from '../smooth'

gsap.registerPlugin(ScrollTrigger)

/**
 * The whole first act lives inside one tall wrapper. A single scrubbed
 * timeline drives both the HTML captions and the Three.js 3D WebGL scene,
 * keeping camera moves, strawberry slicing, juice splash, and bottle fill in lockstep.
 */
export default function Experience() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = { p: 0 }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      // 0 → 1 progress fed to the 3D scene across the entire scroll story
      tl.to(
        st,
        {
          p: 1,
          duration: 1,
          ease: 'none',
          onUpdate: () => {
            scroll.progress = st.p
          },
        },
        0
      )

      // Ambient radial glow expansion as you delve deeper
      tl.fromTo(
        '.stage-glow',
        { scale: 1, opacity: 0.85 },
        { scale: 1.4, opacity: 1.25, duration: 1, ease: 'none' },
        0
      )

      // Hero exit
      tl.to('.js-hero', { autoAlpha: 0, y: -70, duration: 0.07, ease: 'power2.in' }, 0.07)

      // Final: Ready to drink bottle reveal & seal
      tl.fromTo(
        '.js-final',
        { autoAlpha: 0, y: 36, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.06, ease: 'power2.out' },
        0.88
      )
    }, root)

    return () => ctx.revert()
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    scrollToId(id)
  }

  return (
    <div ref={root} className="experience" id="home">
      <div className="stage">
        <div className="stage-glow" />

        {/* ---------- Hero Copy ---------- */}
        <div className="hero-copy js-hero shell z-10">
          <div className="max-w-xl lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blush/30 bg-berry/15 px-3.5 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-berry animate-pulse shrink-0" />
              <p className="eyebrow !text-cream !tracking-[0.22em] whitespace-nowrap text-[0.70rem] sm:text-[0.74rem]">
                100% Raw Cold-Pressed · Hand-Picked at Sunrise
              </p>
            </div>

            <h1 className="display hero-title mt-4 text-cream">
              Freshness in
              <br />
              <span className="outline-type">every drop.</span>
            </h1>

            <p className="mt-4 max-w-[46ch] text-[0.98rem] leading-relaxed text-cream/75">
              Picked at 5:40 AM and cold-pressed within four hours. One single ingredient, zero added sugar,
              zero concentrate — scroll down to watch the craft.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a href="#product" onClick={(e) => go(e, 'product')} className="btn btn-solid">
                Discover the taste
              </a>
              <a href="#about" onClick={(e) => go(e, 'about')} className="btn btn-ghost">
                Our Craft Story
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5 sm:gap-6 border-t border-white/10 pt-5 text-[0.74rem] uppercase tracking-[0.16em] text-cream/65">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-berry font-bold">✓</span> 4h Field to Bottle
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-berry font-bold">✓</span> 100% Pure Berries
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-berry font-bold">✓</span> Zero Sugar Added
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-hint js-hero hidden md:flex">
          <span>Scroll to explore</span>
          <i />
        </div>

        {/* Caption 04: The Sealed Bottle */}
        <div className="final-wrap">
          <div className="js-final cap-box !max-w-xl">
            <span className="cap-badge !text-berry !border-berry/50">Ready to drink</span>
            <h2 className="display mt-1 text-[clamp(1.4rem,3.2vw,2.2rem)] text-cream">
              Berry Fresh <span className="text-berry">· 100% Strawberry</span>
            </h2>
            <p className="cap-sub">
              Nature’s purest cold-pressed refreshment. Bottled raw at peak vibrancy with zero compromises.
            </p>
            <div className="mt-4 flex justify-center gap-4 pointer-events-auto">
              <a href="#product" onClick={(e) => go(e, 'product')} className="btn btn-solid !py-2.5 !px-6">
                Taste the freshness
              </a>
              <a href="#about" onClick={(e) => go(e, 'about')} className="btn btn-ghost !py-2.5 !px-6">
                How it's made
              </a>
            </div>
            <p className="mt-3 text-[0.72rem] uppercase tracking-[0.2em] text-cream/45">
              750 ml · 100% cold-pressed strawberries · served cold
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
