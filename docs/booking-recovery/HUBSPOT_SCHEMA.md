# HubSpot: schema for booking recovery + ad attribution

> What is in the account, what the booking-recovery workflows write to it, and
> the record model for a lead who started a booking but never finished.
>
> Account `245312721`, NA2, **free tier**, one pipeline.
>
> **Status 2026-09-30.** §1 and §2 were read live on 2026-08-14 and have **not**
> been rechecked since. §3 to §5 describe what the live n8n workflows write today
> (read from the workflows on 2026-09-30). n8n is the source of truth for §3 to §5.

---

## 1. What is there today — verified live

### Deal pipeline: "Client Acquisition" (`default`), the only one

| Stage value | Label |
| --- | --- |
| `appointmentscheduled` | Call Scheduled |
| `presentationscheduled` | Next Steps Sent |
| `closedwon` | Contract Signed |
| `3230372548` | Invoice Paid |
| `closedlost` | **Onboard Email** |
| `decisionmakerboughtin` | Form Completed |
| `3230452433` | **Closed Won** |
| `3230452434` | **Closed Lost** |

> 🚨 **A live data-integrity bug, not just documentation drift.**
>
> `CLIENT_LIFECYCLE_MAP.md` §15.2 warns that `closedlost` is repurposed as
> "onboarding sent". Since then someone started fixing it — the stage was
> *relabelled* "Onboard Email" and two correctly-named terminal stages
> (`3230452433` Closed Won / `3230452434` Closed Lost) were created. **Then the
> migration stopped.** The new stages are empty and the old values are still
> the ones in use.
>
> That leaves the account in the worst of both states. HubSpot does not treat
> `closedwon`/`closedlost` as ordinary stages — they are the **won and lost
> stage types**, and HubSpot keys forecasting, close dates, win-rate and
> lifecycle transitions off them regardless of the label a user typed. So today:
>
> - a deal reaching **Contract Signed** is booked as **won revenue** before a
>   single invoice is paid, and
> - a client who reaches **Onboard Email** — i.e. a successful sale entering
>   onboarding — is counted as **Closed Lost**.
>
> Every funnel number out of this portal is wrong in both directions, and any
> future Meta CAC feedback loop keying on won/lost would push that error
> straight into ad optimisation.
>
> **Not fixed here** — it is outside what was asked and moving live deal stages
> deserves its own change with Sidney watching. Carried in `README.md`, Open
> decisions. Everything this project builds keys on explicit stage **ids**, never
> on the words "closedwon"/"closedlost", so it is correct either way.
>
> (Also: the "Contract Signed " label has a trailing space.)

### Custom contact properties that exist

`is_ai_client`, `deal_id`, `contract_signed`, `first_invoice_paid`,
`onboarding_sent` — all confirmed present.

Their existence, plus the three custom deal stages, is direct proof that **this
free-tier account can create custom properties and custom deal stages.** No
guesswork needed on that.

### Relevant standard properties already available

`phone`, `mobilephone`, `lifecyclestage` (subscriber/lead/opportunity/customer),
`hs_lead_status` (NEW, OPEN, IN_PROGRESS, OPEN_DEAL, UNQUALIFIED,
ATTEMPTED_TO_CONTACT, CONNECTED, BAD_TIMING), `hs_marketable_status`.

### What was missing on 2026-08-14 (since built; see §4)

**All ad attribution.** A property search for utm / campaign / source / fbclid
returns exactly one hit — `engagements_last_meeting_booked_campaign` — and that
only populates for HubSpot's own meetings tool, which is not what we use.
iClosed bookings arrive through the n8n API path and carry no campaign data at
all. This is the gap `meta-ads/README.md` §9 item 4 records (open on that date), and it
is why "CAC, not CPL" cannot be measured yet.

**Everything about unfinished bookings** — no property records that someone
started, and no SMS consent field anywhere.

---

## 2. The free-tier constraint that shapes the whole design

**HubSpot free has no workflow automation.** There is no way to make HubSpot
itself send the follow-up email, wait 30 minutes, or branch on a property.

So the CRM is a **record store, not an engine**. Every piece of logic lives in
n8n, which is already the pattern for the entire existing sales stack. Nothing
here proposes changing that, and nothing here needs a paid upgrade.

Other free-tier ceilings worth knowing: one deal pipeline (already used), and
no sequences or marketing email. None of them block this project.

---

## 3. The record model for an unfinished booking

**A contact, and no deal.**

| | |
| --- | --- |
| `lifecyclestage` | not written. HubSpot sets `lead` itself on creation; an existing customer is never downgraded. |
| `hs_lead_status` | not written by any workflow. Sales-owned. |
| deal | **none** |

Why no deal: the pipeline's first stage is *Call Scheduled*, and these people have
explicitly not scheduled a call. Putting them there would be false, and it would
corrupt the one number this funnel is judged on: how many booked calls the ads
produced. The booking routers (`Sales — Call Booked (iClosed)` and `Normal Sales —
Booking Handler`) create the deal at the moment a real booking happens; that stays
the only place a deal is born.

If the lead later books, the router finds the contact by email, skips contact
creation and creates the deal as it does today. The recovery system needs no
handoff: it just stops chasing them.

