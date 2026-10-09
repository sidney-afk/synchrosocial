# Booking Recovery: message templates (email + SMS)

> The copy that actually goes out, the merge fields behind it, and the date logic
> that keeps it from saying something wrong.
>
> **n8n is the source of truth.** This file describes the live workflows as of
> **2026-09-30** (versions pinned in `README.md` under "Verified against"). If the
> copy in an n8n node and this file ever disagree, n8n wins and this file is stale.
> Change the node, then change this file in the same sitting.
>
> Sender identity for every message is **Kasper**, even though the email sends
> from the shared `hello@synchrosocial.com` mailbox (see Sender identity).

---

## The messages

| ID | Trigger | Channel | When it sends | Workflow |
| --- | --- | --- | --- | --- |
| **E1** | Lead entered contact info in the booking form and never booked | Email | first hourly run after the 30 minute wait | `Sales — Booking Recovery Dispatch` |
| **S1** | Same trigger as E1 | SMS | same run as E1, unless it is outside the lead's 8am to 9pm (see Timing) | `Sales — Booking Recovery Dispatch` |
| **S2** | Lead booked a call | SMS | immediately on booking | `Sales — Call Booked (iClosed)` (AI funnel) and `Normal Sales — Booking Handler` (normal and doctors funnels) |

E1 and S1 are the same recovery attempt on two channels. Every non-finisher who
has an email gets E1, and every non-finisher who has a phone gets S1, in the same
run. Both are cancelled if a booking lands first (see Kill-switch).

One exception: leads armed by `Sales — Doctors Partial Lead Capture` get **E1
only**. That workflow pre-stamps the text as already sent (`sms_sent_at` is set to
`n/a-no-sms-consent`), so the dispatcher never texts them. Reason given in the
workflow: those visitors have not agreed to texts, because the consent line sits
on the form's submit button, which they never pressed.

---

## Timing

1. The lead is captured. The row is armed with `follow_up_due_at` = capture time
   plus **30 minutes**.
2. `Sales — Booking Recovery Dispatch` runs **once an hour** (at about :00:40) and
   picks up every row that is due. So a recovery message goes out **30 to 90
   minutes** after capture, not at exactly 30.
3. The email is never held back. The text only sends between **08:00 and 21:00 in
   the lead's own timezone** (default `America/New_York` when unknown). Outside
   that window the email goes immediately, the row stays `pending`, and a later
   run inside the window sends the text.
4. A lead stops being chased **72 hours** after capture (`expired`).
5. At most **5 leads per run** are processed, oldest first. A lead can cost two
   sends (email and text), so that is up to 10 messages an hour.
6. Each message is stamped on the row **before** it is sent. If Gmail or Twilio
   fails, the cost is one missed message, never a duplicate.

---

## Current wording for doctor and coach leads (live since 2026-10-09)

Owner-approved human-sounding follow-ups. They apply to calendars
`doctor-strategy-call` and `social-media-consultation` only. Every other calendar
(for example `ai-intro-call`) still gets the previous wording below.

The link is the lead's own iClosed page, with `?fu=<code>` added so a booking that
came from a follow-up can be told apart later (`rt` recovery text, `re` recovery
email, `st` instant text, `se` instant email). `{{work}}` is `practice` for doctors
and `business` for coach leads. With no usable first name the greeting is `Hey,` /
`Hi,`.

**Recovery text (form started, not booked)** from `Sales — Booking Recovery Dispatch`:

```
Hey {{first_name}}, it's Kasper from Synchro Social. Just got your application. Is there anything I should know about your {{work}} before we talk?

If it's easier, you can grab a time here: {{link}}

Oh, and if you'd rather not get texts from me, just reply STOP.
```

**Recovery email**, subject `your application`:

```
Hi {{first_name}},

Kasper here from Synchro Social. I saw your application come through, but it looks like you didn't get to pick a time.

Is there anything I should know about your {{work}} before we talk? You can grab any slot that suits you here: {{link}}
```

**Instant text (right after the /doctors form is submitted)** from `Sales — Doctors Instant Booking Link` (doctors only):

```
Hey {{first_name}}, it's Kasper from Synchro Social. Just got your application, thank you. Here's the link to pick a time for our call: {{link}}

Oh, and if you'd rather not get texts from me, just reply STOP.
```

**Instant email**, subject `your application`:

```
Hi {{first_name}},

Kasper here from Synchro Social. Thanks for applying, I have your details.

You can pick a time for our call here: {{link}}

If you have any questions first, just reply to this email.
```

Email format: built like the nurture emails (formatted HTML, each paragraph one
block that wraps by itself), no header logo, then the nurture footer (small logo and
"Kasper + The Synchro Social Team", synchrosocial.com). There is no separate
"Kasper" line above the footer. Sender name `Kasper from Synchro Social`, address
`hello@synchrosocial.com`, reply-to `kasper@synchrosocial.com`. Test leads still get
`[TEST - internal, please ignore] ` in front of the text only.

Text length: recovery text is 3 SMS segments (2 with no first name), instant text
is 2.

