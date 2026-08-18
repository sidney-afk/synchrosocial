# Twilio — setup runbook and SMS compliance

> Everything needed to send S1 and S2. The parts only Sidney can do are marked
> **[SIDNEY]** — they need a credit card, an EIN, and a human accepting terms.
>
> **Start the registration early.** Carrier approval is the long pole in this
> whole project and it runs on someone else's clock. Everything else here can
> be done in an afternoon.

---

## 0. The short version

| | |
| --- | --- |
| What to buy | one local 10DLC number |
| What to register | A2P 10DLC: Customer Profile → Brand → Campaign |
| Realistic wait | days, not hours — brand is usually fast, campaign vetting is the wait |
| Blocker before S1 can legally send | **SMS consent language on the iClosed form** (§4) |
| Blocker before S2 can send | none beyond registration |

**Do not skip registration.** Unregistered A2P traffic on US 10DLC numbers is
filtered or blocked outright by the carriers. Messages do not bounce loudly;
they silently fail to arrive, which is the worst possible failure mode for a
sales follow-up.

---

## 0.4 Can the iClosed API just send the SMS? — NO, tested

Probed with a real API key on the Business plan, 2026-08-14. The data endpoints
work; **there is no messaging endpoint of any kind**:

| Endpoint | Result |
| --- | --- |
| `GET /v1/contacts` | ✅ 200 |
| `GET /v1/events` | ✅ 200 |
| `GET /v1/users` | ✅ 200 |
| `/v1/messages`, `/v1/conversations`, `/v1/sms`, `/v1/inbox`, `/v1/messaging`, `/v1/threads`, `/v1/contacts/:id/messages` | ❌ all 404 |
| `/v1/workflows`, `/v1/automations` | ❌ 404 |

The iClosed API reads data. It does not send messages and cannot trigger their
Workflows. So the API key is useful for the reconciliation sweep and nothing
else here — SMS needs a real sending provider either way.

---

## 0.45 DECISION 2026-08-14 — Twilio, not iClosed

Sidney is on the **Business plan**, so iClosed Workflows and all channels are
available in principle. But his Integrations page shows **no Sendblue and no
Linq connected**, and §0.4 proves the API cannot send.

Going with **Twilio + n8n** anyway, and the reason is not registration cost:

**The suppression logic already exists and is proven in n8n.** The HubSpot
re-check that fails closed, phone-digit matching, arm-once dedupe, the
`do_not_contact` flag, the send cap, the stale-row guard — all built, all tested
against the live system. Routing SMS through iClosed Workflows would mean
rebuilding every one of those guards a second time, in a tool that cannot be
version-controlled, cannot be unit-tested, and cannot be reviewed in a diff. Two
copies of "never text someone who booked" is how one of them silently rots.

The trade accepted: A2P registration is a 1–3 week wait, and inbound replies need
building (§5) rather than arriving free in the Unified Inbox.

Revisit if registration is rejected twice, or if Sendblue/Linq later appears as a
connected integration AND the reply-handling gap proves painful.

---

## 0.5 Why iClosed looked attractive — kept for the record

**iClosed sends SMS natively, and can automate it.** Confirmed in their docs
(*Unified Inbox Overview*, `docs.iclosed.io/en/articles/14483009`):

- SMS is a first-class channel in the Unified Inbox, alongside WhatsApp, Gmail
  and social DMs, **threaded per lead**.
- It is delivered **via Sendblue or Linq** — an account-level integration an
  admin connects once. iClosed does not own the pipe, but it owns the plumbing.
- **Workflows can send it automatically**: *"you can choose exactly which channel
  the automated message should use"*, triggered by contact creation, status
  changes, or booking events — the exact events this project already runs on.
- **Requires the Growth or Business plan.** Startup is Gmail/Outlook email only.

If Sidney is on Growth or Business, that path beats Twilio on nearly every axis:

| | iClosed + Sendblue/Linq | Twilio + n8n |
| --- | --- | --- |
| Carrier registration (A2P 10DLC) | handled by the provider | Sidney's problem, 1–3 weeks |
| Trigger | native, same status events we use | n8n, already built |
| Replies | land in the inbox Kasper already works in | nowhere — needs building |
| New vendor accounts | one (Sendblue/Linq) | one (Twilio) + brand + campaign |
| Time to first send | days | weeks |

