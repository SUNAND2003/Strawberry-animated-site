import { motion } from 'framer-motion'
import { stagger } from '../motion'
import { IconBerry, IconBottle, IconIce } from './Icons'

const CARDS = [
  {
    Icon: IconBerry,
    n: '01',
    proportion: '88% of Volume',
    title: 'Sun-ripened strawberries',
    image: '/images/strawberry-sliced.png',
    text: 'Picked at full colour during the natural 9-hour sugar peak. Hand-sliced and pressed raw to preserve vitamins, active enzymes, and summer fragrance.',
    tags: ['Albion & Camarosa', 'Hand-Selected', 'Never Gassed'],
  },
  {
    Icon: IconBottle,
    n: '02',
    proportion: '2% of Volume',
    title: 'Cold-pressed Meyer lemon',
    image: '/images/strawberry-splash.png',
    text: 'A delicate touch of organic cold-pressed lemon acts as a natural antioxidant, locking in the brilliant ruby hue and balancing the natural fruit sugars.',
    tags: ['Organic Meyer Lemon', 'Natural Antioxidant', 'Zero Additives'],
  },
  {
    Icon: IconIce,
    n: '03',
    proportion: '10% of Volume',
    title: 'Glacial spring water',
    image: '/images/bottle-sleek.jpg',
    text: 'Lightly balanced with pure filtered mountain spring water for a silky, thirst-quenching mouthfeel. Best served chilled at 4°C poured over ice.',
    tags: ['Natural Minerals', 'Silky Mouthfeel', 'Served Cold at 4°C'],
  },
]

export default function IngredientsSection() {
  return (
    <section
      id="ingredients"
      className="relative overflow-hidden bg-cream-2 py-24 text-ink md:py-36"
    >
      {/* Soft atmospheric background blur orbs */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[350px] w-[350px] rounded-full bg-berry/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blush/20 blur-[130px]" />

      <div className="shell relative">
        <motion.div {...stagger(0)} className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-berry/20 bg-berry/10 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-berry-deep">
            <span>●</span> Pure Transparency
          </div>
          <h2 className="display mt-5 text-[clamp(2.1rem,4.2vw,3.4rem)] text-ink">
            Three ingredients.
            <br />
            <span className="text-berry">That is the whole list.</span>
          </h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/70">
            No synthetic preservatives, no artificial sweeteners, no thickeners. Just pure living fruit.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <motion.article
              key={c.n}
              {...stagger(i + 1)}
              className="glass group flex flex-col justify-between overflow-hidden rounded-[30px] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_75px_-35px_rgba(157,11,34,0.65)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-berry/10 text-berry transition-all duration-500 group-hover:scale-110 group-hover:bg-berry/20">
                    <c.Icon className="h-6 w-6" />
                  </span>
                  <div className="text-right">
                    <span className="font-display text-[0.75rem] font-bold tracking-[0.2em] text-berry">
                      {c.n}
                    </span>
                    <p className="text-[0.68rem] uppercase tracking-[0.14em] text-ink/50 font-semibold">{c.proportion}</p>
                  </div>
                </div>

                {/* Ingredient Visual Thumbnail */}
                <div className="mt-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/40 p-3">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-md"
                  />
                </div>

                <h3 className="mt-6 font-display text-[1.35rem] font-bold leading-tight text-ink">
                  {c.title}
                </h3>
                <p className="mt-3 text-[0.94rem] leading-relaxed text-ink/70">{c.text}</p>
              </div>

              {/* Tag Pills */}
              <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/10 pt-5">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-berry/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-berry-deep"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
