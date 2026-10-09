// Proves the /doctors $3,000 question end to end in the BROWSER, with every outside request
// intercepted: nothing reaches Meta, iClosed, Clarity or the n8n relay. The relay calls are
// recorded so we can see exactly what the page would send to the doctors-partial-capture function.
//   npm run build && python3 -m http.server 4399 -d dist &  node scripts/browser/doctors-price-question.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const BASE = process.env.BASE || "http://localhost:4399";
const PRICE_KEY = process.env.PRICE_KEY || "within-reach";
const QUESTION = "Our service starts at $3,000 a month. Is that within reach for you right now?";
const ANSWERS = ["Yes", "Yes, but I'd like to talk it through first", "Not right now"];
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failures++; };

async function run(browser, answer, { fillThenChange } = {}) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const meta = [], relay = [];
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE)) return route.continue();
    if (/facebook\.(com|net)/.test(u)) { meta.push(u); return route.fulfill({ status: 200, contentType: "application/javascript", body: "" }); }
    if (u.includes("doctors-partial-capture")) { relay.push(JSON.parse(route.request().postData() || "{}")); return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); }
    return route.fulfill({ status: 200, contentType: "text/plain", body: "" });
  });
  await page.goto(`${BASE}/doctors/?utm_source=test&utm_medium=paid`);
  const question = await page.locator(".q", { hasText: "within reach" }).first().innerText();
  const labels = await page.locator('input[name="investment"]').evaluateAll((els) => els.map((e) => e.value));
  await page.fill('input[name="name"]', "Money Test");
  await page.fill('input[name="email"]', "sidney.laruel+moneytest1@gmail.com");
  await page.fill('input[name="phone"]', "+1 415 555 0134");
  await page.fill('input[name="instagram"]', "testhandle");
  await page.check('input[name="specialty"][value="Other"]', { force: true });
  await page.check(`input[name="investment"][value="${answer.replace(/"/g, '\\"')}"]`, { force: true });
  await page.check('input[name="start"][value="Now"]', { force: true });
  await page.waitForTimeout(1500); // partial capture waits 800 ms after a change
  const partialBeforeSubmit = relay.length;
  await page.click('button[type="submit"]');
  await page.waitForTimeout(600);
  const calendar = await page.evaluate(() => !document.querySelector(".step-cal").hidden);
  const thanks = await page.evaluate(() => !document.querySelector(".step-dq").hidden);
  const widget = await page.evaluate(() => (document.querySelector(".iclosed-widget") || {}).getAttribute?.("data-url") || "");
  await ctx.close();
  return { question, labels, partialBeforeSubmit, relay, meta, calendar, thanks, widget };
}

const browser = await chromium.launch({ headless: true, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox", "--ignore-certificate-errors"], proxy: process.env.PW_PROXY ? { server: process.env.PW_PROXY } : undefined });

for (const a of ANSWERS) {
  const r = await run(browser, a);
  console.log(`--- "${a}": calendar=${r.calendar} turnedAway=${r.thanks} relayPosts=${r.relay.length} (before submit ${r.partialBeforeSubmit}) metaRequests=${r.meta.length}`);
  ok(r.question === QUESTION, `question text is exact`);
  ok(JSON.stringify(r.labels) === JSON.stringify(ANSWERS), `the three answers, in order, nothing else`);
  if (a === "Not right now") {
    ok(r.thanks && !r.calendar, "turned away: thank-you shown, no calendar");
    ok(r.relay.length === 0, "turned away: nothing sent to the follow-up relay (no row, no text, no email)");
    ok(r.widget === "", "turned away: iClosed widget never created");
    ok(r.meta.length === 0, "turned away: nothing to Meta (test visit)");
  } else {
    ok(r.calendar && !r.thanks, "qualified: calendar shown");
    ok(r.partialBeforeSubmit === 1 && r.relay[0].investment === a && !r.relay[0].submitted, "qualified: unfinished-form capture sent once with the new answer");
    const submit = r.relay.find((x) => x.submitted === "yes");
    ok(!!submit && submit.investment === a && submit.sms_consent === "yes", "qualified: Submit sent to the instant-link workflow with the new answer");
    const u = new URL(r.widget);
    ok(u.pathname === "/e/synchrosocial/doctor-strategy-call" || !!process.env.ICLOSED_COPY, "qualified: calendar is the doctor event");
    ok(u.searchParams.get(PRICE_KEY) === a, `qualified: iClosed gets ?${PRICE_KEY}=${a}`);
    ok(!u.searchParams.has("how-much-are-you-ready-to-invest-per-month"), "qualified: the old question's parameter is no longer sent");
    ok(u.searchParams.get("iclosedEmail") === "sidney.laruel+moneytest1@gmail.com" && u.searchParams.get("iclosedPhone") === "+14155550134" && u.searchParams.get("iclosedName") === "Money Test", "qualified: name, email, phone sent for form skipping");
    ok(u.searchParams.get("specialty") === "Other" && u.searchParams.get("when-do-you-want-to-start") === "Now" && u.searchParams.get("utm_source") === "test", "qualified: the other answers and utm_source=test still sent");
    ok(r.meta.length === 0, "qualified test visit: nothing to Meta");
  }
}

// A real (non test) visit: Lead fires for both yes answers and NOT for "Not right now"
for (const [a, expectLead] of [["Yes", true], ["Yes, but I'd like to talk it through first", true], ["Not right now", false]]) {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.route("**/*", (route) => { const u = route.request().url(); if (u.startsWith(BASE)) return route.continue();
    if (/facebook\.(com|net)/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    return route.fulfill({ status: 200, contentType: "text/plain", body: "" }); });
  await page.goto(`${BASE}/doctors/?utm_source=facebook&utm_medium=paid`);
  await page.fill('input[name="name"]', "Real Person"); await page.fill('input[name="email"]', "real.person@example.com");
  await page.fill('input[name="phone"]', "+1 415 555 0134"); await page.fill('input[name="instagram"]', "x");
  await page.check('input[name="specialty"][value="Other"]', { force: true });
  await page.check(`input[name="investment"][value="${a.replace(/"/g, '\\"')}"]`, { force: true });
  await page.check('input[name="start"][value="Now"]', { force: true });
  await page.click('button[type="submit"]'); await page.waitForTimeout(400);
  const events = await page.evaluate(() => Array.from((window.fbq && window.fbq.queue) || []).map((x) => x[0] + ":" + x[1]));
  console.log(`--- real visit, "${a}": ${JSON.stringify(events)}`);
  ok(events.includes("track:PageView"), "real visit: PageView fires");
  ok(events.includes("track:Lead") === expectLead, `real visit: Lead ${expectLead ? "fires" : "does NOT fire"}`);
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
