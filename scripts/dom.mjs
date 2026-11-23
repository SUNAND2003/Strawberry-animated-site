/* DOM-level verification: emoji gone, SVG icons present, nav styling.
 *   node scripts/dom.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core'

const EDGE =
  process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.argv[2] || 'http://127.0.0.1:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-first-run', '--disable-gpu', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
})
const page = await browser.newPage()
const problems = []
page.on('pageerror', (e) => problems.push('[pageerror] ' + e.message))
page.on('console', (m) => {
  if (m.type() === 'error') problems.push('[console] ' + m.text())
})
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await sleep(4000)

const report = await page.evaluate(() => {
  const EMOJI = /\p{Extended_Pictographic}/gu
  const out = { sections: {}, emoji: [], nav: {}, overflow: {} }

  for (const id of ['about', 'ingredients', 'cta', 'product']) {
    const sec = document.getElementById(id)
    if (!sec) continue
    out.sections[id] = {
      svgs: sec.querySelectorAll('svg').length,
      texts: [...sec.querySelectorAll('h2,h3')].map((e) => e.textContent.trim()).slice(0, 6),
    }
  }

  // any emoji left anywhere in the copy? (ignore the copyright sign)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent
    const m = t.match(EMOJI)
    if (m) out.emoji.push([...new Set(m)].join(' ') + ' <- ' + t.trim().slice(0, 40))
  }

  const header = document.querySelector('header')
  out.nav = {
    logoSvg: header.querySelector('a svg') ? 'yes' : 'NO',
    headerH: Math.round(header.getBoundingClientRect().height),
  }

  // horizontal overflow
  out.overflow = {
    innerWidth: window.innerWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }

  // nav solid state after scrolling
  return out
})

// scroll and re-check the nav background
await page.evaluate(() => window.__lenis && window.__lenis.scrollTo(1200, { immediate: true }))
await sleep(900)
const navAfter = await page.evaluate(() => {
  const h = document.querySelector('header')
  const cs = getComputedStyle(h)
  return { bg: cs.backgroundColor, border: cs.borderBottomColor, cls: h.className }
})

console.log(JSON.stringify(report, null, 2))
console.log('nav after scroll:', JSON.stringify(navAfter))
console.log('problems:', problems.length ? problems.join('\n') : 'none')
await browser.close()