The reply-handling row matters more than it looks. S2 explicitly says *"please
text me"*, and with Twilio there is currently nowhere for that reply to land.
iClosed's Unified Inbox solves that for free.

**Three things to check before spending anything** (one minute in iClosed):

1. Settings → Billing — which plan? (Growth/Business = this path is open)
2. Main nav — is there a **Workflows** section?
3. Settings → Integrations — is **Sendblue** or **Linq** listed?

**What does NOT change either way:** the consent problem. TCPA attaches to the
message, not the pipe. S1 still needs express written consent (§3–4), and STOP
handling is enforced mechanically by carriers whichever provider sends it. The
form's consent language is still the gate on S1.

The rest of this runbook is the Twilio path. Keep it — it is the fallback if the
plan tier is Startup, or if Sendblue/Linq turn out not to be workable.

---

## 0.6 AS-BUILT — live account state (2026-08-17)

Kasper chose **Twilio green** over the iMessage providers and the Slack-assist
option, so both S1 and S2 go over this account.

| | |
| --- | --- |
| Account SID | `AC…ada` — in the n8n credential store, deliberately not committed |
| Account type | **Full** — upgraded off trial, card on file |
| Balance | $50.00 as of 2026-08-17 |
| Messaging Service | `MG40c681a61360ab99880b907d617775dc` — "Synchro Social Sales" |

> The remaining rows of this table (number, customer profile, brand, campaign)
> were all "not created" when it was first written. They have since moved —
> **see §PROGRESS below for current state**, which is authoritative.


Auth is via an **API Key** (`SK4fc6640…`), not the account Auth Token — better
practice, since it can be revoked without rotating the whole account.
**Rotate it once setup is done**: it was pasted into a chat transcript.
Console → Account → API keys & tokens → delete and reissue.

### Prices verified live against the Twilio pricing API, 2026-08-17

| | |
| --- | --- |
| US local number | **$1.15/mo** |
| US toll-free number | $2.15/mo |
| Outbound SMS to US, all carriers | **$0.0083 per segment** |

Carrier surcharges (~$0.003/segment) are billed on top and are not in the
pricing API. At S1 ≈ 2 segments and S2 ≈ 3, a recovery text costs ~2.3¢ and a
confirmation ~3.5¢.

### PROGRESS — 2026-08-17, after profile approval

Primary compliance profile came back **`twilio-approved`**, which unblocked
everything the API can drive:

| Step | State | Identifier |
| --- | --- | --- |
| Primary compliance profile | ✅ twilio-approved | `BU824c5b17…` |
| Local number, 786 Miami | ✅ purchased | **+1 (786) 550-2816** — `PN430149bc…` |
| Attached to Messaging Service | ✅ | `MG40c681a6…` |
| A2P Messaging trust product | ⏳ in-review, evaluated **compliant** | `BU34092cf1…` |
| A2P Brand | ⏳ PENDING at TCR (`BV8T4QY`) | `BN50170e79…` |
| A2P Campaign | ⛔ downstream of the brand | — |

> **Corrected 2026-08-18: the brand does NOT require an approved trust
> product.** This file previously asserted the two were serial. They are not —
> the brand was filed and accepted with the A2P trust product still
> `in-review`, 22 hours after submission. The original claim was an assumption
> that was never tested, because the first attempt was blocked locally rather
> than by Twilio. Filing the brand in parallel with trust-product review is the
> correct play and saves days of dead waiting.

Trust product built on policy `RNb0d4771c2c98518d916a3d4cd70a8f8b`
(*A2P Messaging: Local - Business*) with `company_type=private`, the approved
customer profile assigned as its supporting profile. It evaluated compliant on
the first pass, so no field corrections were needed.

**Secondary vetting: skipping it.** A Standard Brand can be registered with
`SkipAutomaticSecVet=true`, avoiding roughly $40. Vetting buys throughput, and
throughput is irrelevant at ~8 confirmations a week — the Low Volume Standard
campaign does not require it. It also would not fit: brand (~$4.44) + campaign
($15) + vetting ($40) exceeds the $50 balance, whereas without vetting the whole
registration lands around $20. Vetting can be added later if a campaign is ever
rejected for wanting it.

---

### ⚠️ ORDER CORRECTION — the Customer Profile comes BEFORE the number

§1 Step 2 said "buy a number" before Step 4 "Customer Profile". **That order is
wrong and was proven wrong by trying it.** Purchasing `+17867448162` returned:

