// Proves /doctors-who-teach fires the custom DoctorQualified event once per visit for "Yes"
// on the $3,000-a-month question, and never for "Not right now" or test traffic.
// Meta's script is faked (the official snippet's queue is read) and the Supabase relay is
// faked, so nothing leaves this machine. Run after `npx astro build`:
//   python3 -m http.server 4399 -d dist &   node scripts/browser/doctor-qualified.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const BASE = process.env.BASE || "http://localhost:4399";
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failures++; };

async function visit(browser, { query = "?utm_source=facebook", email, answers, emailLast = false, reload = false, label }) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE)) return route.continue();
    if (/facebook\.(com|net)/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    if (u.includes("doctors-partial-capture")) return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    return route.fulfill({ status: 200, contentType: "text/plain", body: "" });
  });
  const typeEmail = async () => { await page.fill('input[name="email"]', email); await page.press('input[name="email"]', "Tab"); };
  const read = () => page.evaluate(() => ((window.fbq && window.fbq.queue) || [])
    .map((a) => Array.from(a)).filter((a) => a[1] === "DoctorQualified")
    .map((a) => ({ method: a[0], params: a[2], eventID: a[3] && a[3].eventID })));
  await page.goto(`${BASE}/doctors-who-teach/${query}`);
  if (!emailLast) await typeEmail();
  for (const a of answers) await page.check(`input[name="investment"][value="${a}"]`, { force: true });
  if (emailLast) await typeEmail();
  await page.waitForTimeout(300);
  let events = await read();
  if (reload) { // same visit, page reloaded, "Yes" picked again
    await page.reload(); await typeEmail();
    await page.check('input[name="investment"][value="Yes"]', { force: true });
    await page.waitForTimeout(300);
    events = events.concat(await read());
  }
  await ctx.close();
  console.log(`--- ${label}: ${JSON.stringify(events)}`);
  return events;
}

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

let e = await visit(browser, { email: "real@example.com", answers: ["Yes"], label: "real visit, Yes" });
ok(e.length === 1, "Yes: DoctorQualified fires once");
ok(e[0] && e[0].method === "trackCustom" && e[0].params.content_name === "educator_offer" && e[0].eventID, "sent as a custom event with content_name educator_offer and an eventID");
ok(e[0] && !JSON.stringify(e[0]).includes("real@example.com"), "no email in the event");

e = await visit(browser, { email: "real@example.com", answers: ["Yes", "Not right now", "Yes"], label: "Yes, changed, Yes again" });
ok(e.length === 1, "switching answers back and forth still fires once");

e = await visit(browser, { email: "real@example.com", answers: ["Yes"], reload: true, label: "Yes, reload, Yes" });
ok(e.length === 1, "once per visit across a reload");

e = await visit(browser, { email: "real@example.com", answers: ["Yes"], emailLast: true, label: "Yes before email" });
ok(e.length === 1, "Yes picked before the email: fires once the email is typed");

e = await visit(browser, { email: "real@example.com", answers: ["Not right now"], label: "Not right now" });
ok(e.length === 0, "Not right now: no DoctorQualified");

e = await visit(browser, { email: "sidney.laruel+qualtest@gmail.com", answers: ["Yes"], label: "test email" });
ok(e.length === 0, "test email: no DoctorQualified");

for (const src of ["test", "referral", "outbound_dm"]) {
  e = await visit(browser, { query: `?utm_source=${src}`, email: "real@example.com", answers: ["Yes"], label: `utm_source=${src}` });
  ok(e.length === 0, `utm_source=${src}: no DoctorQualified`);
}

await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
