// Scripted browser check of every Meta event the site sends: page URL, fbc, fbp, event_id,
// and the server copy posted to the Conversions API relay.
// Meta's real pixel script runs, but it is served from a local copy and every request to
// Meta is caught here and answered locally: NOTHING reaches Meta, and the relay is a fake
// address that is also caught. Run after building twice:
//   PUBLIC_META_CAPI_RELAY_URL=https://relay.invalid/functions/v1/meta-capi-relay npx astro build && mv dist /tmp/dist-relay
//   npx astro build
//   curl -so /tmp/fb/fbevents.js https://connect.facebook.net/en_US/fbevents.js
//   DIST=/tmp/dist-relay FB_DIR=/tmp/fb node scripts/browser/meta-events.test.mjs
// Without FB_DIR, a stand-in for Meta's script records the fbq calls instead.
import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const DIST = process.env.DIST || "dist";
const PORT = 4401;
const BASE = `http://localhost:${PORT}`;
const FB_DIR = process.env.FB_DIR || "";
let failures = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) failures++; };

const server = spawn("python3", ["-m", "http.server", String(PORT), "-d", DIST], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));

function parsePixel(url, post) {
  const p = new URLSearchParams(new URL(url).search);
  if (post) for (const [k, v] of new URLSearchParams(post)) p.set(k, v);
  return { ev: p.get("ev"), dl: p.get("dl"), eid: p.get("eid"), fbc: p.get("fbc") || "", fbp: p.get("fbp") || "", cd: p.get("cd[content_name]") || "" };
}

async function newCtx(browser) {
  // A normal Chrome user agent: Meta's script drops events from "HeadlessChrome".
  const ctx = await browser.newContext({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" });
  const log = { pixel: [], relay: [], otherMeta: [] };
  await ctx.route("**/*", (route) => {
    const req = route.request(); const u = req.url();
    if (u.startsWith(BASE)) return route.continue();
    if (u.includes("connect.facebook.net/en_US/fbevents.js") && FB_DIR)
      return route.fulfill({ status: 200, contentType: "application/javascript", body: fs.readFileSync(`${FB_DIR}/fbevents.js`) });
    if (u.includes("connect.facebook.net/signals/config/") && FB_DIR) {
      // The config must match the script version, so download the exact file asked for
      // (a plain script download, no event data), once per run.
      if (!configCache) configCache = execFileSync("curl", ["-sS", u], { maxBuffer: 1 << 24 });
      return route.fulfill({ status: 200, contentType: "application/javascript", body: configCache });
    }
    if (/facebook\.com\/tr/.test(u)) { log.pixel.push(parsePixel(u, req.postData())); return route.fulfill({ status: 200, body: "" }); }
    if (u.includes("relay.invalid")) {
      if (req.method() === "POST") log.relay.push(JSON.parse(req.postData()));
      return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" }, body: '{"ok":true}' });
    }
    if (/facebook|fbcdn|on\.aws|run\.app/.test(u)) log.otherMeta.push(u.slice(0, 120));
    if (u.includes("doctors-partial-capture")) return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    return route.fulfill({ status: 200, contentType: "text/plain", body: "" });
  });
  return { ctx, log };
}
let configCache = null;
const settle = (page, ms = 2500) => page.waitForTimeout(ms);
function table(title, log) {
  console.log(`\n--- ${title}`);
  for (const e of log.pixel) console.log(`  browser  ${String(e.ev).padEnd(19)} eid=${(e.eid || "-").slice(0, 36).padEnd(36)} dl=${e.dl}\n           fbc=${e.fbc || "-"}  fbp=${e.fbp || "-"}`);
  for (const e of log.relay) console.log(`  server   ${String(e.event_name).padEnd(19)} eid=${e.event_id.padEnd(36)} url=${e.event_source_url}\n           fbc=${e.fbc || "-"}  fbp=${e.fbp || "-"}`);
}
const browser = await chromium.launch({ headless: true, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });

// 1. Ad click landing on /doctors, types an email, submits; then visits /apply in the same visit.
{
  const { ctx, log } = await newCtx(browser);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/doctors/?utm_source=facebook&utm_campaign=doctors_test&fbclid=IwAR_PIXELFIX_123`);
  await settle(page);
  await page.fill('input[name="email"]', "real.person@example.com");
  await page.press('input[name="email"]', "Tab"); // commit the field -> change event
  await settle(page, 1200);
  await page.fill('input[name="name"]', "Test Person");
  await page.fill('input[name="phone"]', "+1 415 555 0134");
  await page.fill('input[name="instagram"]', "testhandle");
  await page.check('input[name="specialty"][value="Other"]', { force: true });
  await page.check('input[name="investment"][value="Yes"]', { force: true });
  await page.check('input[name="start"][value="Now"]', { force: true });
  await page.click('button[type="submit"]');
  await settle(page, 1500);
  const ids = await page.evaluate(() => window.__metaIds());
  const cookies = await ctx.cookies();
  table("AD VISIT: /doctors (fbclid in URL, no cookies yet)", log);
  console.log("  cookies:", cookies.filter((c) => c.name.startsWith("_fb")).map((c) => `${c.name}=${c.value}`).join("  "));

  const byEv = (ev) => log.pixel.filter((e) => e.ev === ev);
  const relayBy = (ev) => log.relay.filter((e) => e.event_name === ev);
  for (const ev of ["PageView", "ViewContent", "DoctorEmailEntered", "Lead"]) {
    const b = byEv(ev);
    if (FB_DIR) {
      ok(b.length === 1, `${ev}: browser event sent once`);
      ok(b[0] && /\/doctors\/\?/.test(b[0].dl), `${ev}: browser URL has the /doctors path`);
      ok(b[0] && /^fb\.1\.\d+\.IwAR_PIXELFIX_123$/.test(b[0].fbc), `${ev}: browser fbc built from fbclid`);
      ok(b[0] && /^fb\.1\.\d+\.\d+$/.test(b[0].fbp), `${ev}: browser fbp present`);
      ok(b[0] && b[0].eid, `${ev}: browser event_id present`);
    }
    const s = relayBy(ev);
    if (process.env.DIST) {
      ok(s.length === 1, `${ev}: server copy posted once`);
      ok(s[0] && s[0].event_source_url.startsWith(`${BASE}/doctors/?`), `${ev}: server URL has the /doctors path`);
      ok(s[0] && s[0].fbc === ids.fbc && s[0].fbp === ids.fbp, `${ev}: server fbc/fbp equal the browser's`);
      if (FB_DIR) ok(s[0] && b[0] && s[0].event_id === b[0].eid, `${ev}: server event_id equals browser eid (dedup)`);
    }
  }
  ok(!JSON.stringify(log).includes("real.person@example.com"), "the typed email is never in any Meta request or relay post");

  log.pixel.length = 0; log.relay.length = 0;
  await page.goto(`${BASE}/apply/`); // no fbclid on this URL
  await settle(page);
  table("SAME VISIT: next page /apply (no fbclid in URL)", log);
  for (const e of log.pixel) ok(e.fbc === ids.fbc, `/apply ${e.ev}: fbc kept for the visit`);
  for (const e of log.relay) ok(e.fbc === ids.fbc && e.event_source_url === `${BASE}/apply/`, `/apply ${e.event_name}: server copy keeps fbc and the /apply URL`);
  console.log("  other Meta endpoints called (caught, not sent):", [...new Set(log.otherMeta.map((u) => new URL(u).host))].join(", ") || "none");
  await ctx.close();
}