---

## 4. Custom properties the recovery workflows use

Three contact properties, all text or a text-backed enumeration. Attribution and
recovery state each live in one JSON text property instead of a dozen fields, to
spend as few custom-property slots as possible.

| Name | Written by | Contents |
| --- | --- | --- |
| `ad_attribution` | Capture | JSON: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `fbclid`, `referrer`, `calendar`, `captured_at` |
| `booking_recovery` | Capture, then Dispatch | JSON, see below |
| `iclosed_status` | Capture | `potential`, `qualified`, `disqualified`, `booked`, or `other`. An enumeration, so an unknown value would make HubSpot reject the whole upsert; anything unrecognised is collapsed to `other`. |

`booking_recovery` fields: `state`, `iclosed_status`, `raw_iclosed_status`,
`started_at`, `follow_up_due_at`, `email_sent_at`, `recovery_email_sent`
(`yes`/`no`), `iclosed_contact_id`, `iclosed_url`, and `qualification` (the lead's
form answers, when present). After a send, Dispatch rewrites it with `state:
emailed` or `texted`, `sms_sent_at`, and `recovery_sms_sent` (`yes`, `queued` or
`n/a`).

`state` values in practice: `captured` (armed, waiting), then whatever the row's
`suppressed_reason` or `status` is (`booked`, `disqualified`, `completed`, ...),
and `emailed` / `texted` from Dispatch. There is no `recovered` state; a lead who
books after a follow-up is simply marked `booked`. Attributing a booking to the
recovery system means comparing `email_sent_at` or `sms_sent_at` against the
booking time in the Data Table.

Two rules in Capture worth knowing:

- **Booked is a ratchet.** Once the row says booked, a later "potential" ping from
  iClosed never downgrades the contact back to an unbooked lead. Lifecycle state
  comes from the stored row, not from the latest event.
- **Non-acquisition calendars are never mirrored.** The same iClosed account runs
  post-sale kickoff and investor calendars. Only `social-media-consultation`,
  `ai-intro-call` and `doctor-strategy-call` are mirrored.

### Property budget

The earlier version of this file said HubSpot free caps custom properties
account-wide at 10. That was wrong: the cap is **per object** (verified
2026-08-20; contacts alone already carried 8). JSON blobs are still the better
trade here: the values are not filterable in the HubSpot UI, but the free tier has
no workflows, custom reports or lists to point at them anyway, and the data is
visible to anyone opening the contact. If the account moves to a paid tier, split
the blobs into real fields.

### `sms_consent`: proposed, never built

An earlier plan stored `sms_consent` (granted, timestamp, wording version) on the
contact and required it before any text. **No workflow reads or writes it**, and it
may not exist in the account. See `TWILIO_RUNBOOK.md`, "Open compliance questions".

### Opt-out is not mirrored

STOP is handled by Twilio, and a person sets `do_not_contact` on the Data Table
row. Neither is copied into HubSpot, because a mirrored copy can drift and let a
message through.

### Detail lives in n8n, not here

Timestamps, retry state and raw payloads live in the n8n Data Table
`booking_recovery`, which has no column limit. HubSpot gets only what a human reads.

### Phone format

Phone is stored E.164 (`+15551234567`) in the standard `phone` property. Capture
normalises before writing; a number it cannot normalise is dropped rather than
stored in a shape Twilio would reject.

---

## 5. How these get written

| When | Workflow | Writes |
| --- | --- | --- |
| Any iClosed status event on an acquisition calendar (abandoned, booked, disqualified) | `Sales — Booking Recovery Capture (iClosed)` | contact upsert by email: name, phone, `ad_attribution`, `booking_recovery`, `iclosed_status`. **Skipped when there is no email**, because HubSpot keys contacts on email. Fails soft: a HubSpot outage never costs the Data Table row. |
| Recovery email sent | `Sales — Booking Recovery Dispatch` > `Mirror To HubSpot` | `booking_recovery` (state `emailed`). Runs after the email is gone, fails soft. |
| Recovery text sent | `Sales — Booking Recovery Dispatch` > `Mirror SMS To HubSpot` | `booking_recovery` (state `texted`). Only lands when we hold an email. |
| Lead books | `Sales — Call Booked (iClosed)` and `Normal Sales — Booking Handler` (existing, live) | contact and deal as before. They do not write attribution; Capture does that from the status webhook. |
| Doctors step-1 lead, not submitted | `Sales — Doctors Partial Lead Capture` | **Data Table only** at capture; no HubSpot write. The contact is first created when Dispatch's `Mirror To HubSpot` upserts by email after the recovery email goes out, carrying only `booking_recovery`. |

Dispatch also **reads** HubSpot before every send (`Find HubSpot Contact` and
`Safety Gate`): a contact with a `deal_id`, `iclosed_status = booked`, or a
`customer` or `opportunity` lifecycle is never messaged.

Reads and writes go through one n8n credential (`HubSpot account`, a private app
token). Earlier notes about the HubSpot connector in Claude sessions being
read-only do not affect n8n.

---

*§1 and §2 were verified against the live account 2026-08-14. Re-check them before
relying on them; the pipeline had already drifted from `CLIENT_LIFECYCLE_MAP.md`
once.*
