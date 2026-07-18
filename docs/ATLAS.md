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
> **Last verified:** 2026-07-18 (Enterprise Atlas session 1). Sources: both
> repos (`sidney-afk/synchrosocial`, `sidney-afk/client-analytics`), their docs
> layers, and the public site source. No live systems were touched.
>
> **How to use this doc:** read the floor you need, then follow its links.
> Nothing detailed is duplicated here — if a floor has a master map, this doc
> points at it (atlas-first doctrine: link, never copy). Numbered **OQ-n**
> items are owner questions — facts only the owner knows, each worded so it can
> be answered in one voice message. The full list is compiled at the end.

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
| — | [Maintenance covenant](#maintenance-covenant) · [Owner-question index](#owner-question-index) | — |

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
| Comms | Slack (per-client channels, `#name-creative`, `#video-editing`, alert DMs) | Team + client communication; ro.am migration decided "later" |
| Email | Gmail via n8n (`hello@synchrosocial.com`, single "Hello email" credential) | Every client-facing email |
| Contracts / payment | eSignatures.com · Stripe | Agreement signing · payment links + invoice webhook |
| Ads & tracking | Meta Pixel/CAPI (one dataset), HubSpot feedback loop planned | Paid acquisition; memory: [`docs/meta-ads/README.md`](meta-ads/README.md) |
| Video hosting | Wistia (onboarding videos), YouTube (site videos) | Client-facing video delivery |
| Content research | Sandcastles; Apify (IG/TikTok scraping) | Competitor/market research, metrics collection |
| AI production | Anthropic Claude, Gemini, Replicate, OpenAI Whisper | AI thumbnail pipeline, captions, transcription |
| Auto-posting | Post For Me + first-party TikTok pilot | TikTok publishing |
| Files | Google Drive/Docs | Client folders, filming-plan docs, backups |
| Infra | GitHub (repos, Pages hosting, Actions CI/crons), Namecheap (DNS) | Both sites deploy from `main`; reconcilers and watchdogs run as Actions |
| Legacy | Notion (old onboarding forms, read-only import), Framer/Calendly (fully migrated off) | History only |

- **OQ-1** — The homepage FAQ targets "established coaches and thought
  leaders." In your own words: who is the *ideal* client you want the pipeline
  optimized for today (niche, audience size, budget readiness), and who should
  be filtered out?
- **OQ-2** — Is the AI-clone offering a growth bet, a side offer, or on its way
  out? How do you decide which funnel a prospect belongs in?

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
exists **byte-identical in both repos** (mirror contract: edit both together).
Note its 2026-07-14 cutover-safety banner: its Track A/B sections are
historical; current migration truth lives in the `client-analytics` System Map
and cutover register.

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

- **OQ-3** — What do clients most often *complain about* or ask for that the
  artifacts can't show — where does the lived journey feel bumpy from their
  side?
- **OQ-4** — When a client leaves, what's the usual stated reason, and how
  long does a typical client stay? (Placeholder — no churn data exists in the
  repos.)
- **OQ-5** — Between the kickoff call and the first posted content, what does
  the client experience day-to-day — is there a "first 30 days" script beyond
  the samples stage, or is it per-client improvisation?

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

**Structural concentration risks already visible from the artifacts:** every
alert path terminates in one person's Slack DMs (Sidney); every calendar and
client call runs through one person (Kasper); the iClosed dashboard's
configuration (e.g. which calendar the floating widget books) is visible only
to whoever holds that login.

- **OQ-6** — One voice message: the actual team roster today — how many SMMs,
  editors, designers, assistants; employee vs contractor; time zones.
- **OQ-7** — What can *only Kasper* do today (would stall if he took two weeks
  off), and what can *only you* do?
- **OQ-8** — Who besides you can access n8n, Supabase, the iClosed dashboard,
  and the GitHub org — and is that the intended set?

---

## Floor 6 — Rhythms

The company as recurring loops. Three kinds — automated, manual-but-evidenced,
and habit-only (invisible in artifacts → owner questions).

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
new-client manual provisioning runbook (`NEW_CLIENT_ONBOARDING.md` — ~10 of 17
per-client setup steps are still manual).

**Habit-only (nothing in the artifacts shows these exist or don't):**

- **OQ-9** — What are the standing human rhythms? Team standups or weekly
  syncs, a Kasper↔Sidney cadence, a client-review day, a planning day — what
  actually recurs, and what exists only when someone remembers?
- **OQ-10** — Who looks at the collected metrics/analytics, on what rhythm,
  and does anything decided actually flow back from them into content
  strategy?

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
| **Slack** | All internal + client comms channels and every operational alert | ro.am migration decided "Slack now, ro.am later" |
| **HubSpot (free tier)** | Sales-funnel state machine lost (contact/deal gates for contract→invoice→onboarding) | Nothing else reads HubSpot, but the gates drive onboarding email |
| **Stripe / eSignatures.com** | Can't collect payment / can't sign agreements — the two close gates | Combined email + webhook gates in lifecycle §4 |
| **Meta (pixel/dataset)** | Paid acquisition tracking resets | One dataset ID in code; ads memory in `docs/meta-ads/README.md` |
| **Wistia / Drive / Docs** | Onboarding videos dark / client files + filming plans + backups unreachable | Drive is also the backup destination — a Drive loss couples primary and backup (see Floor 8) |
| **AI vendors (Anthropic, Gemini, Replicate, Whisper, Apify)** | AI thumbnail pipeline, captions, transcription, metrics scraping degrade | Per-pipeline; production continues manually |
| **Post For Me / TikTok API** | TikTok auto-posting stops | Manual posting fallback |
| **Namecheap (DNS)** | Both domains unresolvable | Rarely touched; documented in site README |

- **OQ-11** — Which of these carry a paid plan on *your* card vs someone
  else's, and do any renewals/limits worry you today? (Placeholder — no
  billing info in the repos, by design.)

---

## Floor 8 — Data

What the company owns, where it lives, and what would hurt to lose.
(Authoritative store-by-store detail: lifecycle map §11; SyncView table detail:
`docs/truth/SUPABASE.md` in `client-analytics`.)

| Data | Lives in | Sensitivity / notes |
|---|---|---|
| Sales-funnel state (contacts, deals, gates) | HubSpot | The only record of who is mid-funnel |
| Client onboarding answers | Supabase (3 funnel tables) | Includes brand strategy + goals; RLS-locked |
| **Client account credentials** | Supabase vault (`client_credentials`, EF-only, audited incl. reveals) | **Most sensitive store in the company.** A known finding (F129) shows raw access answers can also transit Slack briefs — flagged for structural exclusion |
| Content pipeline state (calendar, samples, reviews, events) | Supabase | The operational memory of every post and approval |
| Client roster + team rosters | Google Sheets (`Clients Info` etc.) | ⚠ doubles as the live allowlist; per-SMM Linear API keys sit in a readable tab (rotation owed — BRIEFING hazard) |
| Production tasks + history | Linear (mirrored into Track-B tables) | One project per client is the universal join key |
| Raw footage, brand assets, filming plans | Google Drive/Docs (client folders) | The creative raw material |
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
footage in Drive (primary *and* backup both live in Google's basket).

- **OQ-12** — Client raw footage and filming docs: does any copy exist outside
  Google Drive? Would losing a client's Drive folder be an apology or a
  catastrophe?
- **OQ-13** — Is there any client-contract obligation about how their data
  (footage, credentials, metrics) is stored or deleted after they leave — and
  do we actually do a deletion pass?

---

## Floor 9 — History & the decision registers

**The migration story (how we got here), reconstructed from artifacts:** the
site moved Framer → Astro/GitHub Pages (cutover to `synchrosocial.com`);
booking moved Calendly → iClosed; onboarding forms moved Notion → SyncView;
the ops layer moved Google Sheets → Supabase (calendar + samples, June 2026,
dual-write → flag → default); interactive writes are moving n8n → Supabase
Edge Functions (Track A, full roster); Linear is being replaced by in-app
tables (Track B — built, mirror populated, authority deliberately still
Linear); Slack → ro.am is decided-but-deferred. The pattern is consistent:
**rented tools become owned systems, with dual-writes, flags, reconcilers,
and rollback anchors at every step.**

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

- **OQ-14** — The pre-artifact history: when did Synchro Social start, how did
  the first clients arrive (referral network? one anchor client?), and what
  pivots happened before 2026 that current docs can't see?
- **OQ-15** — Is there a place where *business* decisions (pricing changes,
  offer changes, hiring) get recorded the way D-numbers record system
  decisions — or does that history live only in memory and chat threads?

---

## Floor 10 — Economics

**Public-repo rule: no financial facts here.** This floor is deliberately
placeholders + owner questions only. What the artifacts *do* establish without
numbers: pricing is rule-enforced in the sales intake flow (monthly /
quarterly / custom billing types with fixed links — lifecycle map §3);
acquisition economics are planned around **CAC, not CPL** with a
lock-the-numbers step pending (meta-ads README §1 step 3); the n8n plan has a
watched execution quota; a dozen-plus paid tools appear on Floor 7.

- **OQ-16** — The unit economics in one voice message: roughly what does a
  client pay per month, what does serving one cost (people + tools), and which
  offer is actually the most profitable?
- **OQ-17** — Meta launch "lock the numbers" (gameplan step 3): what target
  CAC / max cost-per-booked-call did you settle on, or is that still open?
- **OQ-18** — Monthly tool spend: roughly what does the stack on Floor 7 cost
  in total, and which line items feel disproportionate?
- **OQ-19** — Where does *your* week actually go — rough split between sales,
  client strategy, production oversight, and building the system — and which
  of those do you most want off your plate?

---

## Floor 11 — The human+AI operating system

How this company runs itself — the meta layer the owner named "is the way we
work the best it can be?" (documented here; judged in the P4 improvement
pass).

**The architecture:** the owner + a fleet of AI sessions + a documented vault.
Sessions are workers; **the vault is the memory** (`docs/vision/STEP_BACK_2026-07-18.md`
doctrine). Two repos carry the vault: this one (the public face + funnels +
this atlas) and `client-analytics` (the ops app + the truth layer).

| Piece | What it is |
|---|---|
| Session contexts | `CLAUDE.md` in each repo (+ `AGENTS.md` in `client-analytics`) brief every session before work |
| The truth layer | Living, freshness-stamped docs with the **don't-re-audit rule** — trust a fresh stamp, verify one claim if stale, never ritually re-audit |
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

- **OQ-20** — When you need something from the vault today, how do you
  actually look for it (ask a session? open GitHub? memory?) — and where does
  retrieval fail you most? (Feeds pin P3.)

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
   join the list with fresh numbers. Sessions never fork this document;
   improvements to *how things are* belong in the linked master docs, with
   this atlas only re-pointed.
4. **Freshness:** bump the "Last verified" line whenever a floor is verified
   or changed. If a floor is known-stale (a migration landed, a tool changed),
   mark that floor inline rather than letting the whole document quietly age.
5. **Hygiene, always:** no client names, no revenue or cost figures, no
   credentials or tokens, no strategy secrets — placeholders + owner questions
   instead. This repo is public.

---

## Owner-question index

Answer any of these in one voice message; a session will fold the answer into
its floor and retire the number.

| # | Floor | Question (short form) |
|---|---|---|
| OQ-1 | Company | Who is the *ideal* client today, and who should be filtered out? |
| OQ-2 | Company | Status of the AI-clone offer: growth bet, side offer, or sunsetting? |
| OQ-3 | Client's chair | What do clients complain about / ask for most? |
| OQ-4 | Client's chair | Typical client tenure and usual leaving reason? |
| OQ-5 | Client's chair | Is there a "first 30 days" script beyond samples, or per-client improvisation? |
| OQ-6 | People | The actual team roster (counts, contractor/employee, time zones)? |
| OQ-7 | People | What can only Kasper do; what can only you do? |
| OQ-8 | People | Who besides you can access n8n / Supabase / iClosed / GitHub — intended? |
| OQ-9 | Rhythms | What standing human rhythms exist (standups, syncs, planning days)? |
| OQ-10 | Rhythms | Who reads the metrics, on what rhythm, and does it change decisions? |
| OQ-11 | Dependencies | Which tools are on whose card; any renewals/limits that worry you? |
| OQ-12 | Data | Does client footage exist anywhere outside Google Drive? |
| OQ-13 | Data | Any contractual data-retention/deletion obligations — and do we do a deletion pass? |
| OQ-14 | History | The pre-2026 story: founding, first clients, pivots? |
| OQ-15 | History | Do business decisions get recorded anywhere, like D-numbers do for systems? |
| OQ-16 | Economics | Unit economics in one message: price ↔ cost-to-serve ↔ most profitable offer? |
| OQ-17 | Economics | Target CAC / max cost per booked call — settled or open? |
| OQ-18 | Economics | Rough total monthly tool spend; which line items feel heavy? |
| OQ-19 | Economics | Where does your week actually go, and what do you most want off your plate? |
| OQ-20 | Meta layer | How do you retrieve from the vault today, and where does it fail you? (→ P3) |
