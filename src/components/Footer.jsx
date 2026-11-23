import { useState } from 'react'
import BerrySVG from './BerrySVG'
import { scrollToId } from '../smooth'

const LINKS = [
  ['Story', 'about'],
  ['The Bottle', 'product'],
  ['Ingredients', 'ingredients'],
  ['Order Crate', 'cta'],
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSub = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 4000)
  }

  return (
    <footer className="relative border-t border-white/10 bg-ink pt-16 pb-12">
      <div className="shell flex flex-col gap-12">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('home')
              }}
              className="inline-flex items-center gap-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-berry/20 border border-berry/30">
                <BerrySVG className="h-5 w-5 text-berry" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-[-0.02em] text-cream">
                Berry<span className="text-berry">Fresh</span>
              </span>
            </a>

            <p className="max-w-sm text-[0.92rem] leading-relaxed text-cream/65">
              100% pure cold-pressed strawberry juice. Hand-picked at dawn, bottled in dark violet glass,
              delivered cold within 24 hours.
            </p>

            <div className="flex gap-4 text-[0.74rem] uppercase tracking-[0.12em] text-cream/50 pt-2 font-medium">
              <span>100% Organic</span>
              <span>•</span>
              <span>Raw & Unheated</span>
              <span>•</span>
              <span>Zero Plastic</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[0.74rem] uppercase tracking-[0.16em] text-cream/40 font-bold">Explore</p>
            <nav className="flex flex-col gap-2.5">
              {LINKS.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId(id)
                  }}
                  className="text-[0.84rem] text-cream/70 transition-colors hover:text-berry"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter Signup */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-[0.74rem] uppercase tracking-[0.16em] text-cream/40 font-bold">Orchard Dispatch</p>
            <p className="text-[0.88rem] text-cream/65">
              Subscribe for harvest release dates and seasonal limited crush batches.
            </p>

            <form onSubmit={handleSub} className="flex gap-2 pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[0.85rem] text-cream placeholder-cream/40 focus:border-berry focus:outline-none backdrop-blur-md"
              />
              <button type="submit" className="btn btn-solid !px-5 !py-2.5 !text-[0.7rem] shrink-0">
                Join
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-berry font-semibold">✓ You're on the harvest list!</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-[0.72rem] uppercase tracking-[0.18em] text-cream/40 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} Berry Fresh Farm Co. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-cream cursor-pointer">Privacy Policy</span>
            <span className="hover:text-cream cursor-pointer">Terms of Service</span>
            <span className="hover:text-cream cursor-pointer">Sustainability Report</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
