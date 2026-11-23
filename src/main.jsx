// Suppress upstream R3F Clock deprecation warning until @react-three/fiber transitions to THREE.Timer
const _warn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.Clock') || args[0].includes('Clock: This module has been deprecated'))
  ) {
    return
  }
  _warn.apply(console, args)
}

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// NOTE: StrictMode is intentionally omitted — GSAP timelines, Lenis and
// WebGL contexts are singletons that should mount exactly once.
createRoot(document.getElementById('root')).render(<App />)
