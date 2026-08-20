# Meta Ads — Setup Runbook (manual steps outside this repo)

> Step-by-step for everything that happens in Meta Business Suite / Events
> Manager, iClosed, and HubSpot — the parts that can't be done in code.
> Do these top to bottom. Check off as you go (edit this file or tell Claude).
>
> Context and architecture: `docs/meta-ads/README.md`.

## Current state after 2026-07-08 live setup

Done:
- Meta domain verification is complete via meta tag on the live site.
- PR #27 is merged and deployed.
- Browser pixel events are live and tested: `PageView`, `ViewContent`,
  `Schedule`, `Lead`, and deduplication.
- n8n booking router is fixed/published for `social-media-consultation`.
- iClosed Meta Pixel integration is connected and shows trigger activity.
- Direct Meta CAPI smoke test worked (`events_received: 1`) and appeared as
  `Received From: Server` in Meta Test Events.
- iClosed `test-pixel=true` flow produced server-side `Potential`,
  `Qualified`, `invitee_meeting_scheduled`, and `PageView` in Meta Test
  Events.
- The website embed supports `/apply?test-pixel=true`, which passes test mode
  into iClosed without changing normal visitor behavior.
- Homepage Apply buttons preserve `?test-pixel=true`, so
  `/?test-pixel=true` can test the full homepage -> apply -> embedded calendar
  path.
- End-to-end booking automation works for returning contacts and new leads.

Still open:
- Confirm ad account payment method before launch.
- Regenerate the CAPI token because the setup token was exposed in screenshots.
- Run one final embedded booking test at `/apply?test-pixel=true` or
  `/?test-pixel=true` and confirm the iClosed server events appear from the
  real website embed.
- Implement CRM outcome feedback to Meta: qualified, bad fit, closed won, and
  deal value.

The detailed checklist below is retained for process context. If an older
unchecked box conflicts with this current-state section, the current-state
section is authoritative.

## A. Business Manager foundations (once, ~30 min)

Current note: A3 is complete. The domain was verified on 2026-07-08 with the
meta-tag method in `src/layouts/Layout.astro` and deploy commit `0c6232d`.
The remaining launch foundation to confirm is the ad account payment method.

- [x] **A1. Business portfolio** — exists: "Synchro Social", ID
  `895720379894006`. Still worth doing: add a second admin (Kasper?) as
  backup — one-admin accounts get locked out permanently if the admin loses
  access.
- [ ] **A2. Ad account** — exists: "SynchroSocial Ads", ID
  `24069488506082034`. Remaining: confirm a payment method is added
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
- [ ] **A4. Connect assets** — Business Settings: confirm the Facebook Page and
  Instagram account are added as assets and linked to the ad account.
- [x] **A5. Dataset ↔ ad account link** — DONE (verified 2026-07-08: dataset
  Settings → Sharing shows "SynchroSocial Ads" `24069488506082034`).
