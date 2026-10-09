// Proves test traffic never reaches Meta from the browser, and real traffic still does.
// Everything outside localhost is intercepted: no request leaves this machine, and the
// Supabase relay (which would arm real emails/texts) is faked. Run after `npm run build`:
//   python3 -m http.server 4399 -d dist &   node scripts/browser/meta-test-skip.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const BASE = process.env.BASE || "http://localhost:4399";
const QUALIFYING = "$3,000 to $5,000"; // an answer the live page accepts today
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failures++; };

async function visit(browser, { query, email, label }) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const metaRequests = [], relayBodies = [];
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE)) return route.continue();
    if (/facebook\.(com|net)/.test(u)) {
      metaRequests.push(u);
      // fake Meta library: leaves the official snippet's queue intact so we can read what was asked
      return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    }
    if (u.includes("doctors-partial-capture")) {
      relayBodies.push(route.request().postData());
      return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    }
    return route.fulfill({ status: 200, contentType: "text/plain", body: "" }); // clarity, iclosed, fonts...
  });
  await page.goto(`${BASE}/doctors/${query}`);
  await page.fill('input[name="name"]', "Test Person");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="phone"]', "+1 415 555 0134");
  await page.fill('input[name="instagram"]', "testhandle");
  await page.check('input[name="specialty"][value="Other"]', { force: true });
  await page.check(`input[name="investment"][value="${QUALIFYING}"]`, { force: true });
  await page.check('input[name="start"][value="Now"]', { force: true });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500);
  const calls = await page.evaluate(() => {
    const q = (window.fbq && window.fbq.queue) || [];
    return { stub: !!window.fbq && !window.fbq.queue, events: q.map((a) => Array.from(a).slice(0, 2).join(":")) };
  });
  const calendar = await page.evaluate(() => !document.querySelector(".step-cal").hidden);
  await ctx.close();
  console.log(`--- ${label}: meta requests=${metaRequests.length}, fbq calls=${JSON.stringify(calls.events)}, calendar shown=${calendar}, relay posts=${relayBodies.length}`);
  return { metaRequests, calls, calendar, relayBodies };
}

const browser = await chromium.launch({ headless: true, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });

let r = await visit(browser, { query: "?utm_source=facebook&utm_medium=paid", email: "real.person@example.com", label: "REAL visit" });
ok(r.metaRequests.some((u) => u.includes("fbevents.js")), "real visit loads the Meta script");
ok(r.calls.events.includes("track:PageView"), "real visit sends PageView");
ok(r.calls.events.includes("track:Lead"), "real visit sends Lead on submit");
ok(r.calendar, "real visit reaches the calendar");

r = await visit(browser, { query: "?utm_source=test", email: "sidney.laruel+moneytest1@gmail.com", label: "TEST via utm_source=test" });
ok(r.metaRequests.length === 0, "utm_source=test: zero requests to Meta");
ok(r.calls.stub && r.calls.events.length === 0, "utm_source=test: fbq is a do-nothing stub, nothing queued");
ok(r.calendar, "utm_source=test still reaches the calendar");

r = await visit(browser, { query: "?utm_source=test", email: "someone.else@example.com", label: "TEST via utm only (other email)" });
ok(r.metaRequests.length === 0 && r.calls.events.length === 0, "utm only: nothing sent to Meta");

r = await visit(browser, { query: "?utm_source=facebook", email: "sidney.laruel+moneytest2@gmail.com", label: "TEST via email only" });
ok(!r.calls.events.includes("track:Lead"), "test email on a real-looking visit: no Lead");
ok(r.calendar, "test email still reaches the calendar");

r = await visit(browser, { query: "?utm_source=latest_campaign", email: "real2@example.com", label: "word-boundary check" });
ok(r.calls.events.includes("track:Lead"), "utm_source=latest_campaign is NOT treated as a test (still sends Lead)");

r = await visit(browser, { query: "?utm_source=my-test-1", email: "real3@example.com", label: "test inside a longer source" });
ok(r.metaRequests.length === 0, "utm_source=my-test-1 is treated as a test");

// A test visit stays a test on the next page of the same session (iClosed redirect to the thank-you page)
{
  const ctx = await browser.newContext(); const page = await ctx.newPage(); const meta = [];
  await page.route("**/*", (route) => { const u = route.request().url(); if (u.startsWith(BASE)) return route.continue();
    if (/facebook\.(com|net)/.test(u)) meta.push(u); return route.fulfill({ status: 200, body: "" }); });
  await page.goto(`${BASE}/doctors/?utm_source=test`);
  await page.goto(`${BASE}/apply4-thank-you/`);
  ok(meta.length === 0, "test flag survives to the next page in the session (thank-you page sends nothing)");
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
