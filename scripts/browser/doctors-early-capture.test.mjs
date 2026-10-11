// Proves WHEN the /doctors page sends an unfinished form to the follow-up relay, in a real browser,
// with every outside request intercepted: nothing reaches Meta, iClosed, Clarity or n8n. The relay
// calls are recorded so we see exactly what the page would send.
//   npm run build && python3 -m http.server 4399 -d dist &  node scripts/browser/doctors-early-capture.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const BASE = process.env.BASE || "http://localhost:4399";
const EMAIL = "sidney.laruel+early1@gmail.com";
const PHONE = "+1 415 555 0134";
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failures++; };

async function open(browser) {
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
  return { ctx, page, relay, meta };
}
const settle = (page) => page.waitForTimeout(1500); // the page waits 800 ms after a change
// A real browser fires "change" when the visitor leaves a field; Playwright's fill does not, so blur after it.
const fill = async (page, sel, v) => { await page.fill(sel, v); await page.locator(sel).blur(); };
const answer = (page, v) => page.check(`input[name="investment"][value="${v.replace(/"/g, '\\"')}"]`, { force: true });

const browser = await chromium.launch({ headless: true, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox", "--ignore-certificate-errors"], proxy: process.env.PW_PROXY ? { server: process.env.PW_PROXY } : undefined });

{ console.log("--- 1. email only, then leave");
  const { ctx, page, relay, meta } = await open(browser);
  await fill(page, 'input[name="name"]', "Early Test"); await fill(page, 'input[name="email"]', "not-an-email"); await settle(page);
  ok(relay.length === 0, "half-typed / invalid email: nothing sent");
  await fill(page, 'input[name="email"]', EMAIL); await settle(page);
  ok(relay.length === 1, "valid email alone: sent once");
  ok(relay[0]?.email === EMAIL && !relay[0].phone && !relay[0].investment && !relay[0].submitted, "payload: email, no phone, no answer, not a submit");
  await fill(page, 'input[name="instagram"]', "x"); await settle(page);
  ok(relay.length === 1, "an unrelated field changing does not re-send");
  ok(meta.length === 0, "nothing reached Meta (test visit)");
  await ctx.close(); }

{ console.log("--- 2. email and phone, then leave");
  const { ctx, page, relay, meta } = await open(browser);
  await fill(page, 'input[name="name"]', "Early Test"); await fill(page, 'input[name="email"]', EMAIL); await settle(page);
  await fill(page, 'input[name="phone"]', PHONE); await settle(page);
  ok(relay.length === 2, "email sent, then sent again when the phone arrives");
  ok(!relay[0].phone && relay[1].phone === "+14155550134" && relay[1].sms_consent === "yes", "second send carries the phone in +1 format and the consent flag");
  ok(relay[0].email === relay[1].email, "same email both times (n8n updates the one row)");
  await fill(page, 'input[name="phone"]', "+1 415 555 01"); await settle(page);
  ok(relay[relay.length - 1].phone === "", "a half-typed phone is sent as no phone (no text)");
  ok(meta.length === 0, "nothing reached Meta (test visit)");
  await ctx.close(); }

{ console.log("--- 3. email, then 'Not right now'");
  const { ctx, page, relay } = await open(browser);
  await fill(page, 'input[name="name"]', "Early Test"); await fill(page, 'input[name="email"]', EMAIL); await fill(page, 'input[name="phone"]', PHONE); await settle(page);
  await answer(page, "Not right now"); await settle(page);
  ok(relay.length === 2 && relay[1].investment === "Not right now", "the 'Not right now' answer is sent (n8n cancels any armed follow-up)");
  await fill(page, 'input[name="instagram"]', "x"); await page.check('input[name="specialty"][value="Other"]', { force: true });
  await page.check('input[name="start"][value="Now"]', { force: true });
  await page.click('button[type="submit"]'); await page.waitForTimeout(600);
  ok(relay.length === 2, "pressing Submit on 'Not right now' sends nothing more (already cancelled), no booking-link send");
  ok(await page.evaluate(() => !document.querySelector(".step-dq").hidden), "thank-you shown, no calendar");
  await ctx.close(); }

{ console.log("--- 3b. 'Not right now' picked and Submit pressed before the page's 0.8 s wait is over");
  const { ctx, page, relay } = await open(browser);
  await fill(page, 'input[name="name"]', "Early Test"); await fill(page, 'input[name="email"]', EMAIL);
  await fill(page, 'input[name="phone"]', PHONE); await fill(page, 'input[name="instagram"]', "x");
  await page.check('input[name="specialty"][value="Other"]', { force: true });
  await page.check('input[name="start"][value="Now"]', { force: true });
  await answer(page, "Not right now");
  await page.click('button[type="submit"]'); await page.waitForTimeout(1500);
  ok(relay.length === 1 && relay[0].investment === "Not right now", "the cancel is still sent exactly once");
  await ctx.close(); }

{ console.log("--- 4. email, then 'Yes', then leave");
  const { ctx, page, relay } = await open(browser);
  await fill(page, 'input[name="name"]', "Early Test"); await fill(page, 'input[name="email"]', EMAIL); await settle(page);
  await answer(page, "Yes"); await settle(page);
  ok(relay.length === 2 && !relay[0].investment && relay[1].investment === "Yes", "sent at the email, sent again with the answer");
  await answer(page, "Yes, but I'd like to talk it through first"); await settle(page);
  ok(relay.length === 3 && relay[2].investment === "Yes, but I'd like to talk it through first", "changing between the two yes answers re-sends");
  await answer(page, "Not right now"); await settle(page);
  await answer(page, "Yes"); await settle(page);
  ok(relay.length === 5 && relay[3].investment === "Not right now" && relay[4].investment === "Yes", "'Not right now' then back to 'Yes' sends both, in order");
  await ctx.close(); }

{ console.log("--- 5. full submit (then the booking)");
  const { ctx, page, relay, meta } = await open(browser);
  await fill(page, 'input[name="name"]', "Early Test"); await fill(page, 'input[name="email"]', EMAIL); await fill(page, 'input[name="phone"]', PHONE);
  await fill(page, 'input[name="instagram"]', "x");
  await page.check('input[name="specialty"][value="Other"]', { force: true });
  await answer(page, "Yes"); await page.check('input[name="start"][value="Now"]', { force: true });
  await settle(page);
  const before = relay.length;
  await page.click('button[type="submit"]'); await page.waitForTimeout(800);
  ok(before === 1 && relay[0].investment === "Yes" && relay[0].phone === "+14155550134", "everything typed before Submit goes out as one early send");
  const sub = relay.find((x) => x.submitted === "yes");
  ok(!!sub && sub.investment === "Yes" && sub.sms_consent === "yes", "Submit sends the booking-link request exactly as before");
  ok(await page.evaluate(() => !document.querySelector(".step-cal").hidden), "calendar step shown");
  const widget = await page.evaluate(() => document.querySelector(".iclosed-widget")?.getAttribute("data-url") || "");
  ok(/doctor-strategy-call/.test(widget) && widget.includes("iclosedEmail="), "iClosed widget gets the lead's details");
  await page.waitForTimeout(1500);
  ok(relay.filter((x) => !x.submitted).length === 1, "nothing is sent as 'unfinished' after Submit");
  ok(meta.length === 0, "nothing reached Meta (test visit)");
  await ctx.close(); }

await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
