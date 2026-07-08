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

## 4. What is DONE in this repo (branch `claude/meta-ads-infrastructure-w47kkb`)

- [x] `src/components/MetaPixel.astro` — official base snippet, pixel ID
  `4309835332571875`, fires PageView everywhere, `noscript` fallback.
  Supports an optional per-page event with a random `eventID` (stored in
  `sessionStorage.mp_last_event`) so a future CAPI relay can deduplicate.
- [x] `Layout.astro` accepts `metaEvent={{ name, params }}` and passes it through.
- [x] Pixel snippet added to `public/ai-invite/index.html`, `schedule-clients.html`,
  `schedule-investors.html`.
- [ ] Funnel conversion events on `/apply` and `/thank-you` — pending the
  deep-research conclusions on event naming (Schedule vs Lead vs
  SubmitApplication) and dedup pattern. **NEXT THING TO FINISH.**

## 5. Decisions log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-07-08 | Ads target main funnel, not `/ai` | Sidney's instruction |
| 2026-07-08 | Fresh start on dataset `4309835332571875`; old Framer pixel abandoned | Old pixel wasn't migrated; dataset already created in Events Manager |
| 2026-07-08 | Pixel installed site-wide via one component in `Layout.astro` | Single source of truth; every page auto-covered |
| 2026-07-08 | Launch browser-pixel-first; add CAPI as phase 2 | Static host = no server; don't block ad launch on relay infrastructure |
| 2026-07-08 | No cookie-consent banner for now | US-targeted traffic; revisit if targeting EU (GDPR) |

## 6. What remains (the checklist)

### In Meta Business Suite / Events Manager (manual, needs Sidney or admin)
- [ ] Verify the domain `synchrosocial.com` (Business Settings → Brand Safety →
  Domains; DNS TXT record is easiest — DNS lives wherever synchrosocial.com is registered)
- [ ] Check the **Diagnostics (1)** warning on the dataset once events flow
- [ ] Confirm ad account exists, payment method set, and the dataset is linked
  to the ad account
- [ ] After pixel deploys: use **Test Events** with the live site to verify
  PageView + conversion events
- [ ] Configure the conversion event for campaign optimization once it exists

### In this repo
- [ ] Fire the booked-call conversion on `/thank-you` and a funnel-step event on
  `/apply` (names pending research — see §7)
- [ ] Merge to `main` → auto-deploys to production

### CAPI (phase 2 — research pending)
- [ ] Choose relay: Meta CAPI Gateway vs Stape vs self-hosted n8n (an n8n
  instance IS connected to Sidney's toolset) vs HubSpot-native option
- [ ] Wire booked-call event server-side with same `eventID` for dedup

### CRM feedback loop (phase 3)
- [ ] Get iClosed bookings into HubSpot as contacts (check iClosed native
  integrations; worst case n8n/Zapier/manual)
- [ ] Tag lead source (`hs_analytics_source = PAID_SOCIAL`, UTMs) on ad-driven contacts
- [ ] Push qualified (`opportunity`) and closed (`customer`) stages back to
  Meta as offline/CRM events so campaigns can optimize toward CAC, not CPL

## 7. Open questions (research in flight)

A deep-research report on the 2026 technical specifics was commissioned on
2026-07-08 (results to be appended as `docs/meta-ads/RESEARCH.md`):

1. Best standard event for a booked call (Schedule vs Lead vs SubmitApplication) and how optimization treats each
2. CAPI options with no server + free HubSpot (Gateway pricing, Stape, n8n community node)
3. iClosed tracking hooks: postMessage events? native pixel field? query params on the /thank-you redirect (→ advanced matching)?
4. HubSpot free tier: what Meta lead-sync / offline-event features are included
5. Whether Aggregated Event Measurement / event prioritization still applies in 2026
6. Advanced matching options on a static site

## 8. Session log

- **2026-07-08** — Project kickoff (this branch). Read the gameplan Google Doc;
  audited repo + live site (no existing tracking found); confirmed funnel map;
  pulled HubSpot portal facts via connector; installed pixel base code
  site-wide + static pages; commissioned deep research on 2026 Meta setup
  specifics. Pending: conversion events, research doc, Events Manager runbook.
