/* Automated visual smoke test: screenshots the page at key scroll positions
 * and reports any console/page errors.
 *
 *   node scripts/shot.mjs [baseUrl] [outDir]
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const EDGE =
  process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.argv[2] || 'http://127.0.0.1:4173/'
const OUT = process.argv[3] || 'shots'

mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    '--window-size=1440,900',
  ],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
})

const page = await browser.newPage()
const problems = []
page.on('console', (m) => {
  const t = m.type()
  if (t === 'error' || t === 'warning') problems.push(`[${t}] ${m.text()}`)
})
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => {
  const u = r.url()
  if (!u.includes('fonts.g')) problems.push(`[requestfailed] ${u} — ${r.failure()?.errorText}`)
})

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await sleep(4000)

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot:', name)
}

/* Force rendering opportunities: headless only delivers IntersectionObserver
 * callbacks / rAF when a frame is actually produced, which is why a plain
 * sleep() is not enough for framer-motion's whileInView reveals. */
async function frames(n = 6) {
  await page.evaluate(
    (n) =>
      new Promise((res) => {
        let i = 0
        const step = () => (++i >= n ? res() : requestAnimationFrame(step))
        requestAnimationFrame(step)
      }),
    n
  )
}

/* Wait until every top-level reveal in the section has finished. */
async function settleSection(id, timeout = 6000) {
  const t0 = Date.now()
  for (;;) {
    await frames(4)
    const done = await page.evaluate((id) => {
      const sec = document.getElementById(id)
      if (!sec) return true
      const nodes = [...sec.querySelectorAll('.shell > div, .final-wrap > div')]
      if (!nodes.length) return true
      return nodes.every((n) => parseFloat(getComputedStyle(n).opacity) > 0.985)
    }, id)
    if (done) return
    if (Date.now() - t0 > timeout) return
    await sleep(150)
  }
}

async function scrollTo(y, settle = 1600) {
  await page.evaluate((v) => {
    if (window.__lenis) window.__lenis.scrollTo(v, { immediate: true })
    else window.scrollTo(0, v)
  }, y)
  await sleep(settle)
}

/* ---------- act 1: the scroll story ---------- */
await frames(20)
await sleep(1500)
await shot('01-hero')

const story = await page.evaluate(() => {
  const el = document.querySelector('.experience')
  const top = el.getBoundingClientRect().top + window.scrollY
  return { top, range: el.offsetHeight - window.innerHeight }
})

for (const [i, t] of [0.2, 0.33, 0.46, 0.58, 0.7, 0.84, 0.99].entries()) {
  await scrollTo(story.top + story.range * t, 1800)
  await shot(`02-story-${String(i + 1).padStart(2, '0')}-p${Math.round(t * 100)}`)
}

/* ---------- act 2: content sections ---------- */
for (const id of ['product', 'about', 'ingredients', 'cta']) {
  await page.evaluate((id) => {
    const el = document.getElementById(id)
    const y = el.getBoundingClientRect().top + window.scrollY
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)
  }, id)
  await settleSection(id)
  await sleep(500)
  await shot(`03-${id}`)
}

/* ---------- mobile ---------- */
const mobile = await browser.newPage()
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true })
mobile.on('pageerror', (e) => problems.push(`[mobile pageerror] ${e.message}`))
await mobile.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await sleep(4000)
await mobile.screenshot({ path: `${OUT}/04-mobile-hero.png` })
console.log('shot: 04-mobile-hero')

console.log('\n--- problems ---')
console.log(problems.length ? [...new Set(problems)].join('\n') : 'none')

await browser.close()
