import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { IconSunrise, IconStopwatch } from './Icons'
import { rise } from '../motion'

const STATS = [
  ['4h', 'field to bottle'],
  ['12', 'acres of heritage berries'],
  ['0%', 'additives or heat'],
  ['100%', 'hand-picked at dawn'],
]

export default function AboutSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const yA = useTransform(scrollYProgress, [0, 1], isDesktop ? [40, -40] : [0, 0])
  const yB = useTransform(scrollYProgress, [0, 1], isDesktop ? [-25, 30] : [0, 0])
  const yC = useTransform(scrollYProgress, [0, 1], isDesktop ? [30, -25] : [0, 0])

  return (
    <section id="about" ref={ref} className="relative overflow-hidden bg-cream py-16 sm:py-24 md:py-32 lg:py-36 text-ink">
      {/* Ambient background soft light blurs */}
      <div className="pointer-events-none absolute -right-32 top-10 h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] lg:h-[400px] lg:w-[400px] rounded-full bg-blush/40 blur-[100px] sm:blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-[240px] w-[240px] sm:h-[300px] sm:w-[300px] lg:h-[350px] lg:w-[350px] rounded-full bg-berry/10 blur-[80px] sm:blur-[100px]" />

      <div className="shell relative grid gap-12 sm:gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-16 items-center">
        {/* Left Column: Story & Philosophy */}
        <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:col-span-5">
          <motion.div {...rise}>
            <div className="inline-flex items-center gap-2 rounded-full border border-berry/20 bg-berry/10 px-3.5 py-1 text-[0.70rem] sm:text-[0.72rem] font-bold uppercase tracking-[0.16em] text-berry-deep">
              <span>●</span> Our Orchard Story
            </div>

            <h2 className="display mt-4 sm:mt-5 text-[clamp(1.9rem,3.8vw,3.3rem)] leading-[1.1] text-ink">
              From field to
              <br />
              bottle in <span className="text-berry">four hours.</span>
            </h2>

            <p className="mt-5 sm:mt-6 max-w-xl lg:max-w-[46ch] text-[0.96rem] sm:text-[1.02rem] leading-relaxed text-ink/75">
              What began as a single row of heirloom strawberry plants on sunny coastal hills is now twelve
              acres of living, regenerative family soil. We refuse to rush nature: every berry is checked
              by hand, the fields rotate naturally, and the fruit — not a shipping schedule — decides when it is ready.
            </p>

            <ul className="mt-7 sm:mt-8 space-y-3 sm:space-y-3.5 text-[0.92rem] sm:text-[0.96rem] font-medium text-ink/80">
              {[
                'Sun-ripened on the vine, never gas-ripened in storage',
                'Living ecosystem: wild bees, butterflies, natural compost',
                'Cold-pressed the exact morning it is hand-picked',
                'Plastic-free, infinitely recyclable violet glass bottles',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-berry" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.dl
            {...rise}
            className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-6 border-t border-ink/10 pt-7 sm:pt-8"
          >
            {STATS.map(([n, l]) => (
              <div key={l} className="space-y-1">
                <dt className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-none text-berry tracking-tight">
                  {n}
                </dt>
                <dd className="text-[0.72rem] sm:text-[0.76rem] uppercase tracking-[0.12em] sm:tracking-[0.14em] text-ink/65 font-semibold leading-snug">
                  {l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right Column: Editorial Visual Collage with Real Photography */}
        <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:col-span-7">
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:gap-6">
            {/* Main Hero Card: Sunrise Harvest with Real Strawberry Image */}
            <motion.div
              {...rise}
              style={{ y: yA }}
              className="relative col-span-2 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-[0_20px_50px_-20px_rgba(157,11,34,0.6)] sm:shadow-[0_30px_70px_-30px_rgba(157,11,34,0.7)] group"
            >
              <img
                src="/images/strawberry-droplets.jpg"
                alt="Sunrise Hand-Picked Strawberries"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent p-5 sm:p-7 lg:p-8 flex flex-col justify-end">
                <IconSunrise className="h-8 w-8 text-white/90 sm:h-10 sm:w-10 lg:h-12 lg:w-12 shrink-0" />
                <p className="mt-2.5 sm:mt-3 font-display text-base sm:text-xl lg:text-2xl font-bold tracking-[-0.01em] text-white">
                  Picked by hand, 5:40 am
                </p>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/85">
                  While the morning dew is still on the vine
                </p>
              </div>
            </motion.div>

            {/* Bottom Left Card: Dynamic Juice Splash Photography */}
            <motion.div
              {...rise}
              style={{ y: yB }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-[0_18px_45px_-20px_rgba(157,11,34,0.45)] sm:shadow-[0_25px_60px_-25px_rgba(157,11,34,0.5)] group"
            >
              <img
                src="/images/strawberry-splash.jpg"
                alt="Cold Pressing Velocity"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-4 sm:p-5 lg:p-6 flex flex-col justify-end">
                <span className="text-[0.64rem] sm:text-[0.72rem] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-blush font-bold">
                  Cold Extraction
                </span>
                <p className="mt-1 font-display text-sm sm:text-base lg:text-xl font-bold text-white leading-tight">
                  Pressed in seconds,
                  <br />
                  sealed at 4°C
                </p>
              </div>
            </motion.div>

            {/* Bottom Right Card: Dark Luxury Stopwatch Timer Card */}
            <motion.div
              {...rise}
              style={{ y: yC }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-ink text-cream shadow-[0_18px_45px_-20px_rgba(0,0,0,0.7)] sm:shadow-[0_25px_60px_-25px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col justify-between p-4 sm:p-6 lg:p-7"
            >
              <div className="flex items-center justify-between gap-2">
                <IconStopwatch className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-berry shrink-0" />
                <span className="rounded-full bg-berry/20 px-2 py-0.5 sm:px-3 sm:py-1 text-[0.60rem] sm:text-[0.68rem] uppercase tracking-[0.12em] sm:tracking-[0.14em] text-berry font-bold whitespace-nowrap">
                  Cold Speed
                </span>
              </div>
              <div>
                <span className="text-[0.64rem] sm:text-[0.72rem] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-cream/50 font-semibold block">
                  Field to Bottle
                </span>
                <p className="mt-0.5 sm:mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-none text-cream">
                  04:00
                </p>
                <p className="mt-1 sm:mt-2 text-[0.66rem] sm:text-[0.76rem] uppercase tracking-[0.10em] sm:tracking-[0.12em] text-cream/65 leading-snug">
                  Hours from morning harvest to oxygen-free seal
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
