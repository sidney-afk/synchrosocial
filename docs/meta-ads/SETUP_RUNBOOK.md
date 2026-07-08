# Meta Ads — Setup Runbook (manual steps outside this repo)

> Step-by-step for everything that happens in Meta Business Suite / Events
> Manager, iClosed, and HubSpot — the parts that can't be done in code.
> Do these top to bottom. Check off as you go (edit this file or tell Claude).
>
> Context and architecture: `docs/meta-ads/README.md`.

## A. Business Manager foundations (once, ~30 min)

- [ ] **A1. Business portfolio** — exists already: "Synchro Social"
  (`business.facebook.com`, ID starts 895720379894…). Confirm you have full
  admin access, and add a second admin (Kasper?) as backup — one-admin
  accounts get locked out permanently if the admin loses access.
- [ ] **A2. Ad account** — in Business Settings → Accounts → Ad accounts,
  confirm an ad account exists (create one if not, currency USD, timezone
  America/New_York to match HubSpot). Add a payment method
  (Billing → Payment methods). Ads cannot launch without this.
- [ ] **A3. Verify the domain** — recommended but NOT a launch blocker
  (research-confirmed: verification is no longer required for event
  processing; it matters for link editing/brand safety). Business Settings →
  Brand safety → Domains → Add `synchrosocial.com`. Use the **DNS TXT
  method**: add the `facebook-domain-verification=…` TXT record at the DNS
  host. ⚠️ The site is GitHub Pages, so DNS lives at the domain registrar
  (wherever synchrosocial.com's nameservers point — check with
  `dig NS synchrosocial.com`). Alternative: the meta-tag method can be done
  in this repo (`src/layouts/Layout.astro`) — tell Claude the content value
  and it takes 2 minutes + a deploy.
- [ ] **A6. Enable Automatic Advanced Matching** — Events Manager → dataset →
  Settings → Automatic advanced matching → ON. (Manual advanced matching
  isn't possible browser-side — the booking form is inside iClosed's iframe —
  but iClosed's CAPI integration (C2) sends hashed email/phone server-side.)
- [ ] **A4. Connect assets** — Business Settings: confirm the Facebook Page and
  Instagram account are added as assets and linked to the ad account.
- [ ] **A5. Dataset ↔ ad account link** — Events Manager → dataset
  "Synchro Social Data" (4309835332571875) → Settings → connected ad accounts:
  make sure the ad account is linked so campaigns can use the pixel's events.

## B. Pixel verification (after the site deploys with the pixel)

- [ ] **B1. Deploy** — merge the `claude/meta-ads-infrastructure-w47kkb` PR to
  `main`; GitHub Actions deploys to synchrosocial.com automatically (~2 min).
- [ ] **B2. Test Events** — Events Manager → dataset → **Test events** tab →
  enter `https://synchrosocial.com` → browse the site. Expected:
  `PageView` everywhere; `ViewContent` on `/apply` and `/call`;
  `iclosed_potential` / `iclosed_qualified` as you fill the booking form;
  `Schedule` + `Lead` at booking and again (deduplicated) on `/thank-you`.
  Also test on your phone (real-world traffic is mostly mobile).
- [ ] **B3. Meta Pixel Helper** — install the Chrome extension "Meta Pixel
  Helper", visit the live site, confirm the pixel fires green with ID
  4309835332571875.
- [ ] **B4. Diagnostics** — check the Diagnostics tab (currently shows 1
  warning). With zero events flowing, warnings are usually "no recent
  activity" — re-check after events flow; resolve anything that remains.
- [ ] **B5. Do a REAL test booking** — book the Social Media Consultation on
  `/apply` with a test email, confirm:
  - the browser lands on `/thank-you` and the booked-call event appears in
    Test Events;
  - the n8n "Sales — Call Booked" workflow ran (n8n → Executions);
  - a HubSpot contact + deal got created.
  ⚠️ KNOWN GAP (2026-07-08): the n8n router only matches slugs
  `ai-intro-call` / `vsl-funnel`; `/apply` now books `social-media-consultation`,
  which the router IGNORES (no contact, no deal, no confirmation email,
  no nurture). Fix the filter before this test — see README §open items.

## C. iClosed checks (iClosed dashboard, app.iclosed.io)

- [ ] **C1.** Confirm the "Call booked" webhook → 
  `https://synchrosocial.app.n8n.cloud/webhook/iclosed-call-booked` fires for
  **all** event types (or at least Social Media Consultation + AI Intro Call).
- [ ] **C2. Connect iClosed's native Meta CAPI** (research-confirmed; this IS
  our Conversions API — no server, no Stape, no Gateway needed):
  1. Events Manager → dataset "Synchro Social Data" → Settings →
     Conversions API → **"Set up manually" → Generate access token** (copy it).
  2. iClosed dashboard → Integrations → **Meta Pixel** → paste
     Pixel/Dataset ID `4309835332571875` + the access token.
  3. iClosed then sends server-side events as leads move through the form:
     Page view, Potential, Qualified, Disqualified, **Call booked** — with
     hashed email/phone, IP, user agent, fbp/fbc. Note plan limits: 1 pixel
     on Startup plan, 5 on Business/Enterprise.
  4. In Events Manager, confirm the custom events arrive (names like
     `invitee_meeting_scheduled`), then create a **custom conversion**
     wrapping the "Call booked" event so it's usable as an optimization goal.
     ⚠️ These custom events do NOT dedupe against our site's Schedule/Lead
     (different names, by design) — optimization must point at ONE stream.
- [ ] **C3.** Check whether the post-booking redirect to `/thank-you` can
  append query params (invitee email / booking id). If yes, enable it —
  Claude can then upgrade the thank-you event with advanced matching +
  a shared event ID for CAPI deduplication.

## D. Campaign-side wiring (in Ads Manager, before launch)

- [ ] **D1.** Create campaign → Leads objective → conversion location Website →
  performance goal = maximize conversions → select the dataset + conversion
  event **`Schedule`** (the booked call; `Lead` is an identical twin if the
  UI or volume favors it — never optimize/report on both). If booking volume
  is too thin for learning, temporarily optimize on `ViewContent` or the
  `iclosed_qualified` custom event and move down-funnel once volume allows.
- [ ] **D2.** UTM template on every ad (so HubSpot + analytics can attribute):
  `utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
- [ ] **D3.** Confirm the ad's landing page is the main funnel (`/` or `/apply`),
  NOT `/ai` (decision 2026-07-08).

## E. CRM feedback loop (phase 3 — after launch)

- [ ] **E1.** Qualified signal: when a deal moves past discovery (or lead
  status → CONNECTED/qualified), n8n sends a CAPI event (e.g. custom
  `QualifiedLead`) with the contact's hashed email/phone.
- [ ] **E2.** Closed signal: extend "Sales — Contract Signed" n8n workflow
  (moves deal → closedwon) to also send a `Purchase`-class CAPI event with
  the engagement value. This is what lets campaigns optimize toward CAC.
- [ ] **E3.** Tag ad-sourced contacts in HubSpot (original source = Paid
  Social + UTM capture) so ad quality can be judged per-campaign.

---

*Maintained by the Meta-ads project. When a step completes, mark it here and
log it in README §session log.*
