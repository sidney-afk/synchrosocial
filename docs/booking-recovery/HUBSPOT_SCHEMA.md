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

> ⚠️ **Documentation drift found.** `CLIENT_LIFECYCLE_MAP.md` §15.2 warns that
> `closedlost` is repurposed as "onboarding sent" and that HubSpot reporting
> will misread it. That has since been partly fixed in the live account: the
> stage is now *labelled* "Onboard Email", and two genuine terminal stages
> (`3230452433` Closed Won / `3230452434` Closed Lost) were added. The map does
> not know about them. **The underlying trap is still live**, though: the
> internal values `closedwon` and `closedlost` no longer mean what they say, so
> any HubSpot report, integration, or Meta conversion sync that keys on the
> stage *value* rather than the label will still be wrong. Anything built here
> keys on the explicit ids above, never on the words "closedwon"/"closedlost".

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

## 4. Properties to create

15 contact properties, three groups. All single-line text unless noted.

### Group: Ad Attribution

| Name | Type | Notes |
| --- | --- | --- |
| `utm_source` | text | e.g. `facebook` |
| `utm_medium` | text | e.g. `paid_social` |
| `utm_campaign` | text | |
| `utm_content` | text | ad-level; the one that tells you which creative |
| `fbclid` | text | Meta click id — the join key back to the ad |
| `landing_page` | text | first page of the session |
| `attribution_captured_at` | date picker | |

Set these on **first touch and never overwrite** — first-touch attribution is
what tells you which ad bought the lead. Later sessions must not clobber it.

### Group: Booking Recovery

| Name | Type | Notes |
| --- | --- | --- |
| `booking_started_at` | date picker | when they entered contact info |
| `booking_recovery_status` | dropdown | `pending`, `email_sent`, `sms_sent`, `recovered`, `expired`, `suppressed` |
| `booking_recovery_email_sent_at` | date picker | |
| `booking_recovery_sms_sent_at` | date picker | |
| `booking_calendar` | text | which iClosed calendar they abandoned |

`recovered` is the one that pays for the project: it marks a lead who booked
*after* getting E1 or S1. Counting those against the ad spend is the whole ROI
argument.

### Group: SMS Consent

| Name | Type | Notes |
| --- | --- | --- |
| `sms_consent` | single checkbox | true only via explicit opt-in |
| `sms_consent_at` | date picker | |
| `sms_consent_source` | text | e.g. `iclosed_form_v2` — which wording they agreed to |

**These three are the audit trail, and they are not optional.** If a TCPA
complaint ever lands, the question is "prove this person agreed, and to what
words" — `sms_consent_source` is the answer. No SMS goes to a contact whose
`sms_consent` is not true. Details in `TWILIO_RUNBOOK.md`.

STOP handling is deliberately **not** a HubSpot property: Twilio maintains the
authoritative opt-out list and refuses sends to it at the API level. Mirroring
it into HubSpot would create a second source of truth that can drift and let a
message through. Read opt-out state from Twilio.

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
