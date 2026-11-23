import { motion } from 'framer-motion'
import { scrollToId } from '../smooth'

export default function FinalCTA() {
  return (
    <section id="cta" className="splash-bg relative min-h-[92vh] overflow-hidden flex flex-col justify-between py-14 sm:py-16 md:py-20">
      {/* Dynamic ambient juice glow flares */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float-slow absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-berry/35 blur-[90px]" />
        <div className="float-slower absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-blush/25 blur-[100px]" />
        <div className="float-slow absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-berry-deep/55 blur-[100px]" />
      </div>

      <div className="shell relative z-10 flex flex-1 flex-col items-center justify-between text-center">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blush/30 bg-berry/20 px-3.5 py-1 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-berry animate-pulse" />
            <p className="eyebrow !text-cream">Cold-Chain Farm Delivery</p>
          </div>

          <h2 className="display mt-4 text-[clamp(2rem,5.5vw,4.2rem)] text-cream">
            Pour yourself
            <br />
            <span className="outline-type">some happiness.</span>
          </h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/75 max-w-md mx-auto">
            Experience the real, unforgettable burst of fresh summer berries in every sip.
            Bottled raw at 4°C with zero compromises.
          </p>
        </motion.div>

        {/* Center Bottle Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative my-4 flex h-[220px] w-full max-w-[320px] sm:h-[280px] md:h-[340px] items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-berry/45 via-blush/25 to-transparent blur-[70px]" />
          <img
            src="/images/bottle-floating-labeled.png"
            alt="Berry Fresh Cold-Pressed Juice"
            className="relative max-h-full w-auto object-contain drop-shadow-[0_25px_60px_rgba(232,17,48,0.65)]"
          />
        </motion.div>

        {/* Bottom Actions & Serving Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3.5"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => scrollToId('product')} className="btn btn-solid">
              Order Fresh Crate
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('about')
              }}
              className="btn btn-ghost"
            >
              Our Heritage
            </a>
          </div>

          <p className="text-[0.74rem] uppercase tracking-[0.16em] text-cream/60 font-semibold">
            750 ml · Best served cold at 4°C · Temperature-controlled delivery
          </p>
        </motion.div>
      </div>
    </section>
  )
}