```
20003  Primary compliance profile is not approved.
       Please complete the KYC process in Trust Hub.
```

Twilio now gates number purchase behind an **approved Primary Customer
Profile**. So the real order is:

1. Primary Customer Profile (Trust Hub KYC) → approved
2. Buy the number
3. Attach it to the Messaging Service
4. A2P Brand
5. A2P Campaign

Everything is downstream of the KYC profile. That is the critical path.

### ⚠️ The Primary Customer Profile CANNOT be filed over the API

Attempted, and Twilio refuses by design:

```
400  This operation is restricted via API for Primary Customer Profiles.
     Use Twilio Console instead.
```

It is a legal attestation, so it must be completed by a human in the console at
<https://console.twilio.com/us1/account/trust-hub/customer-profiles>. Everything
*downstream* of it (number purchase, brand, campaign, sender assignment) is
API-drivable — this one step is not. Field values to paste are in §1.4 below.

### Entity facts — confirmed from the Florida SunBiz filing, 2026-08-17

| | |
| --- | --- |
| Legal name | SYNCHRO SOCIAL LLC |
| Document number | L25000345790 |
| Date filed | 2025-07-28 — over a year old, so the TCR EIN-age gate is clear |
| Status | ACTIVE |
| Principal + mailing address | 555 NE 34TH ST, APT 2210, Miami, FL 33137 |
| Registered agent | Northwest Registered Agent LLC, 7901 4th St N Ste 300, St. Petersburg, FL 33702 |
| Authorized person | HYTOENEN, KASPER — title AMBR (authorized member) |

> **Name spelling.** SunBiz records the surname as **HYTOENEN** (the `oe`
> transliteration of Finnish `ö`); Sidney supplies **Hytonen**. Filing as
> Hytonen per Sidney. If the profile is ever rejected on a name mismatch, try
> the SunBiz spelling before changing anything else.

The Twilio `Address` resource for the principal address is already created:
`ADa4a2b1e3…` — reusable, no need to re-enter it later.

### SUBMITTED — primary profile in review, 2026-08-17

| | |
| --- | --- |
| Profile SID | `BU824c5b1719a715b74b3dd32fb50c52fd` |
| Status | **pending-review** since 2026-08-17T15:50Z |
| Business info record | `IT04928898…` — all eight fields as specified, no drift |
| Authorized rep record | `IT3b73a026…` |
| Address record | `RD3cb98996…` |

Three values were entered differently from §1.4, found by reading the submitted
records back rather than trusting the form:

| Field | Specified | Submitted | Resolution |
| --- | --- | --- | --- |
| `last_name` | Hytonen | **Hytoneen** | ⚠️ typo — **shipped uncorrected**, see below |
| `email` | kasper@ | **house@synchrosocial.com** | ✅ kept — Sidney confirms that mailbox is monitored |
| `job_position` | Other | **Director** | ✅ kept — a legitimate option for an LLC authorized member, and not worth churning a profile that is already in review |

`Hytoneen` matches neither the supplied spelling nor the Florida filing, so it is
a straight typo and is the one worth fixing. Owner chose to align it with SunBiz
(`HYTOENEN, KASPER`) on the reasoning that a reviewer checking public records
sees that document.

**The surname typo shipped, deliberately.** The authorized-representative record
cannot be edited with an API key (the same console-only restriction that blocks
creating the profile), and once a profile reaches `pending-review` the console
renders it **read-only with no edit control at all** — verified on the live
Details page. The only route to a correction is withdrawing and resubmitting.

Judged not worth it: review verifies **legal name, EIN and address** against
government records, and all three are exact. The authorized representative is
checked for being a reachable real person, which `Kasper Hytoneen` /
`house@synchrosocial.com` / `+17373540698` satisfies. Withdrawing would forfeit
queue position to reduce an already-small risk.

If the profile is rejected on a name mismatch, resubmit with the SunBiz spelling
**Hytoenen** — that is the owner's ratified choice, already decided, so no
further decision is needed at that point.

### Decisions — 2026-08-17

| | |
| --- | --- |
| Area code | **786 (Miami)** — 305, 954 and 407 had no SMS inventory at time of check |
| Authorized representative | **Kasper** |
| Consent checkbox on the iClosed form | **Sidney declined** — see §3.1 |

