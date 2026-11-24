import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollToId } from '../smooth'
import { rise } from '../motion'

const SPECS = [
  ['Strawberry Purée', '88%'],
  ['Filtered Spring Water', '10%'],
  ['Cold-Pressed Lemon', '2%'],
  ['Added Sugar / Additives', '0%'],
]

const PRODUCTS = {
  reserve: {
    name: 'Artisan Reserve Bottle',
    size: '750 ml',
    price: '$8.95',
    sub: 'Best for sharing · 3.5 servings',
    img: '/images/bottle-floating-labeled.png',
    badge: 'Most Popular',
  },
  pocket: {
    name: 'Everyday Pocket Bottle',
    size: '350 ml',
    price: '$4.50',
    sub: 'Single morning boost · 1.5 servings',
    img: '/images/bottle-sleek.jpg',
    badge: 'On the Go',
  },
  crate: {
    name: 'Farm Taster Crate (6-Pack)',
    size: '6 × 750 ml',
    price: '$48.00',
    sub: 'Chilled wooden crate · Free express delivery',
    img: '/images/bottle-floating-labeled.png',
    badge: 'Best Value',
  },
}

export default function ProductSection() {
  const [selected, setSelected] = useState('reserve')
  const [toast, setToast] = useState(false)
  const current = PRODUCTS[selected]

  const handleOrder = () => {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  return (
    <section id="product" className="relative overflow-hidden bg-ink py-16 sm:py-24 md:py-36">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-52 top-1/4 h-[480px] w-[480px] rounded-full bg-berry/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-blush/15 blur-[130px]" />

      <div className="shell relative grid items-center gap-10 sm:gap-14 md:grid-cols-2 md:gap-12">
        {/* Left Column: Interactive Product Showcase */}
        <motion.div {...rise} className="relative flex flex-col items-center">
          <div className="relative flex h-[340px] w-full max-w-[480px] items-center justify-center sm:h-[480px] md:h-[580px]">
            {/* Ambient radiant glow behind bottle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-berry/40 via-blush/20 to-transparent blur-[70px]" />

            {/* Product Image with smooth switch animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-full w-full items-center justify-center p-4 sm:p-6"
              >
                <img
                  src={current.img}
                  alt={current.name}
                  className="max-h-[85%] w-auto object-contain drop-shadow-[0_30px_70px_rgba(232,17,48,0.55)] transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            </AnimatePresence>

            {/* Floating feature pills */}
            <div className="pointer-events-none absolute left-2 sm:left-4 top-4 sm:top-8 rounded-full border border-white/15 bg-ink/75 px-3 sm:px-4 py-1 sm:py-1.5 text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-cream/80 backdrop-blur-md shadow-lg">
              100% Raw Juice
            </div>
            <div className="pointer-events-none absolute bottom-4 sm:bottom-8 right-2 sm:right-4 rounded-full border border-white/15 bg-ink/75 px-3 sm:px-4 py-1 sm:py-1.5 text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-berry backdrop-blur-md shadow-lg">
              Keep Chilled at 4°C
            </div>
          </div>

          {/* Product Variant Selector Tabs */}
          <div className="mt-4 grid grid-cols-3 w-full max-w-md gap-1.5 sm:gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 sm:p-1.5 backdrop-blur-md">
            {Object.entries(PRODUCTS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full rounded-xl py-2 sm:py-2.5 text-[0.70rem] sm:text-[0.75rem] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] transition-all duration-300 text-center ${
                  selected === key
                    ? 'bg-berry text-white shadow-lg shadow-berry/30'
                    : 'text-cream/60 hover:text-cream hover:bg-white/5'
                }`}
              >
                {val.size}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Detailed Product Specs & Purchase */}
        <motion.div {...rise}>
          <div className="inline-flex items-center gap-2 rounded-full border border-blush/30 bg-berry/15 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-blush">
            <span>●</span> {current.badge}
          </div>

          <h2 className="display mt-4 text-[clamp(2rem,4vw,3.6rem)] text-cream">
            Strawberry.
            <br />
            <span className="text-berry">Nothing else.</span>
          </h2>

          <p className="mt-5 max-w-[48ch] text-[0.98rem] leading-relaxed text-cream/70">
            Cold-pressed within four hours of harvest, then bottled in ultraviolet glass so the fruit
            never degrades before you taste it. No concentrate, no coloring, no added sugar, zero shortcuts.
          </p>

          {/* Flavor Profile Bars */}
          <div className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
            <div>
              <div className="flex justify-between text-[0.75rem] uppercase tracking-[0.18em] text-cream/60">
                <span>Natural Sweetness</span>
                <span className="font-bold text-cream">94%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-berry to-blush" style={{ width: '94%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[0.75rem] uppercase tracking-[0.18em] text-cream/60">
                <span>Crisp Tartness</span>
                <span className="font-bold text-cream">18%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-berry to-blush" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[0.75rem] uppercase tracking-[0.18em] text-cream/60">
                <span>Sun-Ripened Aroma</span>
                <span className="font-bold text-cream">100%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-berry to-blush" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Ingredient breakdown table */}
          <dl className="mt-8 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2">
            {SPECS.map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between border-b border-white/10 py-3.5 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6"
              >
                <dt className="text-[0.76rem] uppercase tracking-[0.16em] text-cream/55">{k}</dt>
                <dd className="font-display text-lg font-bold text-cream">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Pricing & Order Section */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            <div>
              <p className="text-[0.68rem] sm:text-[0.7rem] uppercase tracking-[0.2em] text-cream/50 font-semibold">
                Current Selection
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-cream">{current.price}</span>
                <span className="text-xs sm:text-sm text-cream/60">/ {current.size}</span>
              </div>
            </div>

            <button onClick={handleOrder} className="btn btn-solid w-full sm:w-auto !py-3 !px-8 text-center justify-center">
              Order Chilled Bottle
            </button>
          </div>

          {/* Confirmation toast message */}
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-berry/40 bg-berry/20 p-3 text-center text-sm font-semibold text-cream backdrop-blur-md"
            >
              ✓ Added {current.name} to your cold-chain delivery!
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
