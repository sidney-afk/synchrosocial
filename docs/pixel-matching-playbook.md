# Pixel-Matching Playbook

How to rebuild a page to match a reference site as closely as possible —
exact fonts, sizes, colors, spacing, and layout.

**The core idea:** don't copy the source code, **measure the rendered pixels.**
A real headless browser loads the reference site; you read `getComputedStyle()`
and `getBoundingClientRect()` off each element to get its exact font, size,
color, spacing, and position, then rebuild to those numbers and re-measure
until they match. Framer/Webflow generate gibberish class names and inline
styles, so measuring the *output* beats reading the *input*.

This is the method used to rebuild `/`, `/v2`, `/apply`, and `/ai` in this repo.

---

## Hand this to a new session

Paste the block below into a fresh Claude Code session (it works on any repo —
just fill in the two URLs):

```
GOAL: Rebuild <PAGE I'M BUILDING> to match <REFERENCE URL> as closely as possible —
exact fonts, sizes, colors, spacing, and layout. Measure the reference in a real
browser; don't eyeball it and don't trust the source CSS class names.

ENVIRONMENT (do this first):
- This session's network access must be "Full" (so you can reach the reference
  site and its font/CDN assets). If it's restricted, tell me to change it.
- IMPORTANT: in the current cloud env, curl works but a headless browser gets
  ERR_CONNECTION_RESET on every HTTPS site — the egress proxy rejects Chromium's
  TLS ClientHello, and --ignore-certificate-errors alone does NOT fix it. Use the
  relay + helpers in scripts/browser/ (see docs/headless-browser-in-this-env.md):
  `node scripts/browser/relay.cjs &` then screenshot via scripts/browser/shot.mjs
  or import scripts/browser/lib.mjs. Playwright + Chromium are preinstalled
  (/opt/pw-browsers) — do not run `playwright install`.
- If you write a custom Playwright script, launch with args
  ['--no-sandbox','--ignore-certificate-errors'], proxy at the relay, context
  ignoreHTTPSErrors:true, and a real Chrome user-agent (lib.mjs does all this).

METHOD:
1. Fetch the reference HTML:  curl -sL <REFERENCE URL> -o ref.html
2. Dump a DOM outline to learn section order, structure, and real text content:
   a Python HTMLParser that prints an indented tree, skipping script/style/svg.
3. THE KEY STEP — probe computed styles in the browser. Write a Playwright script
   that, for BOTH the reference and my build:
   - loads the page, waits, then scrolls top->bottom in steps to trigger lazy content
   - for a list of text snippets (one per element I care about), finds the deepest
     VISIBLE element whose text contains that snippet (prefer the element whose
     own direct text node matches - class names differ between sites, so key off
     TEXT, not selectors)
   - records getComputedStyle + getBoundingClientRect:
     fontFamily/weight/size/lineHeight, color, backgroundColor/Image, borderRadius,
     padding, letterSpacing, textTransform, and width/height/x/y
   - prints reference vs mine side by side so differences are obvious as numbers
4. Screenshot both at the same viewport (1440px wide), full-page plus per-scroll
   slices, and actually look at the images.
5. Rebuild to the measured numbers - exact px, exact hex, exact spacing. (If I'm
   re-coloring to a different brand, keep the geometry/typography identical and
   only swap the palette.)
6. Re-run the probe + screenshots and ITERATE until the numbers match.
7. After deploy, curl the live URL to confirm the new build is actually serving.

GOTCHAS:
- Match the FONTS first. A wrong font family throws off every downstream
  measurement. Find them via the @font-face / font-family declarations in the
  source, and load the same families (Google Fonts / Fontshare).
- Responsive widths: measure at TWO viewports (e.g. 1440 and 1920). If a width
  changes, it's a % / vw rule, not a fixed px - replicate the rule, not one value.
- "Exact same" -> trust the probe numbers. "Close but better" -> screenshot-compare
  and use judgment; fix the parts that are genuinely ugly.
- If the preview server returns 0 bytes / connection refused, restart it.
```

---

## The probe script (the crux of step 3)

Save inside the project dir, fill in `KEYS` and the two URLs, run with `node`.
It turns "looks a bit off" into a column of numbers you can drive to zero.

```js
const { chromium } = require('playwright');
const KEYS = ['Headline text', 'A subhead snippet', 'Button label', /* … */];
(async () => {
  const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const out = {};
  for (const [name, url] of [['ref', '<REFERENCE URL>'], ['ours', '<MY URL>']]) {
    const page = await ctx.newPage();
    try { await page.goto(url, { waitUntil: 'load', timeout: 45000 }); } catch {}
    await page.waitForTimeout(4000);
    await page.evaluate(async () => { const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    out[name] = await page.evaluate((keys) => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
      const res = {};
      for (const k of keys) {
        let best = null;
        for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,div')) {
          if (!el.textContent || !el.textContent.includes(k) || !vis(el)) continue;
          const direct = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
          const score = direct.includes(k.slice(0, 10)) ? 0 : el.textContent.length;
          if (!best || score <= best.score) best = Object.assign(el, { score });
        }
        if (!best) { res[k] = null; continue; }
        const cs = getComputedStyle(best), r = best.getBoundingClientRect();
        res[k] = { w:+r.width.toFixed(0), h:+r.height.toFixed(0), x:+r.x.toFixed(0), y:+(r.y+scrollY).toFixed(0),
          font:`${cs.fontFamily.split(',')[0].replace(/"/g,'')} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight}`,
          color:cs.color, bg:cs.backgroundColor, radius:cs.borderRadius, pad:cs.padding,
          ls:cs.letterSpacing, tt:cs.textTransform };
      }
      return res;
    }, KEYS);
    await page.close();
  }
  for (const k of KEYS) { console.log('==', k); console.log('  ref :', JSON.stringify(out.ref[k])); console.log('  ours:', JSON.stringify(out.ours[k])); }
  await browser.close();
})();
```

---

## Supporting techniques

**DOM outline** (step 2) — a Python `HTMLParser` that prints an indented tree of
tags + classes + text, skipping `script`/`style`/`svg`. Tells you section order
and the real copy before you write a line.

**Flatten the CSS** (useful for Webflow, where real stylesheets exist) — download
the linked `.css` and rewrite every rule as one grep-able line, carrying the
`@media` context, e.g. `@media (max-width:991px) :: .selector :: body`. Then grep
for a class to see its value across all breakpoints at once. (Less useful for
Framer, which is mostly computed/inline — there the browser probe is everything.)

**Screenshots** — capture both pages at the same viewport, full-page and in
per-scroll-offset slices, and read them as images. Numbers catch typography and
spacing; eyes catch overlap, z-index, and "this just looks wrong."

**Verify after deploy** — `curl` the live URL and grep for a known marker from the
new build, so you confirm what's actually serving rather than assuming the deploy
worked.
