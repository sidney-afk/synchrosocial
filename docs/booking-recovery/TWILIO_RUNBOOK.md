# Twilio: what is live, and what is still unresolved

> Everything about how texts are sent for booking recovery and booking
> confirmations. Read the live state first, then the open questions.
>
> **n8n is the source of truth** for what is wired. This file was rewritten
> 2026-09-30 from the live workflows. It replaces a long setup log that described
> a local-number A2P 10DLC plan and an `SMS_ENABLED` switch; neither matches what
> is running. The old log is in git history.
>
> **This repo is public.** Do not put account identifiers, the EIN, personal phone
> numbers or API keys in this folder. An earlier version of this file did; they
> were removed 2026-09-30 (they remain in git history).

---

## 1. What is live (read from n8n, 2026-09-30)

| Thing | State |
| --- | --- |
| Recovery text (S1) | **On.** `Sales — Booking Recovery Dispatch` > `Send Recovery SMS`. There is no on/off flag in the workflow any more. |
| Confirmation text (S2) | **On.** `Sales — Call Booked (iClosed)` (AI funnel) and `Normal Sales — Booking Handler` (normal and doctors funnels), each with a `Send Confirmation SMS` node. |
| Sender | One **toll-free number**, hard-coded in all three Twilio nodes. |
| n8n credential | `Twilio — SMS`, used by all three nodes. |
| Replies | `Sales — Inbound SMS Relay` receives Twilio's inbound webhook and posts each reply (from, to, body) to Kasper on Telegram. |
| Per-send alerts | Every recovery text and every confirmation text also posts to Kasper on Telegram; recovery sends also DM Sidney on Slack. |
| Test sends | A recovery text to a lead tagged as a test is prefixed `[TEST - internal, please ignore]`. |
| Doctors partial leads | **Never texted.** Their row is armed with the text pre-stamped as sent (`n/a-no-sms-consent`). |

The message copy is in `MESSAGE_TEMPLATES.md`.

### Not verifiable from n8n

These live in the Twilio console. Nobody has checked them from this repo:

- whether the toll-free number is **verified** for the traffic it sends;
- whether Advanced Opt-Out is on for the messaging service, and whether HELP is answered;
- the account balance;
- whether the local 786 number, brand and campaign from the August attempt are
  still in use or were abandoned when sending moved to toll-free.

---

## 2. How we got here (short)

- **2026-08-14.** Plan: Twilio on a local number, registered for A2P 10DLC,
  recovery text behind an `SMS_ENABLED=false` flag until consent was sorted.
- **2026-08-17 to 08-20.** Twilio account upgraded, a local 786 number bought,
  brand approved. The campaign was rejected four times. Lessons kept from that:
  - The privacy policy and terms must mention SMS and be live **before** a
    campaign is filed.
  - The registration request itself must carry the privacy and terms URLs, or the
    same two errors come back. When a symptom returns after a change, diff your
    own request before blaming the platform.
  - A campaign submission can cost $15 even if it fails. Get it right first time.
  - A primary customer profile cannot be filed over the API; a person does it in
    the console.
- **By 2026-08-26.** Sending was on a **toll-free** number, the fallback the
  original plan named (the inbound relay workflow created that day names it). Both
  texts are now live with no flag. When the flag was removed, and why, is not
  written down in this folder.

Costs seen: local number about $1.15 a month, toll-free about $2.15 a month, about
$0.008 per segment plus carrier surcharges. A recovery text is about 2 segments and
a confirmation about 2 to 3.

---

## 3. Open compliance questions (owner decisions)

These are facts about the current state, not a legal conclusion. Sidney decides.

1. **The recovery text does not check consent.** `Select Due` texts every armed
   lead that has a phone number. No consent value is read, because none is stored.
   As of 2026-08-18 the `sms_consent` property was empty on all 47 HubSpot
   contacts, and the capture workflow still does not write it. The doctors partial
   flow is the one place that deliberately skips texting for lack of consent.
2. **What the public opt-in page says.** `/sms-opt-in` (source:
   `src/pages/sms-opt-in.astro`) is written as documentation for "A2P 10DLC
   campaign verification". It says the program sends one confirmation text after a
   booking, "typically one message per booking", and that **no marketing or
   promotional text messages are sent on this campaign**. The recovery text goes to
   people who did **not** book. If carrier or toll-free verification was filed
   against that page, live traffic does not match what was described there, which
   is the thing reviewers check and the thing a complaint would quote.
