#!/usr/bin/env node
// Screenshot (and optionally measure) any URL through the relay.
//
//   node scripts/browser/shot.mjs <url> [--out shot.png] [--vw 1440] [--vh 1000]
//        [--wait 6000] [--wait-selector "iframe"] [--scroll-to "#book"]
//        [--sel "#book"] [--full] [--measure "iframe[src*='iclosed']"]
//
// Requires the relay to be running:  node scripts/browser/relay.cjs &
import { launch, newCtx } from './lib.mjs';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
if (!url) { console.error('usage: node shot.mjs <url> [options]'); process.exit(1); }
const opt = (name, def) => {
  const i = args.indexOf('--' + name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const has = (name) => args.includes('--' + name);

const out = opt('out', 'shot.png');
const vw = parseInt(opt('vw', '1440'), 10);
const vh = parseInt(opt('vh', '1000'), 10);
const wait = parseInt(opt('wait', '6000'), 10);
const waitSel = opt('wait-selector', null);
const scrollTo = opt('scroll-to', null);
const sel = opt('sel', null);
const measure = opt('measure', null);

const browser = await launch();
try {
  const ctx = await newCtx(browser, vw, vh);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
  if (waitSel) { try { await page.waitForSelector(waitSel, { timeout: 25000 }); } catch { console.error('(wait-selector not found)'); } }
  if (scrollTo) { const h = await page.$(scrollTo); if (h) await h.scrollIntoViewIfNeeded(); }
  await page.waitForTimeout(wait);
  if (scrollTo) { const h = await page.$(scrollTo); if (h) { await h.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); } }

  if (measure) {
    const m = await page.$$eval(measure, (els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), top: Math.round(r.top) };
    }));
    console.log('measure', measure, JSON.stringify(m));
  }

  if (sel) {
    const h = await page.$(sel);
    if (!h) { console.error('element not found:', sel); process.exit(2); }
    await h.screenshot({ path: out });
  } else {
    await page.screenshot({ path: out, fullPage: has('full') });
  }
  console.log('saved', out, `(${vw}x${vh})`);
} finally {
  await browser.close();
}
