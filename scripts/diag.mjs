import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.argv[2] || 'http://127.0.0.1:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-first-run', '--disable-gpu', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
})

const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await sleep(3500)

const report = await page.evaluate(() => {
  const out = []
  const info = (label, el) => {
    if (!el) return out.push(`${label}: MISSING`)
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    out.push(
      `${label}: x=${r.x.toFixed(0)} w=${r.width.toFixed(0)} right=${r.right.toFixed(0)} | ` +
        `fontSize=${cs.fontSize} lineHeight=${cs.lineHeight} fontFamily=${cs.fontFamily.split(',')[0]} | ` +
        `width=${cs.width} marginLeft=${cs.marginLeft}`
    )
  }
  out.push(`innerWidth=${window.innerWidth} docScrollWidth=${document.documentElement.scrollWidth} bodyScrollWidth=${document.body.scrollWidth}`)
  info('div.container (product)', document.querySelector('#product .container'))
  info('div.container (about)', document.querySelector('#about .container'))
  info('#product h2', document.querySelector('#product h2'))
  info('#about h2', document.querySelector('#about h2'))
  info('#cta h2', document.querySelector('#cta h2'))
  info('.hero-copy', document.querySelector('.hero-copy'))
  info('.hero-copy h1', document.querySelector('.hero-copy h1'))
  info('.final-wrap .js-final p:last-child', document.querySelector('.final-wrap .js-final p:last-child'))
  info('.stage', document.querySelector('.stage'))
  info('.experience', document.querySelector('.experience'))

  // does tailwind's container utility beat ours?
  const sheets = [...document.styleSheets]
  let containerRules = []
  for (const s of sheets) {
    let rules
    try { rules = [...s.cssRules] } catch { continue }
    const walk = (rs, depth) => {
      for (const r of rs) {
        if (r.cssRules) walk(r.cssRules, depth + 1)
        else if (r.selectorText && /\.container\b/.test(r.selectorText)) containerRules.push(`[layer:${r.parentRule?.name || 'root'}] ${r.selectorText} { ${r.style.cssText} }`)
      }
    }
    walk(rules, 0)
  }
  out.push('--- .container rules ---')
  out.push(...containerRules)

  // text overflow check: does the painted text exceed its box?
  out.push('--- text overflow ---')
  for (const sel of ['#product h2', '#about h2', '#cta h2', '.hero-copy h1', '.final-wrap p']) {
    const el = document.querySelector(sel)
    if (!el) continue
    const range = document.createRange()
    range.selectNodeContents(el)
    const tr = range.getBoundingClientRect()
    const br = el.getBoundingClientRect()
    out.push(
      `${sel}: textW=${tr.width.toFixed(0)} boxW=${br.width.toFixed(0)} textRight=${tr.right.toFixed(0)} fontSize=${getComputedStyle(el).fontSize}`
    )
  }
  return out
})

console.log(report.join('\n'))
await browser.close()