### §3.1 No consent checkbox — what it changes

Sidney decided against adding an SMS consent checkbox to the iClosed form. The
consequence is not primarily legal, it is mechanical: the A2P campaign
registration has a required "how do subscribers opt in" field that carriers
verify against the live site. With no consent mechanism the campaign can only
be registered as **transactional**, and sending marketing traffic on a
transactional campaign gets the campaign revoked and the number blocked.

Therefore:

- **S2 (booked-call confirmation) — proceeds.** Transactional, no consent
  artefact required, register the campaign as this and nothing else.
- **S1 (unfinished-booking SMS) — cannot be automated on this account.**
  `SMS_ENABLED` stays `false` permanently unless the decision is revisited.
- **E1 (unfinished-booking email) — unaffected**, already live and sending.
- **The phone-only cohort** (number captured, no email) is covered by
  **Slack-assist** instead: n8n posts the lead and the drafted message into
  Slack, Kasper sends it from his own iPhone. A human manually sending a text
  is not automated messaging, so it sits outside the A2P/consent regime
  entirely — and it is a genuine iMessage blue bubble from his real number,
  which is what Kasper wanted. Not yet built; awaiting go-ahead.

### Still blocked on Sidney — the Customer Profile needs facts not in this repo

The state is **Florida**. SunBiz could not be read from this environment —
it sits behind a Cloudflare challenge that does not clear from a datacenter
IP, and the public mirrors (OpenGovUS, Bizapedia) have no filing for this
entity. So the two remaining facts have to come from Sidney:

1. **Registered business address** of Synchro Social LLC — street, city, state,
   ZIP, country, exactly as filed. Read it off the SunBiz detail page
   (`search.sunbiz.org` → Search by Entity Name → "Synchro Social").
   Grab the **Date Filed** on the same page too: TCR requires the EIN to be
   roughly 15+ days old, and a recently formed entity simply waits.
2. **Kasper's details** — full legal first and last name, email, phone,
   job position and business title.

Everything else is already known and needs no input:

| Field | Value |
| --- | --- |
| `business_name` | Synchro Social LLC |
| `business_type` | Limited Liability Corporation |
| `business_registration_identifier` | EIN |
| `business_registration_number` | 39-3608143 |
| `business_identity` | direct_customer |
| `business_industry` | Professional services / marketing |
| `website_url` | https://synchrosocial.com |
| `business_regions_of_operation` | USA and Canada |

Field names above are the literal Trust Hub policy fields, read from
`GET /v1/Policies/RN6433641899984f951173ef1738c3bdd0` (Primary Customer
Profile of type Business) — not guessed.

---

## 1.4 Primary Customer Profile — exact values to paste into the console

