import { useEffect, useRef, useState } from 'react'

export const isMobile =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches

export const dpr = isMobile ? [1, 1.4] : [1, 1.75]

/**
 * True while the element is near the viewport. Used to pause WebGL rendering
 * for off-screen canvases instead of burning GPU on four scenes at once.
 */
export function useInView(rootMargin = '300px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return [ref, inView]
}
