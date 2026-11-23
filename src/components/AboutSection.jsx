import { useRef } from 'react'
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

  const yA = useTransform(scrollYProgress, [0, 1], [60, -60])
  const yB = useTransform(scrollYProgress, [0, 1], [-40, 50])
  const yC = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section id="about" ref={ref} className="relative overflow-hidden bg-cream py-24 text-ink md:py-36">
      <div className="pointer-events-none absolute -right-32 top-10 h-[400px] w-[400px] rounded-full bg-blush/40 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-[350px] w-[350px] rounded-full bg-berry/10 blur-[100px]" />

      <div className="shell relative grid gap-14 md:grid-cols-12 md:gap-12">
        {/* Left Column: Story & Philosophy */}
        <div className="md:col-span-5">
          <motion.div {...rise}>
            <div className="inline-flex items-center gap-2 rounded-full border border-berry/20 bg-berry/10 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-berry-deep">
              <span>●</span> Our Orchard Story
            </div>

            <h2 className="display mt-5 text-[clamp(2.1rem,3.8vw,3.3rem)] text-ink">
              From field to
              <br />
              bottle in <span className="text-berry">four hours.</span>
            </h2>

            <p className="mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-ink/75">
              What began as a single row of heirloom strawberry plants on sunny coastal hills is now twelve
              acres of living, regenerative family soil. We refuse to rush nature: every berry is checked
              by hand, the fields rotate naturally, and the fruit — not a shipping schedule — decides when it is ready.
            </p>

            <ul className="mt-8 space-y-3.5 text-[0.96rem] font-medium text-ink/80">
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

          <motion.dl {...rise} className="mt-12 grid grid-cols-2 gap-6 border-t border-ink/10 pt-8">
            {STATS.map(([n, l]) => (
              <div key={l} className="space-y-1">
                <dt className="font-display text-[2.6rem] font-extrabold leading-none text-berry tracking-tight">{n}</dt>
                <dd className="text-[0.76rem] uppercase tracking-[0.14em] text-ink/65 font-semibold">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right Column: Editorial Visual Collage with Real Photography */}
        <div className="relative md:col-span-7">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* Main Hero Card: Sunrise Harvest with Real Strawberry Image */}
            <motion.div
              {...rise}
              style={{ y: yA }}
              className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[32px] shadow-[0_30px_70px_-30px_rgba(157,11,34,0.7)] group"
            >
              <img
                src="/images/strawberry-droplets.jpg"
                alt="Sunrise Hand-Picked Strawberries"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                <IconSunrise className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" />
                <p className="mt-3 font-display text-lg font-bold tracking-[-0.01em] text-white sm:text-2xl">
                  Picked by hand, 5:40 am
                </p>
                <p className="mt-1 text-sm text-white/85">While the morning dew is still on the vine</p>
              </div>
            </motion.div>

            {/* Bottom Left Card: Dynamic Juice Splash Photography */}
            <motion.div
              {...rise}
              style={{ y: yB }}
              className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-[0_25px_60px_-25px_rgba(157,11,34,0.5)] group"
            >
              <img
                src="/images/strawberry-splash.jpg"
                alt="Cold Pressing Velocity"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 sm:p-6 flex flex-col justify-end">
                <span className="text-[0.72rem] uppercase tracking-[0.16em] text-blush font-bold">Cold Extraction</span>
                <p className="mt-1 font-display text-base font-bold text-white sm:text-xl">
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
              className="relative min-h-[240px] aspect-[4/5] overflow-hidden rounded-[32px] bg-ink text-cream shadow-[0_25px_60px_-25px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col justify-between p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <IconStopwatch className="h-9 w-9 text-berry sm:h-10 sm:w-10" />
                <span className="rounded-full bg-berry/20 px-3 py-1 text-[0.68rem] uppercase tracking-[0.14em] text-berry font-bold">
                  Cold Speed
                </span>
              </div>
              <div>
                <span className="text-[0.72rem] uppercase tracking-[0.16em] text-cream/50 font-semibold">Field to Bottle</span>
                <p className="mt-1 font-display text-3xl font-extrabold leading-none text-cream sm:text-4xl">
                  04:00
                </p>
                <p className="mt-2 text-[0.78rem] uppercase tracking-[0.12em] text-cream/65">
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