### How to restore the previous wording

Both workflows keep their earlier versions in n8n version history. Restore the
version named before "Human wording" in each:

- `Sales — Booking Recovery Dispatch` (`nQ4vnZ8bmG3E3Lor`): active version before
  the change was `a5613786-11dc-40b0-a78e-6e3f82070112`.
- `Sales — Doctors Instant Booking Link` (`cM3G9REliKpwicnR`): active version before
  the change was `135a17d8-a362-4486-84d4-6f81c7e09c29`.

The previous wording is also kept in full in the sections below.

---

## E1: unfinished booking, email (previous wording, still used for other calendars)

**From:** `Synchro Social` (shared `hello@synchrosocial.com` mailbox)
**Reply-To:** `kasper@synchrosocial.com`
**Subject:** `{{first_name}}, still want that social media strategy call?`
(no name: `Still want that social media strategy call?`)

The email is HTML (logo header, Kasper signature block). The text content is:

```
Hi {{first_name}},

This is Kasper from Synchro Social. I saw that you filled our form and was
interested in booking a call with us, but didn't end up booking a time.

Let me know if you have any availability {{day_option_1}} or {{day_option_2}}
and I'd be happy to schedule a social media strategy call with you.

[doctors calendar only:]
Or if it is easier, you can pick a time yourself here: synchrosocial.com/doctors

With gratitude,
Kasper
synchrosocial.com
```

The `/doctors` paragraph is added only when the lead's calendar is
`doctor-strategy-call`. It was added 2026-09-30.

"I saw that you filled our form and was interested" is Kasper's voice, not a typo.
Left as is on purpose.

---

## S1: unfinished booking, SMS (previous wording, still used for other calendars)

Sent from the account's toll-free number (see `TWILIO_RUNBOOK.md`).

```
Hi {{first_name}}, it's Kasper from Synchro Social. Saw you started booking a call but didn't get to finish — want to grab a time for {{day_option_1}} or {{day_option_2}}? Just reply here and I'll get you scheduled. Reply STOP to opt out.
```

- No name on file: `Hi there, it's Kasper from Synchro Social. ...`
- Test leads (`utm_source` contains "test", or a plus-addressed email containing
  "test") get `[TEST - internal, please ignore] ` in front. Real leads cannot
  trigger it, so a test never needs the template edited.
- There is no booking link in the live text. The lead is expected to reply, and
  replies are relayed to Kasper on Telegram (see Replies).

---

## S2: booked call confirmation, SMS

Both booking workflows send the same text to any booking that has a phone number:

```
Hi {{first_name}}, it's Kasper from Synchro Social & just saw that you booked a call for {{when}} at {{time}}. I'm excited to chat with you, if there's anything you'd like to share about your brand/work beforehand, please text me but otherwise I'll talk to you {{when}}! Reply STOP to opt out, HELP for help.
```

- `{{when}}` is `today`, `tomorrow`, or the weekday name.
- `{{time}}` is the call time in the **lead's** timezone, lowercase, no space
  (`3:45pm`). On the hour it reads `3:00pm`.
- Known behaviour: a call 7 or more days out still says only the weekday name
  ("Thursday"), with no date.
- The older draft's `PS.` line and thank-you page link are **not** in the live text.

---

## Merge fields

| Field | Source | Fallback |
| --- | --- | --- |
| `{{first_name}}` | iClosed first name | see below |
| `{{day_option_1}}` / `{{day_option_2}}` | computed at send time | `later this week` |
| `{{when}}` / `{{time}}` | booking start time, lead's timezone | `America/New_York` |

**`first_name` fallback.** A name is used only if it is 2 or more characters and
has no digit or `@`. All-lower and all-upper names are title-cased (`andrew` and
`ANDREW` become `Andrew`); names with internal capitals (`McKay`) are left alone.
Otherwise: email salutation `Hi,`, email subject without the name, SMS `Hi there,`.

---

## Date logic

### `day_option_1` / `day_option_2` (E1 and S1)

The next **two weekdays** after today, in the lead's timezone. `day_option_1`
reads `tomorrow` only when tomorrow is the very next calendar day and is a
weekday; otherwise the weekday name.

| Sent | `day_option_1` | `day_option_2` |
| --- | --- | --- |
| Mon | `tomorrow` | `Wednesday` |
| Tue | `tomorrow` | `Thursday` |
| Thu | `tomorrow` | `Monday` |
| **Fri** | `Monday` | `Tuesday` |
| Sat | `Monday` | `Tuesday` |
| Sun | `tomorrow` | `Tuesday` |

The Friday row is the reason this is computed: a hardcoded "tomorrow or Monday"
would offer Saturday.

### `when` and `time` (S2)

"Days out" is counted in **calendar days in the lead's timezone**, not elapsed
hours. A call 15 hours away can still be tomorrow. A lead in Los Angeles is told
their own local time.

### Verification

`n8n/test-date-logic.js` holds the code copied from the live n8n nodes and asserts
the tables above plus the timezone and across-midnight traps:

```
node docs/booking-recovery/n8n/test-date-logic.js
```

Run it after editing either code node. It exits non-zero on any mismatch. It does
not read n8n, so it cannot tell you the copy has drifted; re-copy after a change.

---

## Sender identity

The messages are first person as Kasper, but the email sends from the shared
`hello@synchrosocial.com` mailbox, the single Gmail credential ("Hello email")
that every sales and client email depends on (`CLIENT_LIFECYCLE_MAP.md` §15.16).

Resolution: **From name `Synchro Social`, Reply-To `kasper@synchrosocial.com`.**
The body introduces Kasper, and replies reach him directly.

Do **not** set the From name to "Kasper" on the shared mailbox. A From name that
disagrees with the sending domain hurts deliverability and looks like spoofing.

For SMS, the toll-free number is the identity, and every message names Kasper in
the first clause. The recovery text, the confirmation text and inbound replies all
use the same number, so a lead sees one thread.

### Replies

- **Email replies** go to `kasper@synchrosocial.com`.
- **Text replies** hit `Sales — Inbound SMS Relay`, which forwards each one to
  Kasper on Telegram (from, to, body). The STOP keyword is expected to be handled
  by Twilio's standard opt-out handling; that setting has not been checked in the
  Twilio console from here.
- Kasper also gets a Telegram message for each recovery email or text sent, and
  Sidney gets a Slack DM for each.

---

## Kill-switch and dedupe

The rule that matters: **a lead who books must never receive E1 or S1.**

1. **At capture.** A contact that already has a call attached, or that iClosed
   marked disqualified, or that is on a non-acquisition calendar, is filed
   `suppressed` and never armed.
2. **On booking.** The capture webhook sees the booking and stamps the same row
   `suppressed / booked`. Capture resolves a lead to one row by `lead_key` OR
   email OR phone, so a lead whose key changed between pings still closes.
3. **At send, from our own table.** `Select Due` reads every row marked `booked`
   in the last 30 days and drops any pending lead that matches one by email or by
   the last 9 digits of the phone.
4. **At send, from HubSpot.** `Safety Gate` searches HubSpot by email and by phone
   and suppresses the lead if the contact has a `deal_id`, has
   `iclosed_status = booked`, or is a `customer` or `opportunity`. A HubSpot error
   stops the whole run, so nothing sends unverified.
5. **Opt-out wins.** Any row with `do_not_contact` set is closed and never
   contacted on any channel. Kasper sets it when someone asks.

A lead gets at most one E1 and one S1 per episode. After 30 days, a closed row is
re-armed if the person comes back (see `README.md`, Re-arming).

---

## Compliance quick reference

Detail is in `TWILIO_RUNBOOK.md`. The short version:

- **S2** confirms an appointment the recipient just requested. Transactional.
- **S1** is a follow-up to someone who did **not** finish booking, so it is a
  solicitation. The live dispatcher sends it to every captured lead who has a
  phone. **It does not check any SMS consent record**, because none is stored.
  The only consent evidence is the unchecked-by-default line on the booking form.
  This is an open owner decision, not a settled one. See `TWILIO_RUNBOOK.md`,
  "Open compliance questions".
- Every SMS names the sender in the first clause and carries a STOP line.
- Quiet hours: no texts before 8am or after 9pm in the lead's timezone.

---

## Owner decisions

**2026-08-14. No unsubscribe line, no postal address in the email footer.** Raised
as a CAN-SPAM point (both are required elements of commercial email, with
liability per message). Sidney considered it and decided against both. E1 sends as
written. Recorded here so it reads as a choice, and so it can be revisited cheaply:
adding either is a one-line change to the Gmail node. Two things offset it in
practice: every email has a real `Reply-To: kasper@synchrosocial.com`, and the
`do_not_contact` column suppresses a lead permanently across every channel.

**Send cap and stale rows.** At most 5 leads per run, and rows armed before
`ACTIVATED_AFTER` (2026-08-14 23:30 UTC) are never chased. A defect that slips
through is bounded to a handful of messages an hour rather than a blast.

---

## Previous instant wording for /doctors (replaced 2026-10-09, kept to restore)

Sent by `Sales — Doctors Instant Booking Link`.

Email, HTML with logo header and the nurture signature block, sender name
`Synchro Social`. Subject: `{{first_name}}, here is the link to book your strategy call`
(no name: `Here is the link to book your strategy call`).

```
Hi {{first_name}},

This is Kasper from Synchro Social. Thanks for applying - I have your details.

If you have not picked a time for your social media strategy call yet, or the calendar did not load for you, you can book it here whenever it suits you:

[Pick a time for your strategy call] -> https://app.iclosed.io/e/synchrosocial/doctor-strategy-call

Just reply to this email if you have any questions first.

With gratitude,
Kasper
```

Text:

```
Hi {{first_name or "there"}}, it's Kasper from Synchro Social. Thanks for applying! If you haven't picked a time for your strategy call yet, you can book here: https://app.iclosed.io/e/synchrosocial/doctor-strategy-call Reply STOP to opt out.
```