Console → **Trust Hub → Customer Profiles → Business Profile**
(<https://console.twilio.com/us1/account/trust-hub/customer-profiles>).

**Business information**

| Field | Value |
| --- | --- |
| Legal business name | `Synchro Social LLC` |
| Business type | Limited Liability Corporation |
| Business registration ID type | EIN |
| Business registration number | `39-3608143` |
| Business identity | Direct customer |
| Business industry | Professional Services |
| Website URL | `https://synchrosocial.com` |
| Regions of operation | USA and Canada |

**Business address** — must match the SunBiz principal address exactly

```
555 NE 34TH ST
APT 2210
Miami, FL 33137
United States
```

**Authorized representative**

| Field | Value |
| --- | --- |
| First name | `Kasper` |
| Last name | `Hytonen` |
| Email | `kasper@synchrosocial.com` |
| Phone | `+1 737 354 0698` |
| Business title | `Owner` |
| Job position | Other |

`Job position` is a fixed dropdown (Director / GM / VP / CEO / CFO / General
Counsel / Other). **Other** is the honest mapping for an LLC authorized member —
do not inflate it to CEO to look more official; a mismatch against the filing is
what gets profiles rejected.

Twilio emails the authorized representative to confirm, so Kasper needs to watch
`kasper@synchrosocial.com` and click through. **The profile does not enter review
until he does.**

---

## 1. THE ACTUAL CHECKLIST — do these in order

Verified against current Twilio/TCR pricing 2026-08-14. Confirm figures in the
console as you go; TCR reprices periodically.

### The entity — confirmed 2026-08-14

| | |
| --- | --- |
| Legal business name | **Synchro Social LLC** — type it exactly, including "LLC" |
| EIN | on file with Sidney (deliberately not committed to this repo) |
| Entity type | **LLC / Private Company** — NOT sole proprietor |
| Brand type | **Standard Brand** |
| Website | `synchrosocial.com`, already Meta-domain-verified |

An LLC holding its own EIN registers as a Standard Brand. The sole-proprietor
path is for individuals without one, and taking it here would cap throughput and
misstate the entity.

Also have ready: registered business address, a credit card, and an authorised
representative's name, email and phone.

> ⏳ **Check the EIN age first.** TCR requires roughly 15+ days. Newly issued
> means you wait, with no workaround. Find that out on day one, not at
> submission.

### Step 1 — Twilio account

`twilio.com` → sign up **as the business**, not as an individual. Upgrade off
trial and add the card. Trial accounts can only text pre-verified numbers.

### Step 2 — Buy one number

Phone Numbers → Buy a number → **Local**, SMS-capable, in the area code Synchro
Social is associated with. **One number for both messages** so a lead who gets a
recovery text and later a confirmation sees a single thread. ~$1.15/mo.

### Step 3 — Consent checkbox on the iClosed form ⚠️ BEFORE Step 6

This must be live **before** the campaign is submitted, because vetting checks
the opt-in you describe actually exists on the stated website. Describing a
checkbox that is not there risks rejection, and it is the exact document that
would be produced against you in a TCPA complaint.

Try **iClosed → Settings → Objects & Fields** (visible on the Business plan) to
add a custom field to the Social Media Consultation form. Separate, unchecked,
not bundled into the existing terms line:

> ☐ Text me about my call. I agree to receive automated text messages from
> Synchro Social at the number provided, including messages about scheduling my
> call. Consent is not a condition of purchase. Message and data rates may
> apply. Reply STOP to opt out, HELP for help.

If iClosed cannot host a separate tickable field, that is the trigger for
Route C — our own name/phone/consent step on `/apply` in front of the widget.

### Step 4 — Customer Profile

Console → **Trust Hub → Customer Profiles** → Business Profile. Legal name and
EIN must match IRS records **exactly** — a mismatch here is the most common
rejection. Returns same-day to ~72h, and does not block Step 5.

### Step 5 — Brand

Trust Hub → **A2P Brand**, created off the Customer Profile.
Choose **Standard Brand** (you have an EIN; sole-proprietor is for individuals).

Fees: ~$4.50 brand registration, plus a $12.50 Authentication+ verification fee,
plus secondary vetting for standard brands (~$40). Usually returns in 1–3
business days.

### Step 6 — Campaign

Messaging → **A2P Campaign**. Type: **Low Volume Standard** — correct for this
volume, and allows up to 2,000 segments/day to T-Mobile, orders of magnitude
more than ~35 messages a week.

Copy these in verbatim — vetting reads them:

| Field | Value |
| --- | --- |
| Use case | **Low Volume Mixed** |
| Description | Appointment follow-up and confirmation for prospects who request a social media strategy call through our website booking form. |
| Sample message 1 | *the exact S1 text from `MESSAGE_TEMPLATES.md`* |
| Sample message 2 | *the exact S2 text from `MESSAGE_TEMPLATES.md`* |
| Opt-in method | Web form |
| Opt-in description | Prospects book a call at https://synchrosocial.com/apply. The booking form includes a separate, unchecked checkbox reading "Text me about my call. I agree to receive automated text messages from Synchro Social at the number provided…". Consent is not required to book. |
| Opt-out | Reply STOP to unsubscribe. Handled automatically by Twilio Advanced Opt-Out. |
| Help | Reply HELP for help. |

$15 one-time vetting, then $1.50–$10/mo. **Vetting is the wait — up to 5
business days for standard cases, 1–4 weeks in practice.** Every rejection
restarts the clock, which is why Steps 3–5 must be right first.

### Step 7 — Enable Advanced Opt-Out

Messaging → Services → your service → **Opt-Out Management**. Turn it on so
Twilio refuses sends to anyone who replied STOP, at the API level.

### Step 8 — Hand over two values

From Console → Account Info:

- **Account SID**
- **Auth Token**
- and the **phone number** in E.164 (`+1XXXXXXXXXX`)

Give me those three and I do the rest — credential into n8n, the S2 confirmation
workflow, S1 wired into the dispatcher behind the consent flag, and inbound
replies routed to Slack.

### What it costs, all in

| | |
| --- | --- |
| One-time | ~$4.50 brand + ~$12.50 auth + ~$40 vetting + $15 campaign ≈ **$72** |
| Monthly | ~$1.15 number + $1.50–$10 campaign ≈ **$3–11/mo** |
| Per message | ~$0.008 + $0.003–0.005 carrier surcharge, per segment |

At ~35 messages a week that is a few dollars a month. **The cost is the waiting,
not the money.**

---

## 2. Reference — the original step-by-step

## 1. [SIDNEY] Account and number

1. Create the account at `twilio.com` on the **Synchro Social business
   identity** — business name, business address, EIN. Do not register it as a
   sole proprietor / individual unless that is genuinely the legal entity; the
   brand registration in §2 is verified against public business records and a
   mismatch is the most common cause of rejection.
2. Upgrade from trial and add a payment method. Trial accounts can only text
   verified numbers, which is useless here.
3. Buy **one local number** with SMS capability, ideally in the area code
   Synchro Social is associated with.

**One number for both S1 and S2**, so a lead who gets a recovery text and later
a confirmation sees a single thread from a single sender.

> **Alternative: toll-free.** A toll-free number uses toll-free verification
> instead of 10DLC brand+campaign registration. It is sometimes quicker to
> stand up and has high throughput. The trade-off is that a toll-free number
> reads as a business line rather than a person, and S2 explicitly says
> "please text me" — a conversational invitation from a 1-800 number lands
> worse. **Recommendation: local 10DLC.** Switch to toll-free only if 10DLC
> vetting is rejected twice.

---

## 2. [SIDNEY] A2P 10DLC registration

In the Twilio console, under **Messaging → Regulatory Compliance / Trust Hub**,
in this order:

**a. Customer Profile** — the legal business identity: registered name, EIN,
address, website, an authorised representative. Must match public records
exactly. `synchrosocial.com` is already Meta-domain-verified, which helps.

**b. Brand** — submitted to The Campaign Registry off the Customer Profile.
Usually returns quickly. A rejection here is nearly always an EIN or legal-name
mismatch with public records.

> ⏳ **EIN age gate.** The Campaign Registry requires the EIN to be a minimum
> age (reported as ~15 days) at registration. If the Synchro Social entity or
> its EIN is newly issued there is no workaround — you wait. Worth checking on
> day one rather than discovering it at submission.

**c. Campaign** — the part that describes *what you will send*, and the part
that gets scrutinised. Register a **single campaign** covering both messages.

Fill it in with the real thing — vetting reads these:

| Field | What to put |
| --- | --- |
| Use case | Mixed / Marketing (S1 makes it marketing; do not register as purely transactional) |
| Description | "Appointment follow-up and confirmation for prospects who request a social media strategy call via our website booking form." |
| Sample message 1 | the exact S1 text from `MESSAGE_TEMPLATES.md` |
| Sample message 2 | the exact S2 text |
| How subscribers opt in | describe the iClosed form consent checkbox — **the wording in §4, which must actually be live on the form before you submit this** |
| Opt-out | "Reply STOP to unsubscribe; handled automatically by Twilio." |
| Help | "Reply HELP for help." |

> ⚠️ **The opt-in description is verified.** Vetting can and does check that the
> described consent flow exists on the stated website. Describing a consent
> checkbox that is not on the form risks rejection and, worse, is the exact
> document that would be produced against you in a TCPA complaint. **Put the
> consent language live before submitting the campaign.**

**Costs:** a one-time brand registration fee, a small recurring campaign fee,
and per-segment message pricing on top of standard US SMS rates. All three are
small at this volume — ~25 recovery texts and ~8 confirmations a week is a
rounding error. Confirm current figures in the console at signup rather than
trusting any number written here; Twilio and TCR reprice periodically.

**Segment counts** (billing is per segment, not per message):
`MESSAGE_TEMPLATES.md` gives S1 ≈ 2 segments and S2 ≈ 3.

---

## 3. Compliance — the part that actually matters

The two messages are **not** in the same legal position, and conflating them is
the mistake to avoid.

### S2 — booked-call confirmation: low risk

Confirms an appointment the recipient just requested, minutes earlier, having
handed over their phone number for that purpose. This is transactional. It is
the same category as an appointment reminder, and it is exactly what people
expect after booking.

### S1 — unfinished-booking follow-up: this is the exposed one

An unsolicited text to someone who did **not** complete a booking, encouraging
them to buy a call. Under the TCPA that is a solicitation, and solicitations to
a mobile number sent with an automated system require **prior express written
consent** — consent that specifically covers *marketing text messages*, obtained
before the message, and provable afterwards.

**What the iClosed form says today:**

> "By entering your information, you consent to your data being saved in
> accordance with our Terms & Privacy Policy."

That is consent to **store data**. It says nothing about text messages, nothing
about marketing, and nothing about automated systems. It does not support S1.

**This is a real exposure, not a technicality.** TCPA claims are statutory
per-message, routinely brought as class actions, and the burden of proving
consent sits with the sender. A recovered lead is not worth that.

**And it cannot be fixed retroactively.** Consent must exist *before* the
message. Every lead already sitting in HubSpot or iClosed gave the old wording,
so **the existing back catalogue is not textable for S1 at all** — not after a
policy update, not after a privacy-policy edit. S1 can only ever address leads
who arrive after the new consent checkbox is live. Plan the value of S1 on
future volume only; anyone hoping to blast the existing list should hear this
now rather than later.

**Consequence, and it is already built in:** `SMS_ENABLED` in workflow 02 ships
`false`. E1 (email) and S2 (transactional) are unaffected and can go live
without any of this. Only S1 waits.

*This is a plain reading of a well-settled rule, not legal advice. If Sidney
wants certainty before enabling S1, a short review by a lawyer who does TCPA
work is cheap relative to the downside.*

---

## 4. [SIDNEY] The consent language to add to the iClosed form

> ⚠️ **First confirm iClosed can host this at all.** The form is served inside
> `app.iclosed.io`, not by us, and it is unverified whether iClosed supports a
> custom, separately-tickable consent field. Two consequences if it cannot:
> the consent cannot be collected where it needs to be, **and** carrier vetting
> may be unable to see it — TCR reviewers need a publicly reachable URL showing
> the consent language, and language rendered only inside a third-party iframe
> may not be rendered or credited, which is a common rejection cause.
>
> If iClosed cannot host it, that is the trigger for **Route C**
> (`README.md` §4): collect name/phone and consent on our own `/apply` page
> before revealing the widget. More friction, but we own the consent record and
> reviewers can see it. Decide this before submitting the campaign, not after a
> rejection.

Add a **separate, unchecked** checkbox — not bundled into the existing terms
line, and not pre-ticked — in iClosed → the Social Media Consultation calendar
→ form fields:

> ☐ Text me about my call. I agree to receive automated text messages from
> Synchro Social at the number provided, including messages about scheduling my
> call. Consent is not a condition of purchase. Message and data rates may
> apply. Reply STOP to opt out, HELP for help.

Five things make this work, and all five are load-bearing:

1. **Unchecked by default** — a pre-ticked box is not affirmative consent.
2. **Separate from the terms line** — consent cannot be bundled.
3. Names **automated** messages and the **sender**.
4. States consent is **not a condition of purchase**.
5. Gives **STOP/HELP** and the rates disclosure.

Then record it: `sms_consent`, `sms_consent_at`, and `sms_consent_source` in
HubSpot (`HUBSPOT_SCHEMA.md` §4). `sms_consent_source` should name the exact
wording version — `iclosed_form_v2` — so that if the wording ever changes you
can still prove which text a given person agreed to.

**If the checkbox is unticked, S1 must not send.** The dispatcher should treat
absent consent exactly like an unknown phone number.

Also worth doing while in there: the privacy policy should mention SMS, since
the consent line points at it.

---

## 5. Operating rules baked into the workflows

| Rule | Where |
| --- | --- |
| STOP/UNSUBSCRIBE honoured automatically | Twilio Advanced Opt-Out — enable it; Twilio then refuses sends to opted-out numbers at the API level |
| Opt-out state read from Twilio, never mirrored | `HUBSPOT_SCHEMA.md` §4 — a second copy can drift and let a message through |
| Quiet hours: no sends before 08:00 or after 21:00 **recipient-local** | workflow 02, `QUIET_START`/`QUIET_END`; quiet hours defer, they do not skip |
| Sender identified in the first clause | every template names Kasper and Synchro Social |
| One S1 per lead, ever | keyed on E.164 phone, not session |
| Never text someone who booked | the gate — see `README.md` §3 |
| Phone stored E.164 or dropped | workflow 01 normalises; unparseable numbers are dropped, not stored malformed |
| Inbound replies reach a human | **not yet built** — see below |

### Replies are an obligation, not a nicety

S2 explicitly says *"please text me"*, and S1 invites an answer. That creates
two duties:

1. **Someone must read the number** during business hours. A number that
   invites replies and answers none is worse than not texting.
2. **Free-text opt-outs must be honoured.** Twilio's keyword filter catches
   STOP / UNSUBSCRIBE / CANCEL. It does **not** catch "stop texting me",
   "please remove me", or "not interested" — and those are legally effective
   revocations that must be actioned promptly.

Minimum viable handling: point the Twilio number's inbound webhook at n8n and
relay every message to Slack, the same way the existing error alerts DM Sidney.
Anything that reads like a revocation gets added to the opt-out list by hand
until it is automated. **Do this before S1 goes live**, not after.

---

## 6. [SIDNEY] Wiring Twilio into n8n

1. Twilio console → Account Info → copy **Account SID** and **Auth Token**.
2. n8n → Credentials → New → **Twilio API** → paste both. Name it **`Twilio SMS`**.
3. In workflows 02 and 03, select that credential on the Twilio nodes and
   replace `REPLACE_WITH_TWILIO_NUMBER_E164` with the purchased number in
   E.164 (`+1XXXXXXXXXX`).
4. Set each workflow's **Error Workflow** to *SyncView — Error Alerts → DM
   Sidney*, per house convention. Not optional — it is what turned the July
   silent-email-failure class of bug into a Slack DM.

> Keep the Auth Token in the n8n credential store only. Several existing
> workflows have API keys pasted into code nodes
> (`CLIENT_LIFECYCLE_MAP.md` §15.6) — do not add to that pile.

---

## 7. Testing before it touches a real lead

In order, none skippable:

1. **After registration approves**, send a manual test from the Twilio console
   to Sidney's own phone. Proves the number can deliver at all.
2. **Workflow 03 (S2)** — execute manually in n8n with a fixed payload:
   Sidney's phone, a `call_start_iso` a few hours out, and a timezone. Check
   the rendered time is right, then repeat with `America/Los_Angeles` and
   confirm the time shifts. That is the bug the renderer exists to prevent.
3. **Workflow 02 (S1)** — with `SMS_ENABLED` still `false`, hand-insert a row
   into `booking_recovery` with Sidney's details and a `follow_up_due_at` in
   the past. Confirm the **email** arrives and the row updates. Then flip
   `SMS_ENABLED` and repeat for the text.
4. **The gate** — the important one. Insert a pending row for an email address
   that already has a HubSpot contact with a `deal_id`. Run the dispatcher.
   **Nothing must send**, and the row must land on
   `status=suppressed, suppressed_reason=already_booked`. Do not enable
   anything for real traffic until this test passes.
5. **STOP** — reply STOP from the test phone, then re-run. Twilio must reject
   the send.

---

## 8. Checklist

- [ ] **Checked whether iClosed sends SMS reminders natively** (§0.5) — may remove the need for most of this
- [ ] EIN confirmed old enough for TCR (§2b)
- [ ] Confirmed iClosed can host a separate consent checkbox (§4) — or decided on Route C
- [ ] Twilio account on the business identity, upgraded, payment added
- [ ] Local SMS number purchased
- [ ] Customer Profile submitted and approved
- [ ] Brand registered and approved
- [ ] **Consent checkbox live on the iClosed form** (§4) — before campaign submission
- [ ] Campaign submitted with real sample messages and the real opt-in description
- [ ] Campaign approved, number attached to it
- [ ] Advanced Opt-Out enabled
- [ ] Inbound replies routed to Slack, and someone owns watching them (§5)
- [ ] `Twilio SMS` credential created in n8n
- [ ] Number set in workflows 02 and 03; Error Workflow set on both
- [ ] Privacy policy mentions SMS
- [ ] Tests 1–5 in §7 all pass
- [ ] `SMS_ENABLED` flipped to `true`

---

*Fees and vetting timelines change; verify in the console rather than trusting
this file. The compliance reasoning in §3–4 is stable and should not be
softened without a lawyer saying so.*