3. **What the booking pages say.** Two pieces of consent text exist, and they
   are in different places:
   - Inside the iClosed form (a third-party iframe, not in this repo), per
     `/sms-opt-in`: a checkbox, unchecked by default and not required, reading "By
     entering your information, you consent to your data being saved in accordance
     with our Terms & Privacy Policy and to receive text messages."
   - On our own `/apply` and `/doctors` pages (`src/pages/apply.astro`,
     `src/pages/doctors.astro`), under the form: "By booking a call you agree to
     receive text messages from Synchro Social about your call. Message frequency
     varies, typically one message per booking. Message and data rates may apply.
     Reply STOP to opt out, HELP for help."

   Keep the second one. It carries the four elements carriers look for (message
   type, frequency, rates, opt-out) next to the phone field, and `apply.astro` has
   a comment pointing back to this file. Its scope is "about your call" and
   "typically one message per booking". The tick in the iClosed form is not
   recorded anywhere we store, so there is no per-person proof of it.
4. **The page shows an older confirmation text.** `/sms-opt-in` still quotes the
   confirmation with a `PS.` line and a thank-you link. The live text has neither.
   See `MESSAGE_TEMPLATES.md`.

Plain reading of the rule, not legal advice: texts that encourage someone to buy
are solicitations, and solicitations sent with an automated system to a mobile
number need prior express written consent that covers marketing texts, given
before the message and provable afterwards. Statutory damages are per message and
the burden of proof sits with the sender. Consent cannot be fixed retroactively. If
Sidney wants certainty, a short review by a lawyer who does TCPA work is cheap
against the downside.

What would close this, in order of effort:

- store the tick (`sms_consent`, `sms_consent_at`, wording version) and have
  `Select Due` require it before texting;
- align `/sms-opt-in` and the registered use case with what is actually sent;
- or turn the recovery text back off (remove or disable the `Send SMS?` branch in
  the dispatcher) until one of the above is done.

Do not change a live n8n workflow without Sidney's go-ahead.

---

## 4. Operating rules, as built

| Rule | Where it lives |
| --- | --- |
| Quiet hours: texts only 08:00 to 21:00 in the lead's timezone; deferred, not skipped | Dispatch > `Select Due` |
| Never text someone who booked | Capture, `Select Due` and `Safety Gate` (see `MESSAGE_TEMPLATES.md`, Kill-switch) |
| Permanent opt-out across channels | `do_not_contact` column, checked first in `Select Due`. A person sets it by hand. |
| STOP keyword | Expected to be Twilio's standard handling; not checked in the console |
| Sender named in the first clause | every template |
| Phone stored as E.164 or dropped | capture workflows; the Twilio node also normalises 10 and 11 digit US numbers |
| At most 5 leads per hourly run | `Select Due` |
| Replies reach a human | `Sales — Inbound SMS Relay` to Telegram |
| A reply that means "stop" but is not the STOP keyword ("please remove me", "not interested") | **Manual.** Twilio does not catch these. Kasper must set `do_not_contact` on the row. |

Notes on the inbound relay: its webhook has no authentication and does not verify
Twilio's signature, so anyone who finds the URL could post fake replies into
Kasper's Telegram. Low impact, but worth knowing.

---

## 5. Testing without texting a real person

- **Test lead.** A lead whose `utm_source` contains "test" (or whose email is
  plus-addressed with "test") re-arms a closed row even if the number has been
  contacted, and the text is prefixed `[TEST - internal, please ignore]`. Use Sidney's own number.
- **The booked gate.** Insert a pending row for an email that has a HubSpot
  contact with a `deal_id`, then let the dispatcher run. Nothing may send, and the
  row must land on `suppressed / already_booked`.
- **Quiet hours.** Use a test lead with a timezone where it is currently night.
  The email should go, the text should wait, and the row should stay `pending`.
- **Never** test with a real prospect's number, and never run the gate test for the
  first time inside a real run.

---

## 6. Credentials

The Twilio account SID, auth token or API key belong in the n8n credential store
only. Several n8n code nodes already hold webhook secrets in plain code
(`CLIENT_LIFECYCLE_MAP.md` §15.6); do not add to that. If an API key was ever pasted
into a chat or a file during setup, rotate it in the Twilio console.