// 2. Visits that must never reach Meta.
for (const src of ["test", "referral", "outbound_dm"]) {
  const { ctx, log } = await newCtx(browser);
  const page = await ctx.newPage();
  const metaHits = [];
  page.on("request", (r) => { if (/facebook|relay\.invalid/.test(r.url())) metaHits.push(r.url()); });
  await page.goto(`${BASE}/doctors/?utm_source=${src}&fbclid=IwAR_SHOULD_NOT_SEND`);
  await settle(page, 1200);
  await page.fill('input[name="email"]', "someone@example.com");
  await page.press('input[name="email"]', "Tab");
  await settle(page, 1000);
  await page.goto(`${BASE}/apply4-thank-you/`); // next page in the same visit
  await settle(page, 1000);
  await page.goto(`${BASE}/ai-invite/index.html`); // a static page with its own pixel snippet
  await settle(page, 1000);
  ok(metaHits.length === 0 && log.pixel.length === 0 && log.relay.length === 0, `utm_source=${src}: zero requests to Meta or the relay, on /doctors and on the next pages`);
  await ctx.close();
}
{
  const { ctx } = await newCtx(browser);
  const page = await ctx.newPage(); const hits = [];
  page.on("request", (r) => { if (/facebook/.test(r.url())) hits.push(r.url()); });
  await page.goto(`${BASE}/ai-invite/schedule-clients.html?utm_source=outbound_dm`);
  await settle(page, 1000);
  ok(hits.length === 0, "static ai-invite page with utm_source=outbound_dm: nothing to Meta");
  await ctx.close();
}

// 3. Real-looking visit with the owner's test email: no DoctorEmailEntered, no Lead.
{
  const { ctx, log } = await newCtx(browser);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/doctors/?utm_source=facebook`);
  await settle(page);
  await page.fill('input[name="email"]', "sidney.laruel+pixelfix@gmail.com");
  await page.press('input[name="email"]', "Tab");
  await settle(page, 1000);
  const evs = log.pixel.map((e) => e.ev).concat(log.relay.map((e) => e.event_name));
  ok(!evs.includes("DoctorEmailEntered"), "test email: no DoctorEmailEntered");
  await ctx.close();
}

// 4. Organic visit (no fbclid, no cookie): fbp still present, no made-up fbc.
{
  const { ctx, log } = await newCtx(browser);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await settle(page);
  table("ORGANIC VISIT: / (no fbclid)", log);
  for (const e of log.relay) ok(!e.fbc && /^fb\.1\./.test(e.fbp), `organic ${e.event_name}: fbp present, no fbc invented`);
  await ctx.close();
}

await browser.close();
server.kill();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
