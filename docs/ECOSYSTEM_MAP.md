# Synchro Social — Ecosystem & Booking Map

> One place to see how every property, funnel, page, and booking calendar connects —
> so we (and anyone we hand this to) don't get lost. Reflects the completed
> Calendly → iClosed migration. All booking runs on iClosed (`app.iclosed.io`).

## The big picture

```mermaid
flowchart TD
  %% ---------- Traffic sources ----------
  ADS["📣 Paid ads — cold traffic"]
  EVENTS["🎤 Live events — QR code"]
  DIRECT["🌐 Direct / organic"]

  %% ---------- Marketing site ----------
  subgraph SITE["synchrosocial.com — marketing site (Astro)"]
    HOME["/ — Homepage"]
    AILAND["/ai — AI Clone landing (VSL, for ads) · coral"]
    EVENTHUB["/event — Events Hub"]
    AIINVITE["/ai-invite/ — AI Clone invite hub"]
    APPLY["/apply — Apply funnel · purple"]
    CALL["/call — AI intro call · coral"]
    SCLIENTS["/ai-invite/schedule-clients"]
    SINVEST["/ai-invite/schedule-investors"]
    OLD["/old — legacy homepage (kept)"]
    THANKYOU["/thank-you — 'You're booked' (purple)"]
  end

  %% ---------- Booking calendars (iClosed) ----------
  subgraph CALS["iClosed calendars — kasper@synchrosocial.com (Zoom)"]
    SMC{{"Social Media Consultation<br/>social-media-consultation · ★ QUALIFY+DISQUALIFY<br/>→ /thank-you"}}
    AICALL{{"AI Intro Call<br/>ai-intro-call · ★ QUALIFY+DISQUALIFY<br/>internal confirm (no redirect)"}}
    DEMO["demo<br/>synchrosocial/demo<br/>internal confirm"]
    ONE["1:1 Call with Kasper<br/>1-1-call-with-kasper<br/>internal confirm"]
    KICK["Synchro Client Kickoff Call<br/>kickoff-call · 60 min<br/>internal confirm"]
    AICC["AI Clone Consultation<br/>ai-clone-consultation<br/>internal confirm"]
  end

  %% ---------- Post-sale onboarding ----------
  subgraph ONB["Post-sale onboarding (link sent after they sign)"]
    MONB["/onboarding 1→2→3→4 (main / purple)"]
    AIONB["/ai_onboarding 1→2→3→4 (AI / coral)"]
  end

  SYNCVIEW["syncview.synchrosocial.com<br/>SyncView — internal content & analytics ops"]

  %% ---------- Flows ----------
  DIRECT --> HOME
  ADS --> HOME
  ADS --> APPLY
  EVENTS --> EVENTHUB

  HOME -->|Apply Now| APPLY
  AILAND -->|Schedule a Call| CALL
  EVENTHUB -->|Learn about company| HOME
  EVENTHUB -->|Learn about AI avatar| AIINVITE
  EVENTHUB -->|Book a call| DEMO
  AIINVITE -->|Clients| SCLIENTS
  AIINVITE -->|Investors| SINVEST
  OLD --> DEMO

  APPLY --> SMC
  CALL --> AICALL
  SCLIENTS --> DEMO
  SINVEST --> ONE

  SMC -->|redirect| THANKYOU

  SMC -.->|qualified → signs| MONB
  AICALL -.->|qualified → signs| AIONB

  MONB --> KICK
  AIONB --> AICC
  KICK -.->|internal confirm → step 4| MONB
  AICC -.->|internal confirm → step 4| AIONB

  MONB -.->|client is live| SYNCVIEW
  AIONB -.->|client is live| SYNCVIEW

  classDef filter fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#000;
  class SMC,AICALL filter;
```

## Properties

| Property | URL | What it is |
| --- | --- | --- |
| Marketing site | `synchrosocial.com` | Astro site — all funnels, landing pages, onboarding |
| SyncView | `syncview.synchrosocial.com` | Internal Instagram analytics + content-ops dashboard (the `client-analytics` repo). Used by the team **after** a client signs; not part of booking. |

## Entry points → booking calendar

Current paid Meta plan (2026-07-08): ads run to the main purple funnel,
`/` or `/apply`, using the Social Media Consultation calendar
(`social-media-consultation`). The older `/ai` -> `/call` cold-ad path below is
kept as a site surface, not the current Meta launch target.

| Entry point | Page | Theme | Calendar | Qualifies? | After booking |
| --- | --- | --- | --- | --- | --- |
| Cold ads | `/ai` → `/call` | coral | **AI Intro Call** (`ai-intro-call`) | **YES — filter** | internal (no redirect) |
| Main site | `/` → `/apply` | purple | **Social Media Consultation** (`social-media-consultation`) | **YES — filter** | → `/thank-you` |
| Events Hub "Book a call" | `/event` | — | **demo** (`synchrosocial/demo`) | No | internal |
| AI invite — Clients | `/ai-invite/schedule-clients` | — | **demo** (`synchrosocial/demo`) | No | internal |
| AI invite — Investors | `/ai-invite/schedule-investors` | — | **1:1 Call** (`1-1-call-with-kasper`) | No | internal |
| Legacy homepage | `/old` | — | **demo** (`synchrosocial/demo`) | No | internal |
| Main onboarding step 3 | `/onboarding_step3` | purple | **Kickoff Call** (`kickoff-call`, 60 min) | No | internal → step 4 |
| AI onboarding step 3 | `/ai_onboarding_step3` | coral | **AI Clone Consultation** (`ai-clone-consultation`) | No | internal → step 4 |

## Why this is coherent

- **Two filter calendars, one per cold door.** `/apply` (main, purple) uses *Social Media Consultation*; `/ai`→`/call` (ads, coral) uses *AI Intro Call*. Both qualify + disqualify. They're separate only so each can have the right post-booking behavior.
- **Only `/apply` redirects to `/thank-you`.** That page is purple, so it matches the purple `/apply` funnel. `/call` is coral, so it uses iClosed's internal confirmation instead of jumping to the purple `/thank-you` — preserving the old (Calendly) behavior and the funnel's look.
- **Warm doors don't filter.** Event leads (`/ai-invite`, `/event`) and investors get friction-free calendars (`demo`, `1:1`), all internal confirmation.
- **Onboarding never dumps clients on the sales thank-you page.** Both onboarding calendars use internal confirmation so the client continues to step 4 ("Final Words").
- **Two AI surfaces, on purpose:** `/ai` = cold ad landing (filtered) vs `/ai-invite/` = warm event invite (unfiltered). Same theme, different traffic temperature.

## Notes

- Confirmation-page + disqualification settings are configured per event in the **iClosed dashboard** (the public API is read-only for event config), not in this repo.
- `/old` is a kept legacy homepage; its booking uses `demo` like the other warm entry points.
