# Seeing websites with a real browser (in this cloud env)

How to actually **render, screenshot, measure, and compare** web pages from a
Claude Code session here — live sites *and* your own local build. This is the
plumbing; once you can render, `docs/pixel-matching-playbook.md` covers the
measure-and-match *method*.

> **The one thing to know:** in this environment a headless browser can't reach
> the internet the naive way — every HTTPS site fails with
> `ERR_CONNECTION_RESET`, even though `curl` works. The fix is a tiny local
> relay that ships in this repo (`scripts/browser/`). Start it, point Chromium
> at it, done. You do **not** need to escalate or change network settings.

---

## TL;DR quickstart

```bash
# 1. Start the TLS-bridge relay (leave it running in the background)
node scripts/browser/relay.cjs &            # listens on 127.0.0.1:8899

# 2. Screenshot any live site
node scripts/browser/shot.mjs https://example.com --out /tmp/ex.png

# 3. Screenshot your OWN change: build to static, serve it, shoot it
npx astro build
npx http-server dist -p 4646 -a 127.0.0.1 --silent &
node scripts/browser/shot.mjs http://127.0.0.1:4646/apply/ \
     --out /tmp/apply.png --wait-selector "iframe" --scroll-to "#book" --wait 9000
```

Then `Read` the PNGs to look at them, and use `--measure "<selector>"` to get
exact pixel geometry instead of eyeballing.

Playwright and Chromium are **preinstalled** (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
Playwright at `/opt/node22/lib/node_modules`). Do **not** run `playwright install`.

---

## Why the relay is needed

The environment routes outbound HTTPS through an egress proxy (`HTTPS_PROXY`,
usually `http://127.0.0.1:39813`). `curl` uses it fine. Chromium does **not**:
the proxy's CONNECT tunnel opens, but the instant Chromium sends its TLS
ClientHello the socket is reset (`net::ERR_CONNECTION_RESET`, `os_error 104`).
Chromium's ClientHello carries GREASE + post-quantum (`X25519MLKEM768`)
extensions that the egress middlebox rejects; curl's/OpenSSL's plainer
ClientHello passes. Disabling those Chrome features via flags does **not** fix it.

**`scripts/browser/relay.cjs`** works around it without weakening egress policy:

```
Chromium --TLS--> [relay terminates TLS] --plaintext HTTP/1.1--> [relay re-TLS] --> origin
                                                                 (via the env CONNECT proxy)
```

Chromium does TLS to the relay (localhost, no middlebox). The relay re-originates
TLS to the real host **through the same env proxy**, using Node's OpenSSL stack
(accepted, exactly like curl). After both ends terminate TLS, the cleartext HTTP
is piped byte-for-byte. Every origin is still reached only via the proxy's
policy-enforced CONNECT — this bridges TLS locally, it does not bypass egress.

The relay also acts as a **plain-HTTP forward proxy**, so a local dev/static
server (`http://127.0.0.1:PORT/...`) routes through it too — no proxy-bypass
juggling, and cross-origin subresources (fonts, CDNs, embedded widgets) still
work.

---

## The tools (`scripts/browser/`)

| File | What it does |
|---|---|
| `relay.cjs` | The TLS-bridge + HTTP forward proxy. Run it first; leave it up. Auto-generates its cert, auto-reads `HTTPS_PROXY`. `RELAY_DEBUG=1` logs each request. |
| `lib.mjs` | Playwright launch helpers — resolves the global Playwright, launches Chromium with the right flags (`--no-sandbox`, `--ignore-certificate-errors`) pointed at the relay, real Chrome UA. Import this in custom scripts. |
| `shot.mjs` | CLI to screenshot/measure a URL. Options below. |

`shot.mjs` options: `--out <file>` `--vw <n>` `--vh <n>` `--wait <ms>`
`--wait-selector "<sel>"` `--scroll-to "<sel>"` `--sel "<sel>"` (shoot one element)
`--full` (full-page) `--measure "<sel>"` (print bounding boxes).

If you need something custom, import the helpers directly:

```js
import { launch, newCtx } from './scripts/browser/lib.mjs';
const browser = await launch();
const ctx = await newCtx(browser, 1440, 1000);
const page = await ctx.newPage();
await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
// ...measure / screenshot...
await browser.close();
```

---

## Recipes

### Screenshot a live site
```bash
node scripts/browser/shot.mjs https://growthopia.io/form --out /tmp/gt.png --wait 9000
```

### Screenshot your own change
Static build is the reliable path (`astro dev` hangs through the relay because of
Vite's HMR websocket). `astro build` output is also closer to what deploys.
```bash
npx astro build
npx http-server dist -p 4646 -a 127.0.0.1 --silent &
node scripts/browser/shot.mjs http://127.0.0.1:4646/<page>/ --out /tmp/mine.png \
     --wait-selector "iframe" --scroll-to "#anchor" --wait 9000
```

### Measure exact geometry (don't eyeball)
```bash
node scripts/browser/shot.mjs <url> --measure "#book" --out /tmp/x.png
```
For content **inside a cross-origin iframe** (e.g. an iClosed/Calendly widget),
Playwright can still reach it — it's not bound by same-origin. In a custom script:
```js
const frame = page.frames().find(f => /app\.iclosed\.io/.test(f.url()));
const box = await frame.evaluate(() => {
  const el = document.querySelector('SOME-SELECTOR');
  const r = el.getBoundingClientRect();
  return { w: Math.round(r.width), left: Math.round(r.left) };
});
```

### Compare to a reference site
Shoot both at the **same viewport**, then `Read` both PNGs and/or compare the
`--measure` numbers. To find a booking/embed's real container width, measure the
iframe's `getBoundingClientRect` on each side and compare.

---

## Gotchas

- **Start the relay first**, and keep it running. If shots suddenly fail with
  `ERR_PROXY_CONNECTION_FAILED`, the relay died — restart it.
- **Background processes:** start the relay / http-server with the tool's
  `run_in_background`, not a bare `&` in a one-off shell (it may not survive the
  call). Avoid `pkill` to stop them — it returns odd exit codes here; prefer
  distinct ports or the harness's task controls.
- **`astro dev` hangs** through the relay (Vite HMR). Use `astro build` + a
  static server (`http-server dist`).
- **Port already in use:** the http-server errors `EADDRINUSE`; pick another
  port or reuse the running one.
- **Wait for JS widgets:** embedded schedulers (iClosed, Calendly, Wistia) inject
  an iframe and render async. Use `--wait-selector "iframe"` plus a generous
  `--wait` (8–11s), and `--scroll-to` the section so it's in view.
- **Transparent iframes:** many embed iframes are transparent and render their
  own card centered inside a fixed-width content area. Check
  `getComputedStyle(document.body).backgroundColor` inside the frame
  (`rgba(0,0,0,0)` = transparent) before assuming a wrapper is needed.
- **Never** disable TLS verification of the egress proxy or unset `HTTPS_PROXY`.
  The relay respects policy — every origin still goes through the proxy's CONNECT.

---

## STEP-0 sanity check

Before a real investigation, confirm egress works end-to-end:
```bash
node scripts/browser/relay.cjs &
node scripts/browser/shot.mjs https://example.com --out /tmp/ex.png --measure h1
```
Expect a saved PNG and `measure h1 [{...}]`. If instead you get
`ERR_CONNECTION_RESET` **without** the relay, that's the expected raw-Chromium
failure — start the relay. If it fails *with* the relay running and `curl
https://example.com` also fails, then egress is genuinely down (escalate).

---

See also: `docs/pixel-matching-playbook.md` (the measure-and-match method once
you can render).
