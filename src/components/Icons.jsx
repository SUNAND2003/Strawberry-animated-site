/**
 * Line icons drawn by hand so the site never falls back on emoji glyphs —
 * they render inconsistently across platforms and cheapen the whole look.
 */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconBerry({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M12 21.2c-3.5 0-6.3-2.9-6.3-6.6 0-3.9 2.8-7.1 6.3-7.1s6.3 3.2 6.3 7.1c0 3.7-2.8 6.6-6.3 6.6Z" />
      <path d="M12 7.5V4.4" />
      <path d="M12 5.6C10.5 3.7 8.6 3 6.7 3.2c.4 1.9 1.7 3.4 3.5 4.1" />
      <path d="M12 5.6c1.5-1.9 3.4-2.6 5.3-2.4-.4 1.9-1.7 3.4-3.5 4.1" />
      <path d="M9.7 12.6h.01M12 14.6h.01M14.3 12.6h.01M10.6 17h.01M13.4 17h.01" />
    </svg>
  )
}

export function IconBottle({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M10 2.8h4v3c0 .9.4 1.7 1 2.3l.6.6c.6.6 1 1.4 1 2.3v7.4c0 1.5-1.2 2.7-2.7 2.7H9.1c-1.5 0-2.7-1.2-2.7-2.7v-7.4c0-.9.4-1.7 1-2.3l.6-.6c.6-.6 1-1.4 1-2.3v-3Z" />
      <path d="M6.5 13.6h11" />
      <path d="M9.4 2.8V1.6h5.2v1.2" />
    </svg>
  )
}

export function IconIce({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M12 2.8 20 7v10l-8 4.2L4 17V7l8-4.2Z" />
      <path d="M4 7l8 4.2L20 7" />
      <path d="M12 11.2v10" />
    </svg>
  )
}

export function IconSunrise({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M12 3.2v3.4M5.4 6.6l2 2M18.6 6.6l-2 2" />
      <path d="M7.8 16.4a4.2 4.2 0 0 1 8.4 0" />
      <path d="M2.8 16.4h18.4M4.8 20.4h14.4" />
    </svg>
  )
}

export function IconStopwatch({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <circle cx="12" cy="13.8" r="7.4" />
      <path d="M9.6 2.6h4.8M12 2.6v3.8M18.9 7.6l1.7-1.7" />
      <path d="M12 13.8V10.2M12 13.8l2.7 1.7" />
    </svg>
  )
}
