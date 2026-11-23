import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { scrollToId } from '../smooth'
import BerrySVG from './BerrySVG'

const LINKS = [
  ['Story', 'about'],
  ['The Bottle', 'product'],
  ['Ingredients', 'ingredients'],
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const barRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.nav-anim'), {
        y: -16,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        delay: 0.05,
      })
    })
    return () => ctx.revert()
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <header
      ref={barRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? 'bg-ink/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <div className="shell flex h-[76px] items-center justify-between">
        {/* Brand Logo & Tagline */}
        <a
          href="#home"
          onClick={(e) => go(e, 'home')}
          className="nav-anim flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-berry rounded-xl"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-berry/30 via-berry/15 to-transparent border border-berry/40 shadow-[0_0_20px_rgba(232,17,48,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-berry/70 group-hover:shadow-[0_0_28px_rgba(232,17,48,0.45)]">
            <BerrySVG className="h-5 w-5 text-berry transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-berry ring-2 ring-ink animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-[1.28rem] font-black tracking-[-0.02em] text-cream leading-none">
              Berry<span className="text-berry drop-shadow-[0_0_12px_rgba(255,45,76,0.6)]">Fresh</span>
            </span>
            <span className="hidden sm:block text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-cream/55 mt-0.5">
              Raw Cold-Pressed
            </span>
          </div>
        </a>

        {/* Floating Capsule Navigation (Desktop) */}
        <nav className="nav-anim hidden md:flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {LINKS.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => go(e, id)}
              className="relative px-4 py-1.5 rounded-full text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-cream/75 transition-all duration-200 hover:text-cream hover:bg-white/[0.08]"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right Section: Status Pill & Action Button */}
        <div className="nav-anim hidden md:flex items-center gap-4">
          <div className="hidden lg:inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-emerald-300">
              4°C Chilled
            </span>
          </div>

          <a
            href="#product"
            onClick={(e) => go(e, 'product')}
            className="btn btn-solid !px-6 !py-2.5 !text-[0.78rem] tracking-[0.08em] font-bold group relative overflow-hidden shadow-[0_8px_25px_-6px_rgba(255,45,76,0.6)]"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>Taste the juice</span>
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="nav-anim flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden rounded-xl bg-white/[0.06] border border-white/10 active:scale-95 transition-all"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-[1.5px] w-5 bg-cream transition-transform duration-300 ${
              open ? 'translate-y-[6.5px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-cream transition-all duration-300 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-cream transition-transform duration-300 ${
              open ? '-translate-y-[6.5px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-2xl transition-[max-height] duration-500 md:hidden ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="shell flex flex-col gap-1 py-5">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 text-[0.68rem] uppercase tracking-widest text-cream/50 px-2">
            <span>Navigation</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Chilled at 4°C
            </span>
          </div>

          {[['Home', 'home'], ...LINKS].map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => go(e, id)}
              className="rounded-xl px-4 py-3 text-[0.82rem] uppercase tracking-[0.2em] text-cream/80 transition-colors hover:bg-white/10 hover:text-cream font-semibold flex items-center justify-between group"
            >
              <span>{label}</span>
              <span className="text-berry text-xs opacity-0 transition-opacity group-hover:opacity-100">→</span>
            </a>
          ))}

          <div className="pt-3">
            <a
              href="#product"
              onClick={(e) => go(e, 'product')}
              className="btn btn-solid w-full text-center justify-center !py-3 flex items-center gap-2"
            >
              <span>Taste the juice</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
