/* Clipped screenshot of the scroll story at a given progress.
 *   node scripts/zoom.mjs <t> [x y w h] [out]
 */
import puppeteer from 'puppeteer-core'

const EDGE =
  process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://127.0.0.1:4173/'
const t = parseFloat(process.argv[2] || '0.46')
const [x, y, w, h] = (process.argv[3] || '0,0,1440,900').split(',').map(Number)
const OUT = process.argv[4] || `shots/zoom-p${Math.round(t * 100)}.png`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-first-run', '--disable-gpu', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await sleep(4000)

const story = await page.evaluate(() => {
  const el = document.querySelector('.experience')
  return { top: el.getBoundingClientRect().top + window.scrollY, range: el.offsetHeight - window.innerHeight }
})

await page.evaluate(
  (v) => (window.__lenis ? window.__lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v)),
  story.top + story.range * t
)
await sleep(2200)
// force frames so the scrubbed timeline settles
await page.evaluate(
  () => new Promise((res) => { let i = 0; const s = () => (++i >= 8 ? res() : requestAnimationFrame(s)); requestAnimationFrame(s) })
)
await sleep(600)

// `clip` is expressed in document space, and the page is scrolled — offset it.
const sy = await page.evaluate(() => window.scrollY)
await page.screenshot({
  path: OUT,
  clip: { x, y: sy + y, width: w, height: h },
  captureBeyondViewport: false,
})
console.log('zoom ->', OUT)
await browser.close()
