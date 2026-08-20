# HubSpot — schema for booking recovery + ad attribution

> What is in the account today (read live 2026-08-14), what has to be added,
> and the record model for a lead who started a booking but never finished.
>
> Account `245312721`, NA2, **free tier**, one pipeline.

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
> deserves its own change with Sidney watching. Flagged in `README.md` §10 as a
> decision. Everything this project builds keys on explicit stage **ids**, never
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

### What is missing

**All ad attribution.** A property search for utm / campaign / source / fbclid
returns exactly one hit — `engagements_last_meeting_booked_campaign` — and that
only populates for HubSpot's own meetings tool, which is not what we use.
iClosed bookings arrive through the n8n API path and carry no campaign data at
all. This is the gap `meta-ads/README.md` §9 item 4 records, still open, and it
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
| `lifecyclestage` | `lead` |
| `hs_lead_status` | `NEW` on capture → `ATTEMPTED_TO_CONTACT` once E1/S1 sends |
| deal | **none** |

Why no deal: the pipeline's first stage is *Call Scheduled*, and these people
have explicitly not scheduled a call. Putting them there would be false, and it
would corrupt the one number this funnel is judged on — how many booked calls
the ads produced. The booking router already creates the deal at the moment a
real booking happens; that stays the only place a deal is born.

If the lead later books, the existing router finds the contact by email,
skips contact creation, and creates the deal as it does today. The recovery
system needs no special handoff — it just stops chasing them.

---

## 4. Properties to create — and the budget that shapes them

> 🚨 **The binding constraint: HubSpot free allows 10 custom properties
> ACCOUNT-WIDE**, shared across contacts, companies, deals and everything else
> — not 10 per object. Five are already in use on contacts (`is_ai_client`,
> `deal_id`, `contract_signed`, `first_invoice_paid`, `onboarding_sent`), and
> there may be custom deal properties consuming more.
>
> **Before creating anything, read the real number**: Settings → Properties,
> which shows an `X/10 custom properties used` counter. That number decides
> whether the plan below fits as-is.
>
> An earlier draft of this doc proposed 15 new properties. That was wrong and
> impossible. The plan below is **3**.

### The three

| Name | Type | Contents |
| --- | --- | --- |
| `ad_attribution` | multi-line text | JSON: `{"utm_source","utm_medium","utm_campaign","utm_content","fbclid","referrer","captured_at"}` |
| `booking_recovery` | multi-line text | JSON: `{"state","started_at","email_sent_at","sms_sent_at","calendar","iclosed_contact_id"}` |
| `sms_consent` | multi-line text | JSON: `{"granted":true,"at":"…","source":"iclosed_form_v2"}` |

`booking_recovery.state` is one of `captured`, `email_sent`, `sms_sent`,
`recovered`, `expired`, `suppressed`. **`recovered` is the field that pays for
the project** — it marks a lead who booked *after* a follow-up, which is the
only honest way to attribute revenue to this system.

### Why JSON blobs rather than proper fields

Because 15 fields do not fit in a 10-property account and never will on this
tier. Given that, blobs are the better trade rather than a grudging compromise:

- **What is lost:** the values are not individually filterable or reportable in
  the HubSpot UI. On a free account that costs less than it sounds — there are
  no workflows, no custom reports, and no lists to point at them anyway.
- **What is kept:** the data is *present* on the contact, so anyone opening the
  record can see which ad bought this lead and what we have sent them. n8n
  parses JSON trivially, and n8n is the only automation reading it.
- **What it buys:** 12 property slots stay free for whatever the business needs
  next, and adding a field later costs nothing.

If Sidney later upgrades to Starter (1,000 properties per object), split the
blobs into real fields — the n8n side changes in one node, and the blob can be
backfilled into the new fields.

### Use standard properties wherever one exists

Do not spend a custom slot on anything HubSpot already has:

| Need | Use |
| --- | --- |
| phone (E.164) | `phone` — standard |
| where they are in the funnel | `lifecyclestage` — standard |
| sales-facing follow-up state | `hs_lead_status` — standard (`NEW` → `ATTEMPTED_TO_CONTACT`) |

`hs_lead_status` doing double duty is deliberate: it is the field a human
actually looks at in the CRM, and it costs nothing.

### Consent is the one thing that must be provable

`sms_consent` stores the timestamp **and the wording version**
(`iclosed_form_v2`). If a TCPA complaint lands, the question is not "did they
tick a box" but "prove this person agreed, and to exactly what words". A bare
checkbox cannot answer that; the blob can. No SMS is sent to a contact whose
`sms_consent.granted` is not `true`.

STOP handling is deliberately **not** stored here. Twilio maintains the
authoritative opt-out list and refuses sends to it at the API level; a mirrored
copy in HubSpot could drift and let a message through. Read opt-out from Twilio.

### The detailed state lives in n8n, not here

Timestamps, retry state and raw payloads live in the n8n Data Table
`booking_recovery`, which has no column limit. HubSpot gets only what a human
reads and what feeds reporting. That separation is what makes 3 properties
sufficient rather than cramped.

### Phone format

Store E.164 (`+15551234567`) in the standard `phone` property. The capture
workflow normalises before writing; anything it cannot normalise is dropped
rather than stored in a shape Twilio would reject.

---

## 5. How these get written

n8n, in three places:

| When | Workflow | Writes |
| --- | --- | --- |
| Lead enters contact info, no booking | `Sales — Booking Recovery Capture` (new) | contact + attribution + `booking_started_at`, `booking_recovery_status=pending` |
| E1 / S1 goes out | `Sales — Booking Recovery Dispatch` (new) | `booking_recovery_*_sent_at`, status, `hs_lead_status=ATTEMPTED_TO_CONTACT` |
| Lead books | `Normal Sales — Booking Handler` (**existing, live**) | contact + deal as today, plus attribution passthrough and `booking_recovery_status=recovered` |

Only the third touches live sales automation. Per `CLAUDE.md` that needs
Sidney's explicit go-ahead, and it is additive — new property writes on the
existing contact-update node, no change to routing, email, or nurture.

---

## 6. Blocker: this session cannot write to HubSpot

The HubSpot MCP connection is authenticated as `house@synchrosocial.com` and is
**read-only**. Every write capability reports `REQUIRES_REAUTHORIZATION`:
contacts, deals, companies, tickets, notes, tasks. Reads work fine, which is
how everything above was verified.

So the properties in §4 cannot be created from this session. To unblock, one of:

1. **Reauthorize the HubSpot connector with write scope** — in Claude's
   connector settings, disconnect and reconnect HubSpot, granting CRM write.
   Then a session can create all 15 properties in a couple of minutes.
2. **Create them by hand** — HubSpot → Settings → Properties → Contact
   properties → Create property, 15 times, using the table in §4.
3. **Let n8n create them on first write** — n8n's HubSpot node cannot create
   property *definitions*, only set values on existing ones. So this does not
   work; the properties must exist first.

Option 1 is the fast path and also unblocks reading deal-level data for the
CAC reporting later.

---

*Verified against the live account 2026-08-14. Re-check §1 before relying on
it — the pipeline had already drifted from `CLIENT_LIFECYCLE_MAP.md` once.*
