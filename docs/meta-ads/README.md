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

**Leads who abandon the booking form** (added 2026-08-14) are captured
server-side off iClosed's "Contact by status" webhook and emailed a recovery
follow-up — see `client-analytics/docs/CLIENT_LIFECYCLE_MAP.md` §2b. This is
the main second-chance path for paid traffic that does not convert on the
first visit, and it is where `utm_*` / `fbclid` attribution is currently
captured (as a JSON blob on the HubSpot contact — §6 decisions).

---

## 4. The event map (FINAL — implemented)

| Event | Where it fires | How |
| --- | --- | --- |
| `PageView` | every page | base pixel (`MetaPixel.astro` in `Layout.astro`; manual snippet in `public/ai-invite/*.html`) |
| `ViewContent` (content_name `apply` / `call`) | `/apply`, `/call` | `metaEvent` prop on `Layout` |
| ~~`iclosed_potential` / `iclosed_qualified` / `iclosed_disqualified`~~ (custom, REMOVED 2026-08-17) | — | Used to fire from the postMessage bridge in `IClosedEmbed.astro`. Duplicated iClosed's own native Meta integration, which already fires `Potential`/`Qualified`/`Disqualified` (capitalized) browser+server, deduped by `event_id`. Removed after confirming via Meta Ads Manager that no custom conversion or audience depended on the lowercase names. Use the native capitalized events for any mid-funnel retargeting/fallback need. |
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
| 2026-08-14 | Capture abandoned bookings **server-side**, off iClosed's "Contact by status" webhook (`/webhook/iclosed-lead-abandoned`) | iClosed's browser `postMessage` carries only `{type}` — there is no lead identity in it, so the browser cannot detect an abandon. This is a second iClosed webhook lane alongside `iclosed-call-booked`. |
| 2026-08-14 | Store paid-source attribution as **JSON blobs** in two HubSpot custom properties (`ad_attribution`, `booking_recovery`) rather than one property per field | HubSpot's free tier caps custom properties at 10 account-wide. Blobs keep `utm_*`, `fbclid`, referrer, calendar and timestamps without burning the budget — at the cost of not being filterable in HubSpot reporting. |
| 2026-08-14 | Recovery email sends with **no unsubscribe link** | Owner decision. It is a 1:1 transactional follow-up to someone who started booking, not a marketing broadcast. Revisit if volume grows or if targeting EU. |
| 2026-08-14 | Ad attribution is passed **into the iClosed booking URL**, not POSTed from the browser | The iframe is on another origin, so click ids and cookies do not cross it. Appending `utm_*`/`fbclid` to the booking URL makes iClosed store them on the contact and hand them back in its webhook — attribution and identity arrive already joined. Implemented in `IClosedCapture.astro`. |
| 2026-08-14 | Unfinished-booking capture uses iClosed's **"Contact by status" webhook**, never browser postMessage | iClosed's postMessage payload carries only `{type}` — no name, email, phone or id (verified against their GTM guide). Browser capture is impossible; the server-side contact record is complete. |
| 2026-08-14 | HubSpot stays a **record store**, all logic in n8n | Free tier has no workflow automation, and only 10 custom properties account-wide. Matches the existing pattern for the whole sales stack. |
| 2026-08-14 | Anything reading deal stage keys on **stage ids**, never on `closedwon`/`closedlost` | Those values are relabelled and no longer mean what they say — see `booking-recovery/HUBSPOT_SCHEMA.md` §1. A CAC feedback loop keying on won/lost would push that error into ad optimisation. |
| 2026-08-17 | Removed the `iclosed_potential`/`iclosed_qualified`/`iclosed_disqualified` custom `trackCustom` calls from `IClosedEmbed.astro`'s postMessage bridge | They duplicated iClosed's own native Meta integration (`Potential`/`Qualified`/`Disqualified`, browser+server, deduped by `event_id`). Verified via Meta Ads Manager (`ads_get_customconversions`, `ads_get_ad_account_custom_audiences`) before removing: the account's one live custom conversion ("Qualified Application", `2110443739684279`) is built on the native `Qualified` event, not `iclosed_qualified`; zero custom audiences exist on the account. `Schedule`/`Lead` (the real booked-call conversion) and the `/thank-you` dedup handoff were left untouched. |
| 2026-08-19 | Renewals must be gated out of the CRM/onboarding path | A Stripe renewal for an existing client crashed the Invoice Paid workflow on a null `deal_id` and risked sending an onboarding email to a live client. Gate keys on `billing_reason === 'subscription_cycle'`. **This does not port to Commas** — see §9. |
| 2026-08-20 | Migrate the payment processor **Stripe → Commas** (commas.com / FanBasis API) | Owner decision, already taking payments. Blocks the Phase 3 CRM feedback loop until a Commas receiver exists. |
| 2026-08-20 | Optimize on **`Qualified`**, not `Call booked` | `Qualified` = booked *and* passed the disqualification bar (which screens out prospects who cannot afford the offer). Buying `Call booked` would buy bookings that get disqualified on the call. Custom conversion `2110443739684279`. |
| 2026-08-20 | Keep **both** Stripe and Commas selectable per deal, rather than cutting over | Kasper picks the processor on the Sales Intake tab alongside the billing type. A hard cutover would strand in-flight Stripe subscriptions and remove a fallback while Commas is unproven. |

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
- [x] Ad account payment method confirmed (`has_payment_method: true`,
  read from the API 2026-08-14). **Campaign is live and spending** — see §11.

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
- [x] **iClosed CAPI confirmed in PRODUCTION, not just test mode** (2026-08-14).
  The dataset shows `Potential`, `Qualified`, `Disqualified` and
  `invitee_meeting_scheduled` arriving from real traffic across Aug 9–14. This
  supersedes the "run a final embedded-flow test" item — production traffic
  proved it. It also establishes that iClosed holds lead email/phone
  server-side (it hashes them into those events), which is the basis of the
  booking-recovery capture route.
  *(Re-confirmed 2026-08-20: `ads_get_dataset_stats` on `4309835332571875`
  broken down by `event_source` returns SERVER rows every day 2026-08-13 →
  08-20, so this holds a week later too.)*

