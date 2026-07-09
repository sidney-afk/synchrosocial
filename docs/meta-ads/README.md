# Meta Ads — Project Memory & Infrastructure Doc

> **Read this first.** This is the persistent memory for the Meta ads project.
> If you are a new Claude session (or a new human), everything decided and done
> so far is recorded here. Update this doc whenever you change the tracking
> setup or make a project decision.
>
> Sibling docs: `ECOSYSTEM_MAP.md` (site/funnel/booking map),
> `meta-ads/SETUP_RUNBOOK.md` (step-by-step for the parts done in Meta/HubSpot
> UIs, not in this repo).

---

## 1. The mission

Launch Meta (Facebook/Instagram) ads for Synchro Social. The master plan lives
in the Google Doc ["Meta Ads Checklist / Paid Ads Launch Gameplan"](https://docs.google.com/document/d/1HsYpNPCw56cd1vUnd7iY0r1OEHsoqwhNuIzwARSCQKk/edit)
(readable via the Google Drive connector). Its 5 steps:

1. **Load the website with proof** (testimonials, before/after numbers on the ad landing page)
2. **Get the infrastructure right** ← *this repo/branch is Step 2*
   - Business Manager set up, domain verified, Pixel installed, Conversions API connected
   - Conversion events mapped to funnel: page view → call booked → offline
     qualified/closed pushed back from the CRM. **We track CAC, not CPL.**
   - CRM stages tagged by lead source/quality
3. **Lock the numbers** (client value → target CAC → max cost per booked call)
4. **Build the launch creative batch** (10 angles; creative guide is a separate Google Doc)
5. **Launch simple** ($100/day, one campaign, broad targeting, optimize for booked-call event)

**Ads will run to the MAIN funnel** (purple, synchrosocial.com), *not* the AI
funnel (`/ai`) — per Sidney, July 2026.

## Current status (2026-07-08)

Step 2 is mostly complete for launch tracking, but not complete for the full
CAC feedback loop.

Completed today:
- PR #27 was merged and the Meta Pixel is live on `synchrosocial.com`.
- Meta domain verification was added via meta tag in `Layout.astro`, deployed
  to GitHub Pages, confirmed in live HTML, and verified in Meta Business
  Settings.
- Browser events were tested live in Meta Test Events: `PageView`,
  `ViewContent` on `/apply`, `Schedule`, `Lead`, `iclosed_potential`,
  `iclosed_qualified`, and iClosed-native mapped events (`Potential`,
  `Qualified`, `invitee_meeting_scheduled`).
- Duplicate `Schedule`/`Lead` rows were expected and Meta deduplicated them by
  event ID.
- n8n workflow `Sales - Call Booked (iClosed)` (`xoPqojySDriQ8Mzh`) was
  published with the `social-media-consultation` route live. It now calls
  `Normal Sales - Booking Handler` (`ghpbQQJizAnR6p2b`).
- End-to-end booking tests passed for both returning-contact and new-lead
  paths: HubSpot contact/deal behavior, confirmation email, and nurture start.
- iClosed Meta Pixel integration is connected for dataset `4309835332571875`
  and shows trigger activity inside iClosed.
- A direct Meta Conversions API smoke test returned `events_received: 1` and
  appeared in Meta Test Events as `Received From: Server`.
- iClosed's `test-pixel=true` flow produced server-side `Potential`,
  `Qualified`, `invitee_meeting_scheduled`, and `PageView` rows in Meta Test
  Events. This proves the token, dataset, and iClosed CAPI path work.
- `IClosedEmbed.astro` now passes `?test-pixel=true` from the parent page into
  the embedded iClosed URL, so `/apply?test-pixel=true` can test the real
  embedded website flow without affecting normal visitors.
- `ApplyButton.astro` preserves `?test-pixel=true` on `/apply` links, so
  `/?test-pixel=true` can test the full homepage -> apply -> embedded calendar
  path.

Still not complete:
- The normal `/apply` embedded flow does not carry iClosed's `test-pixel=true`
  flag unless the parent page is opened as `/apply?test-pixel=true`. Without
  that flag, iClosed may still send production CAPI events, but they will not
  reliably appear in Meta Test Events as test rows.
- CRM feedback events are not yet pushed back to Meta when HubSpot marks a
  lead qualified, bad fit, closed won, or assigns deal value.
- HubSpot contacts/deals are created, but the normal booking workflow does not
  yet store detailed ad source/campaign/quality fields.

Security note:
- A CAPI token was exposed in screenshots during setup. Regenerate it before
  using CAPI in production, even if testing continues with the old token.

## 2. Accounts & IDs

| Thing | Value |
| --- | --- |
| Domain | `synchrosocial.com` (GitHub Pages, repo `sidney-afk/synchrosocial`, auto-deploys `main`; Meta domain verification completed 2026-07-08 via meta tag) |
| Meta business portfolio | "Synchro Social", ID `895720379894006` |
| Meta ad account | "SynchroSocial Ads", ID `24069488506082034` (campaigns + billing live here; never goes in code) |
| Meta Events Manager dataset | **"Synchro Social Data", ID `4309835332571875`** (= the pixel ID — the ONLY Meta ID used in code). Created by Sidney Mar 31, 2026; already linked to the ad account (visible in dataset Settings → Sharing) |
| Old Framer pixel | Existed on the Framer site; NOT carried over. Repo had zero tracking code before this branch. Whether the old pixel is a *different* ID in Events Manager: unconfirmed — check Events Manager and prefer the "Synchro Social Data" dataset. |
| HubSpot | **Free tier**, account ID `245312721`, NA2 (`app-na2.hubspot.com`), USD, US/Eastern |
| HubSpot lifecycle stages | `subscriber, lead, opportunity, customer` |
| HubSpot lead statuses | `NEW, OPEN, IN_PROGRESS, OPEN_DEAL, UNQUALIFIED, ATTEMPTED_TO_CONTACT, CONNECTED, BAD_TIMING` |
| Booking | iClosed (`app.iclosed.io`), host calendar kasper@synchrosocial.com |
| Contact | hello@synchrosocial.com; Sidney: sidney.laruel@gmail.com |

## 3. The funnel being tracked (main / purple)

```
Ad → /  (or straight to /apply)
      → /apply        iClosed "Social Media Consultation" embed (iframe on app.iclosed.io)
      → booking made  iClosed redirects the browser to /thank-you   ← CONVERSION SIGNAL
      → sales call (Zoom) → HubSpot: qualified / closed-won         ← CRM FEEDBACK (offline)
```

Key facts from the site audit (July 8, 2026):

- The site is **Astro 5 + Tailwind 4, fully static, hosted on GitHub Pages**.
  There is **no server**, which constrains Conversions API options (need a
  relay: CAPI Gateway, Stape, n8n, Zapier, or a HubSpot-side integration).
- Every Astro page shares one `<head>`: `src/layouts/Layout.astro`. The pixel
  is installed there once (via `src/components/MetaPixel.astro`) → covers
  `/`, `/apply`, `/thank-you`, `/ai`, `/call`, `/event`, onboarding, legal, 404.
- Three static HTML pages (`public/ai-invite/*.html`) have their own heads;
  the pixel snippet was inserted into each manually.
- The booking form is an **iframe on app.iclosed.io** — our pixel cannot see
  inside it. The reliable browser-side conversion moment is the redirect to
  `/thank-you` (only the "Social Media Consultation" calendar redirects there;
  all other calendars use iClosed-internal confirmations, see ECOSYSTEM_MAP.md).
- `/thank-you` can in principle be visited directly (bookmark/typed URL), so
  tiny overcount risk on the booked-call event; accepted.

## 4. The event map (FINAL — implemented)

| Event | Where it fires | How |
| --- | --- | --- |
| `PageView` | every page | base pixel (`MetaPixel.astro` in `Layout.astro`; manual snippet in `public/ai-invite/*.html`) |
| `ViewContent` (content_name `apply` / `call`) | `/apply`, `/call` | `metaEvent` prop on `Layout` |
| `iclosed_potential` / `iclosed_qualified` / `iclosed_disqualified` (custom) | any page with an iClosed embed | postMessage bridge in `IClosedEmbed.astro` — mid-funnel signals for retargeting + fallback optimization if booking volume is too thin |
| **`Schedule` + `Lead`** ← the conversion | booking moment (bridge) AND `/thank-you` (fallback) | bridge fires on `iclosed.call_scheduled` with a fresh `eventID`, stores it in `sessionStorage.ss_booked_eid`; `/thank-you` re-fires with the SAME ID (→ Meta dedupes on event name + ID, 48h) or a fresh ID if the bridge missed. `Lead` uses `"lead-"+eventID`. |

Rules:
- **Schedule and Lead mark the same moment.** Pick ONE as the campaign's
  optimization event in Ads Manager (gameplan says booked-call → `Schedule`);
  never report them summed.
- Direct visits to `/thank-you` overcount slightly — accepted, tiny.
- iClosed's server-side CAPI events (once connected, see §6) are a SEPARATE
  stream with different (custom) names — they never dedupe against ours.
  Optimization points at one stream deliberately.

## 5. What is DONE in this repo (branch `claude/meta-ads-infrastructure-w47kkb`, [PR #27](https://github.com/sidney-afk/synchrosocial/pull/27))

- [x] `src/components/MetaPixel.astro` — official base snippet, pixel ID
  `4309835332571875`, PageView everywhere, `noscript` fallback, optional
  per-page event with `eventID`.
- [x] `Layout.astro` accepts `metaEvent={{ name, params }}`.
- [x] Pixel snippet in `public/ai-invite/index.html`, `schedule-clients.html`,
  `schedule-investors.html`.
- [x] `IClosedEmbed.astro` — iClosed→Meta postMessage bridge (booking +
  mid-funnel events, sessionStorage eventID handoff).
- [x] `/thank-you` — Schedule+Lead fallback with dedup via stored eventID.
- [x] `/apply` + `/call` — ViewContent.
- [x] `docs/meta-ads/RESEARCH.md` — verified 2026 research findings + sources.
- Build verified (`npm run build`, events confirmed in `dist/`).
- [x] PR #27 merged to `main` and deployed.
- [x] Meta domain verification tag added to `Layout.astro` and deployed in
  commit `0c6232d` (`Add Meta domain verification tag`).
- [x] Live Meta Test Events confirmed browser `PageView`, `ViewContent`,
  `Schedule`, `Lead`, iClosed bridge custom events, and iClosed-native mapped
  events.

## 6. Decisions log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-07-08 | Ads target main funnel, not `/ai` | Sidney's instruction |
| 2026-07-08 | Fresh start on dataset `4309835332571875`; old Framer pixel abandoned | Old pixel wasn't migrated; dataset already created in Events Manager |
| 2026-07-08 | Pixel installed site-wide via one component in `Layout.astro` | Single source of truth; every page auto-covered |
| 2026-07-08 | Launch browser-pixel-first; use **iClosed's native CAPI integration** for scheduler funnel events before considering n8n for booking events | Gateway needs a paid cloud instance; iClosed is the normal native path. Direct CAPI smoke test and iClosed `test-pixel=true` both produced Server rows in Meta Test Events. |
| 2026-07-08 | Booked call fires BOTH `Schedule` and `Lead` (same eventID root) at the bridge + `/thank-you` fallback | Semantics unresolved by research; both available in Ads Manager, pick one, no code change needed |
| 2026-07-08 | n8n router must support `social-media-consultation` | The main `/apply` funnel uses this iClosed slug. The router was updated and published on 2026-07-08. |
| 2026-07-08 | iClosed CAPI is proven in test mode, but embedded website testing needs `?test-pixel=true` pass-through | Direct iClosed test URL produced Server rows. The production embed URL does not include the test flag, so Meta Test Events will not prove embedded CAPI unless `/apply?test-pixel=true` is used. |
| 2026-07-08 | n8n reserved primarily for phase 3 CRM offline events (qualified/closed -> CAPI), not booking events | iClosed covers the booking funnel CAPI path. n8n's existing deal-stage workflows remain the natural hook for CAC/outcome events. |
| 2026-07-08 | No AEM/web-event config work | Research: prioritization eliminated, AEM tab removed (2026) |
| 2026-07-08 | Domain verification completed by meta tag | Not required for event processing, but it is now done and verified. |
| 2026-07-08 | No cookie-consent banner for now | US-targeted traffic; revisit if targeting EU (GDPR) |

## 7. What remains (the checklist)

Detailed steps live in `SETUP_RUNBOOK.md`. Summary:

### Current checklist (authoritative after 2026-07-08 live tests)

Launch readiness:
- [x] PR #27 merged to `main`; pixel deployed to production.
- [x] Domain verification tag deployed and domain verified in Meta.
- [x] Browser Test Events passed for page view, apply view, booking, and
  deduplication.
- [x] n8n booking router published for `social-media-consultation`.
- [x] New-lead and returning-contact booking automation tested end to end.
- [ ] Confirm ad account payment method before paid spend.

Server-side / CAPI:
- [x] iClosed Meta Pixel integration connected to dataset `4309835332571875`.
- [x] Direct Meta CAPI smoke test accepted one server `Lead`
  (`events_received: 1`) and Meta displayed it as `Received From: Server`.
- [x] iClosed `test-pixel=true` flow displayed server `Potential`,
  `Qualified`, `invitee_meeting_scheduled`, and `PageView` rows in Meta.
- [x] Website embed supports `/apply?test-pixel=true` for testing the real
  embedded flow with iClosed test mode.
- [x] Homepage Apply buttons preserve `?test-pixel=true`, allowing
  `/?test-pixel=true` to test the full site path.
- [ ] Regenerate the CAPI token before production use; the setup token was
  exposed in screenshots.
- [ ] Run a final embedded-flow test at `/apply?test-pixel=true` and confirm
  the same iClosed server events appear from the real website embed.

CRM feedback loop:
- [ ] Push qualified, bad-fit, closed-won, and deal-value outcomes back to Meta.
- [ ] Add/confirm HubSpot properties for paid source, campaign, lead quality,
  and CAC reporting.

### Historical checklist from PR #27 handoff

### Launch blockers
- [ ] **Merge this branch to `main`** → auto-deploys the pixel to production
- [ ] Ad account + payment method confirmed, dataset linked to ad account (runbook A)
- [ ] Verify events with Test Events + a real test booking (runbook B)
- [ ] ⚠️ **Fix the n8n booking router** (see §8 #1) — main-funnel bookings
  currently create NO HubSpot contact/deal/emails. Needs Sidney's go-ahead
  (touches live sales automation).

### Phase 2 — server-side (fast follow, ~10 min manual)
- [ ] Connect iClosed's native Meta CAPI: Events Manager → dataset Settings →
  Generate access token ("Set up manually") → paste dataset ID + token in
  iClosed → Integrations → Meta Pixel (runbook C2)
- [ ] Create a custom conversion wrapping iClosed's `Call booked` custom event
  (so it can be compared against / swapped in as the optimization goal)
- [ ] Enable Automatic Advanced Matching in dataset Settings

### Phase 3 — CRM feedback loop (CAC, not CPL)
- [ ] Extend n8n "Sales — Contract Signed" (deal → closedwon) to send a CAPI
  `Purchase`-class event with hashed email/phone + engagement value
- [ ] Same for the qualified stage (deal past discovery / lead CONNECTED)
- [ ] Tag ad-sourced contacts (UTMs; `hs_analytics_source = PAID_SOCIAL`)
- [ ] Resolve open question: HubSpot free tier's native Meta conversion sync
  (if it works on free, it may replace the n8n CAPI calls)

## 8. Events Manager state (verified with Sidney, 2026-07-08)

Post-test update (same day):

- **Domain verification: COMPLETE.** The meta tag is in `Layout.astro`, commit
  `0c6232d`, and the domain shows verified in Meta Business Settings.
- **Browser tracking: COMPLETE.** Live Test Events showed `PageView`,
  `ViewContent`, `Schedule`, and `Lead` from the browser.
- **Deduplication: WORKING.** Repeated `Schedule` and `Lead` rows with the
  same event ID were deduplicated by Meta.
- **iClosed integration: CONNECTED.** iClosed shows "Synchro Social Data" as a
  connected pixel and records Page View, Potential, Qualified, and Call booked
  triggers from "Social Media Consultation".
- **iClosed CAPI/server source: CONFIRMED IN TEST MODE.** Direct CAPI smoke
  test returned `events_received: 1` and iClosed's `test-pixel=true` flow
  produced server rows for `Potential`, `Qualified`,
  `invitee_meeting_scheduled`, and `PageView`.
- **Embedded website test mode: ADDED.** The production embed URL does not
  include `test-pixel=true`, so normal `/apply` is not expected to expose
  iClosed server events in Meta Test Events. Visit `/apply?test-pixel=true`
  for a true embedded-flow test, or `/?test-pixel=true` for the full homepage
  -> apply -> calendar path.
- **Dataset Quality API: ENABLED.** Meta's UI says opt-out is unavailable once
  configured. This is expected and is not a blocker, but it does not prove
  server events are arriving.

Sidney walked the dataset UI with Claude; current state of
"Synchro Social Data" (4309835332571875):

- **Automatic advanced matching: ON** (runbook A6 — already done)
- **First-party cookies: ON** — correct, leave on
- **"Track events automatically without code": OFF** — correct, leave OFF
  (we fire events explicitly; auto-tracking would add noise/dupes)
- **"Automatically include more detailed page info": ON** — harmless
- **Auto tracking (offline events → campaigns): OFF** — turn on in phase 3
- **Ad account already linked** (Settings → Sharing → SynchroSocial Ads)
- **Domain allow list: `synchrosocial.com` already on it** (19 historic
  events received, "no activity for 27 days" — the old test data)
- **Diagnostics shows 1 stale warning**: "Confirm domain that belong to you"
  (detected Jun 3, 2026). The domain IS allowlisted; the warning predates
  that and only re-evaluates when new events flow. Resolution: dismiss via
  the ⋯ menu on the Diagnostics tab, or just wait — it self-clears once the
  merged pixel starts sending events. NOT a blocker.
- **CAPI setup options in the dataset Settings**: "Set up with Meta"
  (April-2026 one-click), "Set up direct integration", "partner
  integration". For the iClosed plan use **"Set up direct integration"**
  → generate the access token there (with Dataset Quality API is fine) →
  paste token + dataset ID into iClosed → Integrations → Meta Pixel.
  Do NOT use one-click "Set up with Meta" — it's Meta-managed and separate
  from iClosed's token-based integration.

## 9. Known issues / open items

Current open items:

1. **Final embedded-flow proof:** CAPI is proven directly and through iClosed
   test mode. Still run one test at `/apply?test-pixel=true` so the actual
   website embed path carries iClosed's test flag and shows Server rows in Meta
   Test Events.
2. **CAPI token exposed:** regenerate before production use.
3. **CRM feedback loop not implemented:** HubSpot stage/value outcomes are not
   yet pushed back to Meta. This is the key remaining Step 2 item for "CAC,
   not CPL."
4. **HubSpot source/quality tagging incomplete:** contacts/deals are created,
   but the current n8n normal booking handler does not yet persist ad campaign,
   source, quality, bad-fit, or closed-won value fields for reporting.
5. **Resolved:** n8n router slug gap. Published workflow version
   `9e70e07e-6e49-4b0f-a040-1be7e1f0f97d` routes
   `social-media-consultation` to the normal funnel handler.

Historical items from PR #27 handoff:

1. ⚠️ **n8n router slug gap (PRODUCTION BUG, pre-existing):** workflow
   "Sales — Call Booked (iClosed)" (`xoPqojySDriQ8Mzh`, webhook
   `/webhook/iclosed-call-booked`) filters `event_slug` for `ai-intro-call`
   and `vsl-funnel` only. `/apply` now books **`social-media-consultation`**
   (re-pointed ~Jul 7), which falls into "Ignore Other Event Types" → no
   HubSpot contact, no deal, no confirmation email, no nurture. Fix: change
   the "Is Normal Funnel Event?" condition `vsl-funnel` →
   `social-media-consultation` (or match both). One string. NOT yet applied —
   awaiting Sidney's OK since it activates live customer emails.
2. iClosed redirect query params on `/thank-you` — unknown; check with a test
   booking (would enable browser-side advanced matching + richer dedup).
3. HubSpot free tier Meta integration limits — unresearched (see RESEARCH.md).
4. Events Manager Diagnostics warning — read it once events flow.
5. The `iclosed_potential` custom event can fire twice per lead (iClosed quirk
   when the form collects email AND phone) — fine for audiences, don't use it
   as a KPI.

## 10. Session log

- **2026-07-08 (CAPI audit + embedded test-mode pass-through)** - Ran a direct
  CAPI smoke test against dataset `4309835332571875`; Meta accepted it
  (`events_received: 1`) and displayed the test `Lead` as `Received From:
  Server`. Tested iClosed's `test-pixel=true` flow and saw server-side
  `Potential`, `Qualified`, `invitee_meeting_scheduled`, and `PageView`.
  Audited the repo and found the normal website embed uses the production
  iClosed URL without `test-pixel=true`; added a safe pass-through so
  `/apply?test-pixel=true` tests the actual embedded flow in Meta Test Events.
  Added Apply-button preservation so `/?test-pixel=true` tests the full
  homepage -> apply path without dropping the flag.

- **2026-07-08 (implementation + live testing)** - PR #27 was merged.
  Published the n8n router fix for `social-media-consultation`; verified
  execution `224608` (returning contact confirmation) and execution `224667`
  (new contact + deal + confirmation + nurture). Added and deployed Meta
  domain verification tag in commit `0c6232d`; Meta domain verified. Tested
  live browser events in Events Manager: `PageView`, `ViewContent`, `Schedule`,
  `Lead`, and deduplication all worked. Connected iClosed Meta Pixel
  integration and observed `Potential`, `Qualified`, and
  `invitee_meeting_scheduled`; however Meta still reported these as Browser
  events, so iClosed CAPI remains unconfirmed. Setup token was exposed in
  screenshots; regenerate before production CAPI use.

- **2026-07-08 (later)** — Walked Events Manager with Sidney: captured full
  account IDs, confirmed AAM already on / ad account linked / domain
  allowlisted, diagnosed the Diagnostics warning as stale (see §8), decided
  the CAPI token path ("Set up direct integration", not one-click). PR #27
  open, awaiting Sidney's merge. n8n router fix still awaiting go-ahead.
- **2026-07-08** — Project kickoff (this branch). Read the gameplan Google Doc;
  audited repo + live site (no existing tracking found); confirmed funnel map;
  pulled HubSpot portal facts via connector. Discovered existing n8n sales-ops
  layer (iClosed booking webhook → HubSpot contact+deal; contract-signed →
  closedwon) and the router slug gap (§8.1). Ran deep research (23 sources,
  25 claims adversarially verified → RESEARCH.md). Implemented: site-wide
  pixel, iClosed postMessage bridge, Schedule+Lead conversion with
  sessionStorage dedup, ViewContent on /apply + /call, static-page snippets.
  Wrote README (this file), SETUP_RUNBOOK.md, RESEARCH.md. All pushed to
  `claude/meta-ads-infrastructure-w47kkb`. Not done: n8n router fix (needs
  go-ahead), everything in §7 manual checklists.
