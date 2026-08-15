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

## 0.5 [SIDNEY] Check this before doing any of it

**Does iClosed already send SMS appointment reminders?** If it does, S2 — the
booked-call confirmation, which is most of the value and none of the legal risk
— ships on iClosed's already-registered sender with zero Twilio work, zero
registration wait, and zero compliance exposure. Check iClosed → notifications /
reminders, and its Sendblue integration.

Only S1 genuinely needs a number we control, because only S1 is us initiating
contact with someone who did not complete a booking. **Do not spend two weeks on
carrier registration before confirming you need it.**

---

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