CRM feedback loop:
- [ ] Push qualified, bad-fit, closed-won, and deal-value outcomes back to Meta.
- [ ] Add/confirm HubSpot properties for paid source, campaign, lead quality,
  and CAC reporting.

### Historical checklist from PR #27 handoff

### Launch blockers
- [x] **Merge this branch to `main`** → auto-deploys the pixel to production
  *(PR #27 merged 2026-07-08)*
- [~] Ad account + payment method confirmed, dataset linked to ad account (runbook A)
  *(dataset↔ad-account link confirmed §8; **payment method still unconfirmed** —
  event traffic is not proof of spend, ask Sidney)*
- [x] Verify events with Test Events + a real test booking (runbook B)
  *(2026-07-08)*
- [x] ⚠️ **Fix the n8n booking router** (see §8 #1) — main-funnel bookings
  currently create NO HubSpot contact/deal/emails.
  *(Done 2026-07-08, re-verified live 2026-08-20.)*

### Phase 2 — server-side (fast follow, ~10 min manual)
- [x] Connect iClosed's native Meta CAPI: Events Manager → dataset Settings →
  Generate access token ("Set up manually") → paste dataset ID + token in
  iClosed → Integrations → Meta Pixel (runbook C2)
  *(Connected 2026-07-08; **proven in production 2026-08-20** — SERVER rows
  every day 2026-08-13 → 08-20.)*
- [x] ~~Create a custom conversion wrapping iClosed's `Call booked` custom
  event~~ — **superseded 2026-08-20.** "Qualified Application"
  (`2110443739684279`) wraps **`Qualified`** instead, on purpose: it means
  booked *and not disqualified*, which is the outcome worth buying. See §9
  item 6.
- [x] Enable Automatic Advanced Matching in dataset Settings
  *(§8: already ON.)*

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
   not CPL." ⚠️ When it is built, key it on deal-stage **ids** — `closedwon`
   and `closedlost` have been relabelled and no longer mean won and lost
   (`../booking-recovery/HUBSPOT_SCHEMA.md` §1). Optimising ads against that
   would be worse than not optimising at all.
4. **HubSpot source/quality tagging incomplete:** contacts/deals are created,
   but the current n8n normal booking handler does not yet persist ad campaign,
   source, quality, bad-fit, or closed-won value fields for reporting.
   *In progress 2026-08-14* — `IClosedCapture.astro` now carries `utm_*`/
   `fbclid` into the booking URL so iClosed returns them with the contact; the
   HubSpot write is specified in `../booking-recovery/HUBSPOT_SCHEMA.md` §4 and
   blocked only on write scope for the connector.
6. **~76% of booking-form starters are never contacted again** (§11). The
   biggest single loss in the funnel, and larger than any optimisation
   available inside Ads Manager. Tracked in `../booking-recovery/`.
5. **Resolved:** n8n router slug gap. Published workflow version
   `9e70e07e-6e49-4b0f-a040-1be7e1f0f97d` routes
   `social-media-consultation` to the normal funnel handler.
6. ✅ **Custom conversion — resolved 2026-08-20, deliberate.** "Qualified
   Application" (`2110443739684279`, created 2026-08-03,
   `custom_event_type: OTHER`, default value `0`) fires on `Qualified` AND
   URL containing `iclosed.io` or `synchrosocial.com`. The Phase 2 checklist
   asked for one wrapping iClosed's `Call booked`; **`Qualified` is the
   correct goal and should not be "fixed" to `Call booked`.** In this funnel
   `Qualified` means *booked a call **and** was not disqualified* — the
   disqualification bar screens out prospects who cannot afford the offer
   (e.g. under ~$1.5k). Optimizing on `Call booked` would buy bookings from
   people who get disqualified on the call; optimizing on `Qualified` buys
   bookings from people who can actually become clients. Owner's decision.
7. **Stripe → Commas blocks the Phase 3 CRM feedback loop.** Payments are
   moving to Commas (commas.com / FanBasis API, base
   `https://www.fanbasis.com/public-api/`). As of 2026-08-20 **no n8n
   workflow references Commas and no webhook subscription exists on the
   Commas account**, so a Commas payment notifies nothing — which is why two
   clients had to be advanced by hand on 2026-08-19. Two traps for whoever
   builds the receiver: (a) the renewal gate keys on Stripe's
   `billing_reason`, a field Commas never sends — Commas signals renewals as
   their own event type `subscription.renewed`, so branch on `body.type`;
   (b) **Commas delivers at-most-once — a failed delivery is logged and
   never retried**, so a missed webhook is missed permanently.
8. **Paid-source tagging is half-built.** `Sales — Booking Recovery Capture`
   writes `ad_attribution` (`utm_source/medium/campaign/content`, `fbclid`,
   referrer, calendar, `captured_at`) and `booking_recovery` onto the HubSpot
   contact — but only for leads who **abandoned**. Leads who actually book
   still get no campaign/source fields, so checklist item "Add/confirm
   HubSpot properties for paid source, campaign, lead quality, CAC" is
   partially, not fully, addressed.

Historical items from PR #27 handoff:

1. ⚠️ **n8n router slug gap (PRODUCTION BUG, pre-existing):** workflow
   "Sales — Call Booked (iClosed)" (`xoPqojySDriQ8Mzh`, webhook
   `/webhook/iclosed-call-booked`) filters `event_slug` for `ai-intro-call`
   and `vsl-funnel` only. `/apply` now books **`social-media-consultation`**
   (re-pointed ~Jul 7), which falls into "Ignore Other Event Types" → no
   HubSpot contact, no deal, no confirmation email, no nurture. Fix: change
   the "Is Normal Funnel Event?" condition `vsl-funnel` →
   `social-media-consultation` (or match both). One string.
   ✅ **RESOLVED 2026-07-08, re-verified live 2026-08-20** — the published
   `Is Normal Funnel Event?` condition matches `social-media-consultation`.
   This entry is kept for history only; see current item 5. *(The same stale
   warning also sits in `SETUP_RUNBOOK.md` around L110.)*
2. iClosed redirect query params on `/thank-you` — unknown; check with a test
   booking (would enable browser-side advanced matching + richer dedup).
3. HubSpot free tier Meta integration limits — unresearched (see RESEARCH.md).
4. Events Manager Diagnostics warning — read it once events flow.
5. **Historical, superseded by §6:** `iclosed_potential` (removed 2026-08-17)
   used to fire twice per lead when the booking form collected email AND
   phone (iClosed quirk). The same double-fire quirk applies to iClosed's
   native `Potential` event — see §11's reporting note — halve it before
   quoting as people, regardless of which stream you're reading.

## 11. Live campaign state (2026-08-14)

First read of real spend. Campaign **Prospecting | Leads | US | Aug 2026**
(`120243068755680573`), `OUTCOME_LEADS`, $150/day, ACTIVE since Aug 7.

| 7 days | |
| --- | --- |
| Spend | $625.95 |
| Impressions / clicks | 5,761 / 180 |
| Landing page views | 139 |
| Leads (attributed) | 7 @ $89.42 |
| Qualified Application (custom conv. `2110443739684279`) | 5 @ $125.19 |

Dataset-level events tell the more useful story: ~33 distinct people entered
contact info in the booking form, and 8 booked. **~25 people a week hand over
name and phone and are never contacted again** — about $474/week of spend.
That is what the booking-recovery project exists to fix; full derivation and
its one soft assumption in `../booking-recovery/README.md` §1.

Note for reporting: `Potential` fires **twice** per lead when the form takes
both phone and email (§9.5), so halve it before quoting it as people.

## 10. Session log

- **2026-08-20 (six-week catch-up audit)** - The doc had not been touched
  since 2026-07-09; this entry closes that gap. Verified against live Meta
  and n8n rather than memory. **iClosed CAPI is now confirmed in
  production**: `ads_get_dataset_stats` on `4309835332571875` broken down by
  `event_source` returns SERVER rows *every day* from 2026-08-13 to
  2026-08-20, alongside browser events — which retires both the "CAPI remains
  unconfirmed" line below and §8's "no activity for 27 days". Found an
  undocumented custom conversion **"Qualified Application"**
  (`2110443739684279`, created 2026-08-03, last fired 2026-08-19) wrapping
  the `Qualified` event — note the Phase 2 checklist asked for one wrapping
  **`Call booked`**, so the optimization goal needs a decision. Documented
  the **abandoned-booking recovery lane** (built 2026-08-14) as the main
  follow-up path for paid traffic that does not convert on the first visit —
  it also writes an `ad_attribution` JSON blob (`utm_*`, `fbclid`, referrer,
  calendar) onto the HubSpot contact, which is a partial answer to the
  paid-source tagging item. Confirmed the router-slug warning in §9 is stale
  (live `Is Normal Funnel Event?` matches `social-media-consultation`).
  Recorded the Stripe → Commas processor migration as a blocker for the
  Phase 3 CRM feedback loop. Ticked the launch-blocker and Phase 2 items that
  live checks show are already done.

- **2026-08-17 (tracking cleanup — removed redundant iClosed bridge events)**
  — Sidney flagged that `synchrosocial.com/apply` fires custom
  `iclosed_potential`/`iclosed_qualified`/`iclosed_disqualified` events
  alongside iClosed's own native Meta Pixel integration, which already fires
  `Potential`/`Qualified`/`Disqualified` natively (browser+server, deduped by
  `event_id`). Read the bridge in `IClosedEmbed.astro` and found it does two
  separable things: the three custom events above (redundant), and the
  `Schedule`+`Lead` fire on `iclosed.call_scheduled` (the actual booked-call
  conversion — not redundant, left untouched). Verified in Meta Ads Manager
  *before* touching anything: the account's one custom conversion ("Qualified
  Application", `2110443739684279`) is built on the native `Qualified` event,
  not `iclosed_qualified`; zero custom audiences exist on the account. No
  Google Tag Manager involved — confirmed inline in the Astro component and
  matched against the live production HTML. Removed the three redundant
  `trackCustom` calls; updated `SETUP_RUNBOOK.md` §B2/§D1 and this doc's §4
  and §9 to stop referencing the removed events and point any future
  mid-funnel fallback need at the native capitalized events instead. Note:
  Sidney is separately re-enabling iClosed's native `Potential` trigger and
  switching the campaign's optimization event to it — unrelated to this
  change; native capitalized events were not touched.

- **2026-08-14 (booking recovery + attribution)** — Read the live campaign and
  dataset for the first time since launch (§11). Closed two open items: the ad
  account has a payment method, and iClosed CAPI is confirmed in production
  rather than only in test mode. Started the booking-recovery project
  (`../booking-recovery/`) to follow up abandoned bookings and to finally carry
  ad attribution into the CRM — the missing half of §9 item 4 and the
  precondition for CAC reporting. Established that iClosed's postMessage
  payload carries only `type`, so the capture route is iClosed's server-side
  "Contact by status" webhook; attribution is passed into the booking URL so it
  rejoins the lead server-side. Shipped the passthrough component; drafted the
  n8n workflows. Nothing live yet.

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
  *(Superseded 2026-08-20: iClosed CAPI is confirmed — SERVER-sourced events
  every day 2026-08-13 → 08-20. The token regeneration item still stands.)*

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
