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

## 2. Accounts & IDs

| Thing | Value |
| --- | --- |
| Domain | `synchrosocial.com` (GitHub Pages, repo `sidney-afk/synchrosocial`, auto-deploys `main`) |
| Meta business portfolio | "Synchro Social" (ID starts `895720379894…` — see Events Manager header) |
| Meta Events Manager dataset | **"Synchro Social Data", ID `4309835332571875`** (= the pixel ID) |
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

## 5. What is DONE in this repo (branch `claude/meta-ads-infrastructure-w47kkb`)

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

## 6. Decisions log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-07-08 | Ads target main funnel, not `/ai` | Sidney's instruction |
| 2026-07-08 | Fresh start on dataset `4309835332571875`; old Framer pixel abandoned | Old pixel wasn't migrated; dataset already created in Events Manager |
| 2026-07-08 | Pixel installed site-wide via one component in `Layout.astro` | Single source of truth; every page auto-covered |
| 2026-07-08 | Launch browser-pixel-first; CAPI = phase 2 via **iClosed's native integration** (NOT CAPI Gateway, NOT Stape, NOT n8n for the booking event) | Research: Gateway needs a paid cloud instance; iClosed sends CAPI events (incl. `Call booked`) from its own servers with hashed em/ph + fbp/fbc, free, ~10 min to set up |
| 2026-07-08 | Booked call fires BOTH `Schedule` and `Lead` (same eventID root) at the bridge + `/thank-you` fallback | Semantics unresolved by research; both available in Ads Manager, pick one, no code change needed |
| 2026-07-08 | n8n reserved for phase 3 (CRM offline events: qualified/closed → CAPI) | iClosed covers the booking event; n8n's existing Contract-Signed/deal-stage workflows are the natural hook for CAC events |
| 2026-07-08 | No AEM/web-event config work | Research: prioritization eliminated, AEM tab removed (2026) |
| 2026-07-08 | Domain verification = recommended, not blocking | Research: not required for event processing |
| 2026-07-08 | No cookie-consent banner for now | US-targeted traffic; revisit if targeting EU (GDPR) |

## 7. What remains (the checklist)

Detailed steps live in `SETUP_RUNBOOK.md`. Summary:

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

## 8. Known issues / open items

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

## 9. Session log

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
