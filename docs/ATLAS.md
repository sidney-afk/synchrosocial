# Synchro Social — Enterprise Atlas

> **The root of the single source of truth.** This is the top of the vault: what
> Synchro Social *is*, floor by floor, with every floor linking down into the
> detailed map that already owns that ground. Written under the owner mandate in
> `client-analytics` repo → `docs/vision/STEP_BACK_2026-07-18.md` (read it for
> the *why*; its angle table is this document's chapter list).
>
> **Session 1 charter: document what we are — improve nothing yet.** Judging
> whether any of it is the *best* way (the owner's "software craft" angle and
> the improvement pass) is explicitly deferred — pin P4 in the vision doc.
>
> **Last verified:** 2026-07-19 (Enterprise Atlas session 4). Session 1
> documented from artifacts; session 2 folded in **the owner's answers to all
> 20 owner questions** plus an owner-invited read-only rhythms sweep; session 3
> audited the vault itself (pins P2/P3 — see `client-analytics` →
> `docs/audits/2026-07-19-vault-audit.md`) and shipped the retrieval router;
> session 4 folds in the owner's repo answers and two structural decisions
> (mirror retired, router live). Sources: both repos
> (`sidney-afk/synchrosocial`, `sidney-afk/client-analytics`), their docs
> layers, the public site source, and the owner's answers. No live-system
> writes, ever.
>
> **How to use this doc:** read the floor you need, then follow its links.
> Nothing detailed is duplicated here — if a floor has a master map, this doc
> points at it (atlas-first doctrine: link, never copy). Numbered **OQ-n**
> items are owner questions; resolved ones keep their number and carry the
> dated answer in place (numbers are never reused). Questions the owner
> redirected to Kasper live in the **Kasper questions** appendix (**KQ-n**).
> The full ledger is compiled at the end.

---

## The floors

| # | Floor | Angle (vision doc) |
|---|---|---|
| 1 | [The company](#floor-1--the-company) | 1 — Company (owner-named) |
| 2 | [The properties](#floor-2--the-properties) | 2 — Software (documented; judged later) |
| 3 | [The internal systems](#floor-3--the-internal-systems) | 2 — Software (documented; judged later) |
| 4 | [The client's chair](#floor-4--the-clients-chair) | 3 — Journey as lived |
| 5 | [People & knowledge](#floor-5--people--knowledge) | 4 — Who does what |
| 6 | [Rhythms](#floor-6--rhythms) | 5 — Recurring loops |
| 7 | [Dependencies](#floor-7--dependencies) | 6 — What we stand on |
| 8 | [Data](#floor-8--data) | 7 — What we own |
| 9 | [History & decisions](#floor-9--history--the-decision-registers) | 8 — Institutional memory |
| 10 | [Economics](#floor-10--economics) | 9 — **Owner questions only** (public repo) |
| 11 | [The human+AI operating system](#floor-11--the-humanai-operating-system) | 10 — The meta layer |
| — | [Maintenance covenant](#maintenance-covenant) · [Owner-question index](#owner-question-index) · [Kasper questions](#kasper-questions) | — |

---

## Floor 1 — The company

**What Synchro Social is:** a social-media marketing agency that runs
done-for-you short-form content programs for personal brands — primarily on
Instagram, with TikTok and YouTube strategies layered per client — plus a
second, newer offering that builds and operates an **AI clone** of the client
so content gets produced without the client filming.

**Who it serves (public positioning, from the live homepage):** established
coaches, thought leaders, course creators, personal brands, podcasters, and
educators who want content, follower growth, and lead generation handled for
them. The homepage's public proof claims: 100+ clients, 8M+ followers grown,
1B+ content views, 23K+ leads. The public client list (12 named leaders with
follower counts) lives in `src/pages/index.astro` — per atlas hygiene, client
names are never copied into docs; link there.

**The ideal client, in the owner's words (2026-07-18):** an expert, thought
leader, or coach **with budget** who does not do social media themselves and
wants it fully handled.

**The method as sold** (homepage, "Our Proven 3-Step Formula"):
**Generate traffic** (audience research → messaging, angles, hooks) →
**Nurture traffic** (on-brand engaging content) → **Monetize traffic** (leads
on autopilot via content + back-end systems). Organic-first positioning — the
comparison section explicitly sells *against* ad-spend dependence and fake
followers.

**The two offerings are two funnels through one pipeline:**

| | Normal funnel (purple) | AI funnel (coral) |
|---|---|---|
| Service | Done-for-you social content & growth | AI-clone content production |
| Cold entry | `/` → `/apply` | `/ai` → `/call` |
| Distinguished by | iClosed calendar booked → HubSpot `is_ai_client` → Supabase table (`client_onboarding` vs `ai_client_onboarding`) | same three markers |
| Strategic status (owner, 2026-07-18) | The core offer — current ads target this funnel exclusively | A **side offer today, a real growth bet later**: deliberately sequenced after meta-ads brings more normal-client volume |

**How a client is found → sold → onboarded → served** — the master map is
[`docs/CLIENT_LIFECYCLE_MAP.md`](CLIENT_LIFECYCLE_MAP.md) (mirrored in both
repos). Compressed to one breath: ads/events/direct → site page → iClosed
booking → HubSpot contact+deal + confirmation + 6-email nurture → Zoom sales
call (Kasper) → close (AI: post-call form; Normal: Sales Intake tab) →
contract (eSignatures) + first invoice (Stripe) gates → onboarding email → 4
onboarding pages + SyncView onboarding form → provisioning (part automated,
part manual runbook) → sample edits approved → the production loop (filming
plans → filming → editing in Linear → SMM/Kasper/client review in SyncView →
scheduled → posted) → ongoing metrics, weekly reports, monthly check-ins.

**Team roles as evidenced in the artifacts** (full floor: [People](#floor-5--people--knowledge)):
Kasper (sales calls, kickoff/strategy calls, filming plans, the "Kasper
approval" review stage, host of every booking calendar), Sidney (owner-side
operator of the entire automation/AI layer; recipient of every operational
alert), social media managers (per-client assignment), video editors and
graphic designers (Linear VID/GRA teams, auto-assigned by workload).

**The tool inventory** (everything the company runs on, evidenced from the
repos; the *what-breaks-without-it* view is [Floor 7](#floor-7--dependencies)):

| Layer | Tool | Role |
|---|---|---|
| Marketing site | Astro + Tailwind static site on GitHub Pages (`synchrosocial.com`) | All funnels, landing pages, onboarding pages |
| Booking | iClosed (9 calendars, host kasper@) | Every call booked; webhooks trigger the sales automation |
| Sales CRM | HubSpot (free tier) | Contact + deal state machine for the whole sales funnel |
| Automation hub | n8n cloud (`synchrosocial.app.n8n.cloud`, 92 workflows) | Sales, onboarding, provisioning, production, reports, monitoring — the integration hub |
| Ops database | Supabase (Postgres + realtime + Edge Functions) | Live operational store: calendar, samples, onboarding, credentials vault, PTO, Track-B tables |
| Legacy data | Google Sheets | Still live for: client roster (`Clients Info` = the allowlist), SMM/editor rosters, metrics & research analytics |
| Ops dashboard | SyncView (`syncview.synchrosocial.com`, the `client-analytics` repo) | The internal single-page app the team runs the content pipeline in |
| Task tracking | Linear (VID + GRA + 4 more teams; one project per client) | Production tasks; being replaced in-app (Track B) |
| Comms | Slack (per-client channels, `#name-creative`, `#video-editing`, alert DMs) + **Roam** | Internal team communication moved to Roam (virtual-office app; last Slack day set 2026-07-07 — session-2 sweep). Slack remains the automation/alert rail and channel home |
| Email | Gmail via n8n (`hello@synchrosocial.com`, single "Hello email" credential) | Every client-facing email |
| Contracts / payment | eSignatures.com · Stripe | Agreement signing · payment links + invoice webhook |
| Ads & tracking | Meta Pixel/CAPI (one dataset), HubSpot feedback loop planned | Paid acquisition; memory: [`docs/meta-ads/README.md`](meta-ads/README.md) |
| Video hosting | Wistia (onboarding videos), YouTube (site videos) | Client-facing video delivery |
| Content research | Sandcastles; Apify (IG/TikTok scraping) | Competitor/market research, metrics collection |
| AI production | Anthropic Claude, Gemini, Replicate, OpenAI Whisper | AI thumbnail pipeline, captions, transcription |
| Auto-posting | Post For Me + first-party TikTok pilot | TikTok publishing |
| Files | Google Drive/Docs | Client folders (raw footage, source material), filming-plan docs, backups |
| Edited clips | Frame.io | The edited-deliverable library (raws stay in Drive) — owner-confirmed 2026-07-18; absent from repo artifacts until then |
| Infra | GitHub (repos, Pages hosting, Actions CI/crons), Namecheap (DNS) | Both sites deploy from `main`; reconcilers and watchdogs run as Actions |
| Legacy | Notion (old onboarding forms, read-only import), Framer/Calendly (fully migrated off) | History only |

- **OQ-1 — resolved (owner, 2026-07-18):** ideal client = expert/thought
  leader/coach with money who doesn't do social media and wants it fully
  handled. Folded into "The ideal client" above.
- **OQ-2 — resolved (owner, 2026-07-18):** AI-clone is a side offer today and
  a real growth bet once meta-ads brings volume — "pursue after more normal
  clients." Folded into the offerings table above.

---

## Floor 2 — The properties

Link, don't copy — each property has its own master doc.

**`synchrosocial.com`** — repo **`sidney-afk/synchrosocial`**. The public
marketing site: Astro 5 + Tailwind 4 static pages, two color-coded funnels
(purple main, coral AI), all booking embedded via iClosed, Meta Pixel on every
page. Pushes to `main` deploy the live site via GitHub Pages.

- Page ↔ funnel ↔ booking-calendar map: [`docs/ECOSYSTEM_MAP.md`](ECOSYSTEM_MAP.md)
- Ads/tracking memory: [`docs/meta-ads/README.md`](meta-ads/README.md)
- Page list & editing guide: [`README.md`](../README.md)

**`syncview.synchrosocial.com`** — repo **`sidney-afk/client-analytics`**.
SyncView, the internal client-operations dashboard: a single-file SPA
(`index.html`) over Supabase + n8n + Sheets + Linear, running the content
pipeline end to end (calendar, samples review, onboarding inbox, sales intake,
filming plans, workload, PTO, analytics). Merging to `main` deploys
immediately.

- What it does + architecture: the repo's `README.md`
- Where everything lives (CI-enforced): the repo's `REPO_MAP.md`
- A self-contained sister app, **SyncThumbnails**, is served at `/thumbnails/`
  from the same repo.

**The shared spine** — [`docs/CLIENT_LIFECYCLE_MAP.md`](CLIENT_LIFECYCLE_MAP.md)
maps the whole client lifecycle. **The byte-identical mirror is retired
(owner decision 2026-07-19).** It drifted silently in July because the
contract was structurally unenforceable — a single-repo session cannot write
the sibling copy and no machine ever compared them (vault audit VA-2, P1). The
new rule: the **canonical copy lives in `client-analytics`**; this repo keeps
a short **pointer stub** at the same path. (The mechanical stub-swap is the
one remaining follow-through; until it lands, treat the `client-analytics`
copy as authoritative.) Note the map's own 2026-07-14 cutover-safety banner:
its Track A/B sections are historical — current migration truth is the
`client-analytics` System Map and cutover register.

**Other repos under the account** (owner-identified 2026-07-19; discharges the
vault audit's open question VA-9 / P8). These are **not** vault repos — they
carry no documented single-source-of-truth and no floor links down into them —
but they exist under `sidney-afk`, so the map names them so nothing is
unaccounted for:

- **`synchro-crm`** — Kasper's own CRM experiment.
- **`project-central`** — a central tracking board for the owner's work,
  rarely updated.
- **`letitbe`** — the owner's personal repo.
- Two further repos (`ai-invite`, `claude`) are archived/dormant.

---

## Floor 3 — The internal systems

The deep layer lives in the `client-analytics` repo's **truth layer** — living,
freshness-stamped, partially CI-enforced docs. Entry points, in read order:

| Doc (in `client-analytics`) | What it owns |
|---|---|
| `docs/truth/BRIEFING.md` | **Read first in any SyncView session** — what the system is, laws, live-safety state, standing hazards |
| `REPO_MAP.md` | Where everything lives in the repo (enforced by `test/repo-map-sync.js`) |
| `docs/independence/SYSTEM_MAP.md` | The whole-website system map: backends, every surface, endpoint inventory |
| `docs/QUALITY_TIERS.md` | The owner-ratified quality contract — what each zone of the product *promises*, per tier |
| `docs/truth/README.md` | The truth-layer contract itself (freshness stamps, machine checks) |
| `docs/independence/INDEPENDENCE_PLAN.md` | The active program to reduce n8n/Linear dependence (Track A / Track B) |
| `ROLLBACK.md` + `EXECUTION_LOG.md` | The rollback law + the running log of every deploy, flag flip, migration, incident |

---

## Floor 4 — The client's chair

The journey as the client lives it — every touchpoint they see, in order.
(System internals for each step: lifecycle map §§1–10.)

1. **An ad or an event** → a purple or coral landing page.
2. **A booking widget** (iClosed embed) — the two cold calendars qualify and
   can disqualify; warm doors (events, invites) book friction-free.
3. **"You're booked"** — confirmation email, then a 6-email nurture drip
   paced to their call date (stops silently if they cancel).
4. **A Zoom call with Kasper.**
5. **One combined email**: the agreement signing link (eSignatures) + the
   first invoice (Stripe payment link).
6. **The onboarding email** → four short onboarding pages (video → form →
   book kickoff call → final words), purple or coral to match their funnel.
7. **The onboarding form** (SyncView, no login): brand, audience, style
   preferences, a sample video (or AI-avatar preferences on the AI funnel),
   photos/source material, goals, account access.
8. **A kickoff/strategy call** (60 min with Kasper).
9. **Sample edits to approve** — subtitle styles, thumbnail looks — before
   real content starts.
10. **The steady state**: filming from Kasper's monthly filming plan (or the
    AI clone generates), content appears for their review via a tokenized
    no-login review link, tweak requests flow back as comments, approved
    content gets scheduled and posted; a weekly top-reel lands in their Slack
    channel; "your content is ready 🎉" emails; a monthly check-in email
    offers a call.

Client-facing surfaces, complete list: the marketing site; iClosed booking
pages; emails from `hello@synchrosocial.com`; the eSignatures signing page;
Stripe checkout; the onboarding form; tokenized SyncView review links
(`?c=<name>&t=<token>` — Tier 0, never knowingly broken, per
`docs/QUALITY_TIERS.md`); their Slack channel.

- **OQ-3 — resolved as a knowledge gap (owner, 2026-07-18):** the owner
  doesn't know what clients complain about or ask for — first-hand client
  feedback concentrates with Kasper. Recorded as **KQ-1** in the
  Kasper-questions appendix; the atlas has no complaints picture yet.
- **OQ-4 — resolved (owner, 2026-07-18):** a typical client stays roughly
  **6–9 months**, and the usual exit reason is **results falling short of what
  they hoped for**. No churn *data* exists in any system — this is the
  owner's read, not a measured number.
- **OQ-5 — resolved (owner, 2026-07-18):** there is **no first-30-days
  playbook** beyond onboard → samples → approve → production begins; the
  early experience is improvised per client. Marked as a potential future
  asset (a deliberate "what we could build" note, not a defect — this atlas
  documents, it doesn't improve).

---

## Floor 5 — People & knowledge

Where knowledge concentrates, as evidenced in artifacts. **The full human
roster is owner knowledge** — only two people are named across the entire
documentation layer:

| Person | Evidenced role | Knowledge that concentrates there |
|---|---|---|
| **Kasper** | Every booking calendar's host; runs sales calls, kickoff/strategy calls; writes each client's monthly filming plan; the "Kasper approval" stage in every review flow; the Kasper-gated review/intake surfaces in SyncView | The client relationships, the sales motion, per-client content strategy, the filming-plan voice |
| **Sidney** (owner) | Operates the automation + AI layer; the single recipient of every operational alert DM ("SyncView Bot"); holds the connected HubSpot/n8n/Gmail/Slack/Drive tooling; commissions and reviews the AI sessions | The entire systems layer: n8n, Supabase, the repos, the vault, the AI operating system |
| Social media managers | Per-client assignment in the `Social Media Managers` sheet (with per-SMM Linear keys, Slack IDs); SMM approval stage; weekly reports | Per-client execution context |
| Video editors / graphic designers | Linear VID / GRA teams; auto-assigned per video by open-issue count; `Video Editors` sheet | Editing craft; per-client style familiarity |
| (Structural) | Linear also carries Reporting, Podcast Episodes, Content Research, and Executive Assistant teams | Additional functions exist beyond the core pipeline |

**The owner-confirmed roster shape (2026-07-18):** ~3 video editors, 1
graphic designer, ~6 social media managers — all employees (not contractors),
working as a distributed remote team across nearby time zones (locations:
owner holds the specifics). No other named individuals appear in this public
doc by design.

**The owner-confirmed division of the company (2026-07-18):** Kasper does
**all client acquisition** — calls, networking, big-picture strategy — and
**reviews and approves all content**. The owner does **all software, solo**:
both repos, every site and tool integration, the entire automation/AI layer —
plus directly managing two clients and holding the AI-clone capability
itself.

**Structural concentration risks — sharpened by the owner's answers:** every
alert path terminates in one person's Slack DMs (Sidney); every calendar and
client call runs through one person (Kasper); the iClosed dashboard's
configuration (e.g. which calendar the floating widget books) is visible only
to whoever holds that login. And the deepest one: **the entire software layer
is one person.** Kasper holds GitHub/Supabase/n8n access but rarely uses it —
so on the systems side, access exists but operational capability does not.
The company is a two-pillar structure (Kasper: clients; owner: systems) where
each pillar is a bus factor of one.

- **OQ-6 — resolved (owner, 2026-07-18):** folded into "The owner-confirmed
  roster shape" above.
- **OQ-7 — resolved (owner, 2026-07-18):** folded into "The owner-confirmed
  division of the company" above.
- **OQ-8 — resolved (owner, 2026-07-18):** the owner has access to
  everything; Kasper has GitHub, Supabase, and n8n but rarely uses them.
  Folded into the concentration-risks paragraph above.

---

## Floor 6 — Rhythms

The company as recurring loops. Three kinds — automated, manual-but-evidenced,
and the human rhythms that are invisible in repo artifacts (researched
read-only in session 2, below).

**Automated loops** (detail: lifecycle map §10; CI schedule detail:
`client-analytics` `REPO_MAP.md` §Test & automation):

| Cadence | Loop |
|---|---|
| Every 10 min | Workload rebuild from Linear · calendar↔Linear reconcile · thumbnail-revision scan |
| Every 6 h | Track-B private database snapshots |
| Daily | Client metrics collection (IG/TikTok/YouTube) · SMM roster sync (06:00) · n8n execution-quota watchdog · scheduled research briefs |
| Nightly | E2E test suites (calendar; samples) |
| Weekly | Top-reel post to each client channel (Mon) · SMM report reminder to Kasper (Mon 09:00) · full backup to Drive (Sun 02:00) |
| Monthly | Check-in email to opted-in clients (1st, 08:00) |
| Event-driven | Booking/cancel webhooks → sales automation · error alerts → Sidney DM |

**Manual recurring work evidenced in artifacts:** Kasper writes one
filming-plan tab per client per month (Google Doc; the Filming Plans tab
tracks 🟢/🟡/🔴 content runway against it); SMMs file weekly reports (hidden
SyncView form, Kasper viewer); sales/kickoff/check-in calls as booked; the
new-client manual provisioning runbook (`docs/ops/NEW_CLIENT_ONBOARDING.md`
in `client-analytics` — ~10 of 17 per-client setup steps are still manual).

**The human rhythms** (researched read-only via Slack + Linear on 2026-07-18,
owner-invited after OQ-9's honest "I'm not sure"; sanitized to roles):

*Live today (subject to the coverage caveat below):*

- A **weekly all-hands team meeting** (Zoom) — anchored Tuesday mornings,
  often rescheduled within the week; 14+ dated occurrences Feb–Jun 2026 and
  the team visibly rallies around it.
- **Kasper's daily 15-minute 1:1 standups** with the owner and one other
  teammate (stated by Kasper in writing, Jun 2026; repetition not directly
  observed).
- The **new-client kickoff ritual** — a templated "new client" intro post in
  a fresh per-client channel plus an SMM-led kickoff meeting that gates
  sample production (event-driven; consistent across 2025–26).
- A **content-runway audit** — Kasper asks every SMM "when do you run out of
  content?" roughly every 4–6 weeks (now partly tooled by the Filming Plans
  runway view).
- **Roughly-weekly batch-planning bursts in Linear** — SMMs create
  per-client deliverable batches in large single-day bursts, but the day
  floats across the week: a production rhythm, not a planning ceremony.

*The striking arc:* **the strongest human ceremonies were deliberately
replaced by tooling in May–Jun 2026.** A daily live content-review session
(~4 months of near-daily occurrences) was retired for async review in the
SyncView calendar; the weekly Wednesday "next week request thread" for
editors (~5 months of consecutive weekly threads) was replaced by the
SyncView workload system; a daily written stand-up lapsed in early 2026 and
was never revived. Linear's
auto-generated weekly cycles are conveyor belts, not sprints — nobody plans
into them and no ceremony marks their boundaries. There is **no standing
team-wide daily standup, no "weekly sync," and no fixed planning or review
day.**

*Coverage caveat (major):* the sweep also discovered that internal team
communication **migrated off Slack to Roam** (a virtual-office app), last
Slack day set as **2026-07-07** — Slack has been near-silent (mostly bots)
since. Recent Slack silence is therefore *not* evidence a ritual stopped;
the live rituals above presumably continue on Roam, which sessions cannot
currently read. DMs and most per-client channels were only sampled, and call
platforms were not probed.

- **OQ-9 — resolved by research (2026-07-18):** the owner wasn't sure and
  explicitly invited a read-only sweep; findings above. Net: two live team
  rituals (the weekly all-hands, Kasper's daily 1:1s), one event-driven one
  (client kickoff), and a recent deliberate shift from human ceremonies to
  tooling.
- **OQ-10 — resolved (owner, 2026-07-18):** the collected metrics currently
  serve **client reporting more than internal steering** — no internal
  reading rhythm exists, so no regular decision loop flows from them into
  content strategy. Recorded as a gap that feeds the P4 improvement pass.

---

## Floor 7 — Dependencies

Every external service the company stands on, and what breaks the day it
vanishes, breaks, or reprices. (The independence program —
`docs/independence/INDEPENDENCE_PLAN.md` in `client-analytics` — exists
precisely to shrink the two biggest of these.)

| Dependency | If it vanished tomorrow | Blast radius |
|---|---|---|
| **n8n cloud** | Sales stops being captured (booking webhooks die), all client email stops, provisioning/reports/reconcilers stop | The single integration hub — 92 workflows. Track A is moving interactive writes off it; a daily quota watchdog guards its execution ceiling |
| **Gmail ("Hello email" credential)** | Every client-facing email silently stops | Proven: a password change took sales emails down ~2 days in July 2026 (lifecycle map §15.16). Now alarmed via error-workflow → Sidney DM, but still one credential |
| **iClosed** | No bookings, no booking webhooks → no new deals | All 9 calendars; webhook is the sales-funnel ignition |
| **Supabase** | SyncView's operational core goes dark (calendar, samples, onboarding, credentials vault, PTO) | Sheets remain as read fallback for some surfaces; Track-B 6-hour snapshots + restore rehearsal exist |
| **Google Sheets** | The client roster allowlist (`Clients Info`) and all analytics views break; robots that read rosters stop | Still the live source for roster + analytics — migration pending |
| **Linear** | Production task tracking + editor auto-assignment + workload view stop | Track B (in-app replacement) is built but authority still deliberately sits with Linear |
| **GitHub (Pages + Actions)** | Both websites unhostable; CI reconcilers/watchdogs/backups stop | Also holds both repos = the vault itself |
| **Slack** | Every operational alert (all bot/alert rails post here) and the per-client channel layer | Internal *human* comms already moved to Roam (2026-07-07, session-2 sweep) — but the automations still speak Slack |
| **Roam** | Internal team communication (meetings, standups, day-to-day) goes dark | Adopted as the virtual office ~Jul 2026; invisible to the repos and unreadable by sessions — a new dependency the artifacts don't govern |
| **HubSpot (free tier)** | Sales-funnel state machine lost (contact/deal gates for contract→invoice→onboarding) | Nothing else reads HubSpot, but the gates drive onboarding email |
| **Stripe / eSignatures.com** | Can't collect payment / can't sign agreements — the two close gates | Combined email + webhook gates in lifecycle §4 |
| **Meta (pixel/dataset)** | Paid acquisition tracking resets | One dataset ID in code; ads memory in `docs/meta-ads/README.md` |
| **Wistia / Drive / Docs** | Onboarding videos dark / client files + filming plans + backups unreachable | Drive is also the backup destination — a Drive loss couples primary and backup **for raw footage** (see Floor 8) |
| **Frame.io** | The edited-clip library and its review/delivery flow stall | Owner-confirmed 2026-07-18; invisible to the repos, so no automation depends on it — the exposure is the asset library itself |
| **AI vendors (Anthropic, Gemini, Replicate, Whisper, Apify)** | AI thumbnail pipeline, captions, transcription, metrics scraping degrade | Per-pipeline; production continues manually |
| **Post For Me / TikTok API** | TikTok auto-posting stops | Manual posting fallback |
| **Namecheap (DNS)** | Both domains unresolvable | Rarely touched; documented in site README |

- **OQ-11 — resolved (owner, 2026-07-18):** tool billing concentrates almost
  entirely with **one principal** (owner holds the specifics) — a continuity
  detail worth knowing, not a risk flag. An incomplete expense sheet exists —
  the owner's expense sheet (private; never linked from this public doc).
  Completing the expense picture is **KQ-4**.

---

## Floor 8 — Data

What the company owns, where it lives, and what would hurt to lose.
(Authoritative store-by-store detail: lifecycle map §11; SyncView table detail:
`docs/truth/SUPABASE.md` in `client-analytics`.)

| Data | Lives in | Sensitivity / notes |
|---|---|---|
| Sales-funnel state (contacts, deals, gates) | HubSpot | The only record of who is mid-funnel |
| Client onboarding answers | Supabase (3 funnel tables) | Includes brand strategy + goals; RLS-locked |
| **Client account credentials** | Supabase vault (`client_credentials`, EF-only, audited incl. reveals) | **Most sensitive store in the company.** Known credential-handling findings are tracked by number in the truth layer's F-register (`client-analytics` repo) — details deliberately not repeated here. Note: that repo is public too (vault audit VA-1) — hazard-detail placement is an open owner decision |
| Content pipeline state (calendar, samples, reviews, events) | Supabase | The operational memory of every post and approval |
| Client roster + team rosters | Google Sheets (`Clients Info` etc.) | ⚠ doubles as the live allowlist; subject to known findings tracked in the truth layer (BRIEFING, `client-analytics` repo) |
| Production tasks + history | Linear (mirrored into Track-B tables) | One project per client is the universal join key |
| Raw footage, brand assets, filming plans | Google Drive/Docs (client folders) | The creative raw material |
| Edited clips (the deliverables) | Frame.io | The finished-content library (owner-confirmed 2026-07-18) — outside the Google basket, but with no known second copy either |
| Metrics & research history | Sheets (Metrics, TopVideos, briefs) | Years of per-client performance data |
| Team HR data (PTO balances/requests) | Supabase locked tables (EF-only) | Tier-1 correctness per quality contract |
| Comms history | Slack, Gmail | Client agreements-in-conversation, alert history |
| The vault itself | Both GitHub repos | The company's institutional memory (this doc included) |

**Backups that exist:** weekly full backup to Drive (Sheet copy, repo zip,
n8n workflow export, Supabase dumps — with a known caveat that a green run is
not yet a *proven complete* restore set, finding F13); 6-hourly Track-B
Postgres snapshots to private Drive with a rehearsed scratch restore;
`n8n-backups/` point-in-time workflow snapshots in-repo; git history for both
repos.

**Would hurt most to lose (evidence-ranked):** the credentials vault; HubSpot
mid-funnel state (no other record); Supabase pipeline history; client raw
footage in Drive (primary *and* backup both live in Google's basket — the
edited clips at least sit in a different basket, Frame.io).

- **OQ-12 — resolved with a correction (owner, 2026-07-18):** raw footage
  lives **only in Drive**; edited clips live in **Frame.io** (a tool absent
  from all repo artifacts until this answer — now added to the Floor 1
  inventory and Floor 7 dependencies). The Drive
  primary-and-backup-in-one-basket risk **stands for raws**.
- **OQ-13 — resolved as unverified (owner, 2026-07-18):** **no known**
  contractual retention/deletion obligations — but this is memory, not a
  contract read. Marked: *unverified — check the actual agreements someday.*
  Nothing in the artifacts evidences a deletion pass for departed clients
  either.

---

## Floor 9 — History & the decision registers

**The founding (owner, 2026-07-18):** Kasper founded the company roughly
**6–7 years ago** (≈2019–2020). The first client is known to the owner — name
withheld from this public doc (owner holds the specifics). Everything deeper
(how the first clients arrived, early pivots) concentrates with Kasper →
**KQ-3**.

**The migration story (how we got here), reconstructed from artifacts:** the
site moved Framer → Astro/GitHub Pages (cutover to `synchrosocial.com`);
booking moved Calendly → iClosed; onboarding forms moved Notion → SyncView;
the ops layer moved Google Sheets → Supabase (calendar + samples, June 2026,
dual-write → flag → default); interactive writes are moving n8n → Supabase
Edge Functions (Track A, full roster); Linear is being replaced by in-app
tables (Track B — built, mirror populated, authority deliberately still
Linear); and internal team communication moved Slack → **Roam** with the last
Slack day set as 2026-07-07 (session-2 sweep; the lifecycle map's "Slack now,
ro.am later" note predates this — Slack remains the automation/alert rail).
The pattern is consistent: **rented tools become owned systems, with
dual-writes, flags, reconcilers, and rollback anchors at every step** — and,
in 2026, human ceremonies becoming tooling too (Floor 6).

**Where institutional memory is registered** (the atlas does not duplicate
these):

| Register | Lives in | What it records |
|---|---|---|
| `EXECUTION_LOG.md` | `client-analytics` root | Every deploy, flag flip, migration, backup, incident — dated |
| The F-register (findings) | `docs/independence/CUTOVER_AUDIT_2026-07-13.md` + `docs/truth/BRIEFING.md` boundary (through F145 at this writing) | Every verified defect/risk finding, numbered, with fix state |
| Owner decisions (D-numbers) | `ROLLBACK.md` live-state table + `EXECUTION_LOG.md` (e.g. D-36, the PTO launch acceptance) | Explicit owner risk acceptances and ratifications |
| Meta-ads decisions log | this repo, `docs/meta-ads/README.md` §6 | Every ads/tracking decision with its why |
| Dated audit evidence | `client-analytics` `docs/audits/` | Immutable proof behind truth-doc claims |
| Superseded plans | `client-analytics` `docs/archive/` | Finished migrations, spent prompts, old QA |
| Owner vision | `client-analytics` `docs/vision/` | Recorded owner intent (the step-back mandate lives here) |

**Lessons already institutionalized:** the Gmail credential outage became
error-workflow alerting on every email sender; "a green run is not complete
truth" became a whole family of findings and monitoring rules; stale docs
became the CI-enforced truth layer; unattended-work loss became the
night-shift protocol.

- **OQ-14 — partially resolved (owner, 2026-07-18):** founding facts folded
  into "The founding" above; the detailed story is Kasper's → **KQ-3**.
- **OQ-15 — resolved (owner, 2026-07-18):** **no business-decision register
  exists** — nothing records pricing/offer/hiring decisions the way
  D-numbers record system decisions. Kasper may hold some records privately
  (**KQ-2**). Recorded as a structural gap: system history is registered;
  business history is oral.

---

## Floor 10 — Economics

**Public-repo rule: no financial facts here.** This floor is deliberately
placeholders + owner questions only. What the artifacts *do* establish without
numbers: pricing is rule-enforced in the sales intake flow (monthly /
quarterly / custom billing types with fixed links — lifecycle map §3);
acquisition economics are planned around **CAC, not CPL** with a
lock-the-numbers step pending (meta-ads README §1 step 3); the n8n plan has a
watched execution quota; a dozen-plus paid tools appear on Floor 7.

- **OQ-16 — resolved at placeholder precision (owner, 2026-07-18):** packages
  run roughly **low-to-mid four figures monthly** with a minimum commitment of
  about **three months**; exact figures are rule-enforced in the sales intake
  flow (lifecycle map §3; `SALES_INTAKE_DESIGN.md` in the `client-analytics`
  repo) and stay out of this public doc — owner holds the specifics.
  Cost-to-serve and most-profitable-offer weren't covered by the answer and
  are unquantified in any artifact.
- **OQ-17 — resolved (owner, 2026-07-18):** **no ads cost target yet** —
  deliberately so; "lock the numbers" waits until real meta-ads volume exists
  to price against.
- **OQ-18 — resolved at placeholder precision (owner, 2026-07-18):** known
  tool spend is roughly **mid three figures monthly**, tracked incompletely in
  the owner's private expense sheet (see Floor 7 / OQ-11); the rest of the
  picture is unmapped → **KQ-4**.
- **OQ-19 — resolved (owner, 2026-07-18):** the owner's week goes
  **overwhelmingly to building with AI** — the commit history across both
  repos is the honest diary of where the time went — plus directly managing
  two clients.

---

## Floor 11 — The human+AI operating system

How this company runs itself — the meta layer the owner named "is the way we
work the best it can be?" (documented here; judged in the P4 improvement
pass).

**The architecture:** the owner + a fleet of AI sessions + a documented vault.
Sessions are workers; **the vault is the memory** (`docs/vision/STEP_BACK_2026-07-18.md`
doctrine). Two repos carry the vault: this one (the public face + funnels +
this atlas) and `client-analytics` (the ops app + the truth layer). The
account holds a few other, non-vault repos (Floor 2).

| Piece | What it is |
|---|---|
| Session contexts | `CLAUDE.md` in this repo and `AGENTS.md` in `client-analytics` brief every session before work |
| The truth layer | Living, freshness-stamped docs with the **don't-re-audit rule** — trust a fresh stamp, verify one claim if stale, never ritually re-audit |
| Retrieval router | `docs/FIND_ANYTHING.md` (in `client-analytics`) — a one-hop, question-indexed router to any documented fact across both repos, incl. the numbered registers (F-/D-/OQ-/KQ-/VA-numbers). Draft pending owner ratification (vault audit P4) |
| CI-enforced docs | `test/repo-map-sync.js` and `test/truth-sync.js` fail builds when the map or truth docs drift from reality — docs that cannot silently rot |
| The quality contract | `docs/QUALITY_TIERS.md` — owner-ratified promises per zone (Tier 0 client links → Tier 3 internal), used by every QA skill for prioritization |
| House skills (`client-analytics/.claude/skills/`) | `master-test`, `overnight-test`, `human-audit`, `feedback-expansion`, `bug-archaeology`, `site-assurance` (the QA fleet) + `skill-forge` (how skills get made: examples-are-pointers intake + house invariants) + `night-shift` (unattended work: checkpoint every unit, a usage cap is a pause not a failure) |
| Production skills | A second set of personal/production skills (caption writers, thumbnail prompting, Linear issue creation, content pipelines) — AI is embedded in *service delivery* itself, not only in engineering |
| AI inside the product | The AI thumbnail pipeline (Claude → Replicate → Gemini), caption generation, transcription — the offering itself is part-AI-operated |
| Session roles | Worker sessions (sliced projects like this one), a standing **cloud reviewer** session that verifies pushed checkpoints before merge, scheduled/triggered sessions for recurring jobs |
| Doctrine | Sessions feed the vault (durable learnings ship before a session ends) · atlas-first (link, don't duplicate) · examples are pointers, not lists · checkpoint discipline (nothing exists only in a context window) |
| Live-tool access | Sessions reach HubSpot, n8n, Slack, Gmail, Drive, Linear via MCP connectors — read/write on production tools, governed by explicit go-ahead rules in `CLAUDE.md` |

**Owner pins already recorded for this floor's future** (vision doc): P1 an
intent-to-prompt skill, P2 audit the map itself, P3 better retrieval around
the vault, P4 the improvement pass.

- **OQ-20 — resolved (owner, 2026-07-18):** retrieval today = *"ask the
  reviewer session, it greps the repo."* It works but it's slow. Recorded
  verbatim as the input to pin **P3** (better retrieval architecture around
  the vault). **Update (session 4):** P3 is now *partially discharged* — the
  vault audit (session 3) shipped `docs/FIND_ANYTHING.md` in `client-analytics`,
  a one-hop router built to reach any documented fact in ≤2 opens. It is a
  draft pending owner ratification; the remaining P3 work (entry-point pointers
  in every doc, a cross-repo freshness guard) is tracked in the vault audit's
  proposal list.

---

## Maintenance covenant

This atlas is a living root. It stays true only if every session honors this:

1. **When it updates:** any session that learns something *durable* about what
   the company is — a new tool, a landed migration, a new person/role, a
   resolved owner question, a new property or offering — updates the affected
   floor **in the same session/PR** as the work that learned it. A floor whose
   linked master doc changed materially gets its link-line and summary
   re-checked.
2. **Who updates it:** the session that learned the fact (not a future
   "documentation pass"). The standing reviewer verifies atlas edits like any
   other checkpoint. The owner ratifies floor-level changes to meaning
   (especially Floors 1, 10, and tier/decision references) — mechanical link
   and inventory updates need no ratification.
3. **How results feed back:** answered owner questions are resolved **in
   place** — replace the OQ with the answer, dated, and renumber nothing
   (retired numbers stay retired so references never dangle). New unknowns
   join the list with fresh numbers. The same contract governs the
   Kasper-questions appendix (KQ-n). Sessions never fork this document;
   improvements to *how things are* belong in the linked master docs, with
   this atlas only re-pointed.
4. **Freshness:** bump the "Last verified" line whenever a floor is verified
   or changed. If a floor is known-stale (a migration landed, a tool changed),
   mark that floor inline rather than letting the whole document quietly age.
5. **Hygiene, always:** no client names, no revenue or cost figures, no
   credentials or tokens, no strategy secrets — placeholders + owner questions
   instead. Both vault repos are public today. **Open owner decision
   (2026-07-19):** whether `client-analytics` should stay public with hazard
   detail relocated to private storage, or be flipped private, is unresolved
   (vault audit VA-1 / P2) — until it lands, keep operational-hazard specifics
   out of both repos.
6. **The lifecycle map is no longer mirrored (owner decision 2026-07-19).**
   Its canonical copy lives in `client-analytics`; this repo's copy becomes a
   pointer stub (the mechanical swap is the one pending follow-through — until
   it lands, the `client-analytics` copy is authoritative). Do **not** re-sync,
   re-mirror, or copy the full map back here — the byte-mirror contract is
   retired precisely because it drifted silently (Floor 2; vault audit VA-2).
   Edit the canonical copy only.

---

## Owner-question index

**All 20 session-1 questions were addressed on 2026-07-18** — most answered
directly by the owner, one resolved by owner-invited research (OQ-9), and
several redirected to Kasper as honest "I don't know"s — and resolved in
place on their floors (numbers retired, never reused; full answers live at
the OQ-n markers in each floor). This ledger records the outcome of each;
open questions now live in the [Kasper questions](#kasper-questions)
appendix.

| # | Floor | Question (short form) | Outcome |
|---|---|---|---|
| OQ-1 | Company | Who is the *ideal* client? | Resolved |
| OQ-2 | Company | AI-clone: bet, side offer, or sunsetting? | Resolved — side offer now, bet later |
| OQ-3 | Client's chair | What do clients complain about? | Gap — owner doesn't know → **KQ-1** |
| OQ-4 | Client's chair | Typical tenure and leaving reason? | Resolved — owner's read, no measured data |
| OQ-5 | Client's chair | A "first 30 days" script? | Resolved — none; improvised |
| OQ-6 | People | The actual team roster? | Resolved |
| OQ-7 | People | What can only Kasper / only you do? | Resolved |
| OQ-8 | People | Who else can access the systems? | Resolved |
| OQ-9 | Rhythms | What standing human rhythms exist? | Owner unsure → researched read-only this session (see Floor 6) |
| OQ-10 | Rhythms | Who reads the metrics? | Resolved — reporting more than steering; no internal reading rhythm |
| OQ-11 | Dependencies | Which tools on whose card? | Resolved — billing concentrates with one principal; sheet incomplete → **KQ-4** |
| OQ-12 | Data | Footage outside Google Drive? | Resolved with correction — edited clips are in Frame.io |
| OQ-13 | Data | Contractual retention obligations? | Resolved as *unverified* — check contracts someday |
| OQ-14 | History | The pre-2026 story? | Partially resolved — detail → **KQ-3** |
| OQ-15 | History | A business-decision register? | Resolved — none exists; maybe private → **KQ-2** |
| OQ-16 | Economics | Unit economics? | Resolved at placeholder precision |
| OQ-17 | Economics | Target CAC? | Resolved — none yet, deliberately |
| OQ-18 | Economics | Monthly tool spend? | Resolved at placeholder precision |
| OQ-19 | Economics | Where does your week go? | Resolved — building with AI; 2 managed clients |
| OQ-20 | Meta layer | How do you retrieve from the vault? | Resolved — feeds pin P3 |

---

## Kasper questions

Several owner answers bottomed out at Kasper — either an honest *I don't
know, Kasper would* (KQ-1 through KQ-3) or a picture only he can complete
(KQ-4). These are the owner-shaped targets for the next information pass (an
interview with Kasper, or answers he records directly). Same contract as
owner questions: each is answerable in one voice message; a session folds
the answer into its floor and retires the number.

| # | Floor | Question |
|---|---|---|
| KQ-1 | Client's chair | What do clients actually complain about and ask for most — where does the journey feel bumpy from their side? (← OQ-3) |
| KQ-2 | History | What were the big business decisions that shaped the company (pricing, offers, hiring, positioning) — and does any private record of them exist? (← OQ-15) |
| KQ-3 | History | The founding story in detail: how it started ~6–7 years ago, who the first client was and how they arrived, and the early pivots. (← OQ-14) |
| KQ-4 | Dependencies / Economics | Which tools or subscriptions does Kasper use that the repos can't see — completing the expense picture the private sheet started? (← OQ-11, OQ-18) |