- [x] **A6. Automatic Advanced Matching** — DONE (verified 2026-07-08:
  already ON, along with first-party cookies; "track events automatically
  without code" correctly OFF). Manual advanced matching isn't possible
  browser-side — the booking form is inside iClosed's iframe — but iClosed's
  CAPI integration (C2) sends hashed email/phone server-side.
- [x] **A7. Domain allow list** — DONE (verified 2026-07-08:
  `synchrosocial.com` is on the dataset's traffic-permissions allow list).
  The Diagnostics warning about it is stale — see B4.

## B. Pixel verification (after the site deploys with the pixel)

Current note: B1, B2, and B5 are complete as of 2026-07-08. Browser
`PageView`, `ViewContent`, `Schedule`, and `Lead` events were received by Meta.
Booking tests proved the n8n route, HubSpot contact/deal behavior, confirmation
emails, and nurture start. The old router-gap warning below is historical.

- [ ] **B1. Deploy** — merge the `claude/meta-ads-infrastructure-w47kkb` PR to
  `main`; GitHub Actions deploys to synchrosocial.com automatically (~2 min).
- [ ] **B2. Test Events** — Events Manager → dataset → **Test events** tab →
  enter `https://synchrosocial.com` → browse the site. Expected from a normal
  browse: `PageView` everywhere; `ViewContent` on `/apply` and `/call`;
  `Schedule` + `Lead` at booking and again (deduplicated) on `/thank-you`.
  iClosed's native `Potential`/`Qualified` server events are fired by
  iClosed's own Meta integration (not this site's code — see README §4), but
  only show up reliably in Test Events when the embed carries
  `test-pixel=true` (see §C) — visit `/apply?test-pixel=true` or
  `/?test-pixel=true` rather than expecting them from a plain browse. Also
  test on your phone (real-world traffic is mostly mobile).
- [ ] **B3. Meta Pixel Helper** — install the Chrome extension "Meta Pixel
  Helper", visit the live site, confirm the pixel fires green with ID
  4309835332571875.
- [ ] **B4. Diagnostics** — the current warning ("Confirm domain that belong
  to you", detected Jun 3) is STALE: `synchrosocial.com` is already on the
  allow list (verified 2026-07-08). Dismiss it via the ⋯ menu or let it
  self-clear once new events flow post-merge. Re-check the tab after B2 for
  anything genuinely new (e.g. duplicate-event warnings → tell Claude).
- [ ] **B5. Do a REAL test booking** — book the Social Media Consultation on
  `/apply` with a test email, confirm:
  - the browser lands on `/thank-you` and the booked-call event appears in
    Test Events;
  - the n8n "Sales — Call Booked" workflow ran (n8n → Executions);
  - a HubSpot contact + deal got created.
  ✅ RESOLVED (fixed 2026-07-08, re-verified live 2026-08-20): the router
  previously matched only `ai-intro-call` / `vsl-funnel` while `/apply` books
  `social-media-consultation`, so main-funnel bookings were IGNORED — no
  contact, no deal, no confirmation email, no nurture. The published
  `Is Normal Funnel Event?` condition now matches `social-media-consultation`.
  No action needed; kept for history.

## C. iClosed checks (iClosed dashboard, app.iclosed.io)

Current note: iClosed Meta Pixel integration is connected and trigger activity
is visible in iClosed. True server-side CAPI is proven in test mode: direct
Meta smoke test returned `events_received: 1`, and iClosed's
`test-pixel=true` flow produced Server rows for `Potential`, `Qualified`,
`invitee_meeting_scheduled`, and `PageView`. For the embedded website path,
open `/apply?test-pixel=true`; the site passes that flag into the iClosed
embed before the widget loads. To test the whole homepage path, open
`/?test-pixel=true`; Apply buttons preserve the flag when they send the user to
`/apply`. Regenerate the CAPI token before production use because it was
exposed in screenshots.

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
     `invitee_meeting_scheduled`). ✅ **Done — but wrapping `Qualified`, not
     "Call booked".** The live custom conversion is **"Qualified Application"**
     (`2110443739684279`). `Qualified` means booked *and* not disqualified, so
     it excludes prospects who cannot afford the offer; optimizing on
     "Call booked" would buy bookings that get disqualified on the call. Do not
     "correct" this back — see README §6 decisions and §9 item 6.
     ⚠️ These custom events do NOT dedupe against our site's Schedule/Lead
     (different names, by design) — optimization must point at ONE stream.
- [ ] **C3.** Check whether the post-booking redirect to `/thank-you` can
  append query params (invitee email / booking id). If yes, enable it —
  Claude can then upgrade the thank-you event with advanced matching +
  a shared event ID for CAPI deduplication.

## D. Campaign-side wiring (in Ads Manager, before launch)

- [ ] **D1.** Create campaign → Leads objective → conversion location Website →
  performance goal = maximize conversions → select the dataset + the custom
  conversion **"Qualified Application"** (`2110443739684279`), which is the
  owner-decided optimization goal (booked *and* not disqualified).
  ⚠️ *Superseded 2026-08-20:* this step previously said optimize on `Schedule`
  (the raw booked call). `Schedule`/`Lead` are still the right things to
  **report** volume on, but not to optimize against — and never optimize or
  report on both `Schedule` and `Lead`, they are identical twins. If booking volume
  is too thin for learning, temporarily optimize on `ViewContent`, or on
  iClosed's native `Qualified` event via the existing **"Qualified
  Application"** custom conversion (`2110443739684279`, already wraps
  `event == Qualified`) — move down-funnel once volume allows. Note: raw
  events like `Potential`/`Qualified` are custom events, not Meta standard
  events, so Ads Manager won't let you select them directly as an
  optimization goal — each needs its own custom conversion wrapper first
  (see `RESEARCH.md`'s Conversions API section). If `Potential` is ever
  needed as an even-earlier fallback, create an equivalent custom conversion
  wrapping it before selecting it. The site's own `iclosed_qualified` custom
  event that used to serve as this fallback was removed 2026-08-17 — it
  duplicated iClosed's native `Qualified` event and nothing in Meta depended
  on it (verified: no custom conversion, no audience).
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
