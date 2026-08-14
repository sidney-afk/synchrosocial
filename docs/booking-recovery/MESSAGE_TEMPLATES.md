# Booking Recovery — message templates (email + SMS)

> The exact copy that goes out, the merge fields behind it, and the date logic
> that keeps it from saying something dumb. Sidney supplied the two source
> templates; everything here preserves his voice and only makes the variable
> parts safe.
>
> Sender identity for all three messages is **Kasper**, even though the email
> sends from the shared `hello@synchrosocial.com` mailbox (§Sender identity).

---

## The three messages

| ID | Trigger | Channel | Timing |
| --- | --- | --- | --- |
| **E1** | Lead entered contact info in the iClosed form, never picked a time | Email | ~30 min after abandonment |
| **S1** | Same trigger as E1, still no booking | SMS | ~4 h after abandonment (staggered behind E1) |
| **S2** | Lead completed a booking | SMS | immediately on booking |

E1 and S1 are the **same** recovery attempt on two channels — one lead never
gets two of the same message, and both are cancelled the moment a booking
lands (§Kill-switch).

---

## E1 — unfinished booking, email

**From:** `Synchro Social <hello@synchrosocial.com>`
**Reply-To:** `kasper@synchrosocial.com`
**Subject:** `{{first_name}}, still want that social media strategy call?`

```
Hi {{first_name}},

This is Kasper from Synchro Social. I saw that you filled our form and was
interested in booking a call with us, but didn't end up booking a time.

Let me know if you have any availability {{day_option_1}} or {{day_option_2}}
and I'd be happy to schedule a social media strategy call with you.

With gratitude,
Kasper
```

Changes from Sidney's source template, and why:

| Change | Reason |
| --- | --- |
| Added a subject line | Source had none; needed one. |
| `tomorrow or Monday` → `{{day_option_1}} or {{day_option_2}}` | See §Date logic — the literal version offers Saturday when sent on a Friday. |
| Added `Kasper` under "With gratitude," | Source ended on the sign-off with no name. |
| Straight apostrophes | Source used typographic `’`; plain `'` avoids encoding issues across clients. |

Everything else is verbatim, including the slightly informal
"I saw that you filled our form and was interested" — that is Kasper's voice,
not a typo to correct. **Flagging it once so it is a choice, not an oversight:**
if he wants it grammatical it becomes "…and *were* interested". Left as-is.

---

## S1 — unfinished booking, SMS

Sidney did not supply a template for this one; it is E1 compressed to SMS
length in the same voice.

```
Hi {{first_name}}, it's Kasper from Synchro Social. Saw you started booking a
social media strategy call but didn't lock in a time.

Want me to hold a spot for you {{day_option_1}} or {{day_option_2}}?

{{booking_url}}

Reply STOP to opt out.
```

- **160-char note:** this runs ~230 characters, so it bills as 2 segments. That
  is fine and normal; splitting it would read worse.
- `Reply STOP to opt out` is required on the first message to a recipient
  (§Compliance). Twilio's Advanced Opt-Out can append it automatically — either
  way it must be present.

---

## S2 — booked call confirmation, SMS

```
Hi {{first_name}}, it's Kasper from Synchro Social & just saw that you booked a
call for {{call_when}}.

I'm excited to chat with you, if there's anything you'd like to share about
your brand/work beforehand, please text me but otherwise I'll talk to you
{{call_when_short}}!

PS. If you're interested in learning more about us before the call, the thank
you page has some Q&A videos when you scroll down:
https://synchrosocial.com/thank-you
```

Changes from Sidney's source template:

| Change | Reason |
| --- | --- |
| `tomorrow at 3:45pm` → `{{call_when}}` | Booking can be any distance out; see §Date logic. |
| `talk to you tomorrow` → `talk to you {{call_when_short}}` | Same reason — has to agree with the first line. |

Everything else is verbatim, including the `&`, the run-on middle sentence, and
the `PS.` — that is the voice.

This message is ~340 characters → **3 segments**. Worth knowing for cost, not
worth cutting.

---

## Merge fields

| Field | Source | Example | Fallback |
| --- | --- | --- | --- |
| `{{first_name}}` | iClosed form first name | `Andrew` | see below |
| `{{day_option_1}}` / `{{day_option_2}}` | computed at send time | `Monday`, `Tuesday` | — |
| `{{call_when}}` | booking start time, in the **lead's** timezone | `tomorrow at 3:45pm`, `Thursday at 3:45pm` | — |
| `{{call_when_short}}` | same, day part only | `tomorrow`, `Thursday` | — |
| `{{booking_url}}` | `https://synchrosocial.com/apply` | — | — |

**`first_name` fallback.** If the captured name is empty, whitespace, a single
character, or contains a digit or `@`, do not send a broken "Hi ,". Fall back to
dropping the name entirely:

- E1 subject → `Still want that social media strategy call?`
- E1/S1 first line → `Hi, this is Kasper from Synchro Social.`

Also normalise casing: `andrew` → `Andrew`, `ANDREW` → `Andrew`. Leave
internal capitals alone (`McKay`, `O'Brien`) — only fix all-lower and all-upper.

---

## Date logic

This is the part that breaks if it is hardcoded, and it is the reason both
source templates needed edits.

### `day_option_1` / `day_option_2` (E1, S1)

Pick the next **two business days** that are at least 1 day out, in
`America/New_York` (Kasper's booking timezone):

```
candidates = next 7 calendar days, excluding Saturday and Sunday
day_option_1 = candidates[0]
day_option_2 = candidates[1]
```

Render `day_option_1` as `tomorrow` **only if** it is literally the next
calendar day; otherwise use the weekday name.

Worked examples:

| Sent | `day_option_1` | `day_option_2` | Reads as |
| --- | --- | --- | --- |
| Tue | `tomorrow` (Wed) | `Thursday` | "…availability tomorrow or Thursday" |
| Thu | `tomorrow` (Fri) | `Monday` | matches Sidney's original exactly |
| **Fri** | `Monday` | `Tuesday` | "…availability Monday or Tuesday" ← the case the literal template got wrong |
| Sat | `Monday` | `Tuesday` | |
| Sun | `tomorrow` (Mon) | `Tuesday` | |

### `call_when` / `call_when_short` (S2)

Relative to send time, in the **lead's own timezone** as captured by iClosed —
not Kasper's. Telling someone in Los Angeles their call is at 3:45pm when they
booked 12:45pm their time is the fastest way to lose the call.

| Booking is | `call_when` | `call_when_short` |
| --- | --- | --- |
| later the same day | `today at 3:45pm` | `later today` |
| the next calendar day | `tomorrow at 3:45pm` | `tomorrow` |
| 2–6 days out | `Thursday at 3:45pm` | `Thursday` |
| 7+ days out | `Thu, Aug 27 at 3:45pm` | `then` |

Time format: lowercase `am`/`pm`, no leading zero, drop `:00` on the hour
(`3pm`, not `3:00 PM`). If the lead's timezone is missing, fall back to
`America/New_York` and append the label: `tomorrow at 3:45pm ET`.

"Days out" means **calendar days in the recipient's timezone**, not elapsed
hours. A call 15 hours away can still be tomorrow: booked Friday 6pm for
Saturday 9am is `tomorrow`, and an hours-÷-24 bucket would wrongly say `today`.

### Verification

Both helpers are exercised by `n8n/test-date-logic.js`, which holds the code
copied verbatim out of the n8n code nodes and asserts every row of the two
tables above, plus the timezone and across-midnight traps:

```
node docs/booking-recovery/n8n/test-date-logic.js
```

Run it after editing either code node. It exits non-zero on any mismatch.

---

## Sender identity

The messages are written first-person as Kasper, but the email sends from the
shared `hello@synchrosocial.com` mailbox — the single Gmail credential every
client email already uses (`CLIENT_LIFECYCLE_MAP.md` §15.16).

Resolution: **From name `Synchro Social`, Reply-To `kasper@synchrosocial.com`.**
The body introduces him ("This is Kasper from Synchro Social"), so the identity
is clear, and replies reach him directly rather than the shared inbox.

Do **not** set the From name to "Kasper" on the shared mailbox — a From name
that disagrees with the sending domain's established identity hurts
deliverability and looks like spoofing to filters.

For SMS, the Twilio number is the identity, and every message names Kasper in
the first clause. Same number for S1 and S2 so a lead who gets both sees one
thread.

---

## Kill-switch and dedupe

The one rule that matters: **a lead who books must never receive E1 or S1.**

1. Every scheduled follow-up re-checks booking state immediately before send,
   not just at schedule time. This mirrors the existing pre-call nurture, which
   re-reads the `iClosed Cancelled Calls` Data Table before each of its 6 sends.
2. A lead gets **at most one** E1 and **at most one** S1, ever — keyed on
   normalised email + E.164 phone, not on session. Someone who abandons three
   times in a week is one lead, not three.
3. If the lead already has a HubSpot contact with a deal at `appointmentscheduled`
   or beyond, suppress both — they are already in the pipeline.
4. S2 fires once per booking. A reschedule is a new booking; a cancel suppresses
   any unsent S2.

---

## Compliance quick-reference

Detail and citations live in `TWILIO_RUNBOOK.md`; the short version:

- **S2 (booked confirmation)** is transactional — it confirms an appointment the
  recipient just requested. Low risk.
- **S1 (unfinished booking)** is the exposed one. The iClosed form's current
  consent line covers *data storage*, not *marketing SMS*. Sending S1 on today's
  consent language is a real TCPA risk, so the form's consent text must be
  updated before S1 goes live. E1 and S2 are not blocked by this.
- Every SMS: identify the sender (done — "it's Kasper from Synchro Social"),
  honour STOP/UNSUBSCRIBE automatically, and respect quiet hours
  (no sends before 8am or after 9pm **in the recipient's timezone**).

---

*Update this file whenever the copy changes. The n8n workflows render from
these templates — if they drift, the doc is the source of truth.*

---

## Owner decisions — 2026-08-14

**No unsubscribe line, and no postal address in the footer.** Raised with Sidney
as a CAN-SPAM consideration (both are mandatory elements for commercial email;
liability is per message). He considered it and decided against both. E1 sends
exactly as he wrote it.

Recorded here so it reads as a deliberate choice rather than an oversight, and
so it can be revisited cheaply if volume grows or a complaint ever arrives —
adding either is a one-line change to the Gmail node.

Two things partially offset it in practice:
- Every message carries a real `Reply-To: kasper@synchrosocial.com`, so a
  recipient asking to be left alone reaches a human immediately.
- That request is honoured durably: the `do_not_contact` column on
  `booking_recovery` suppresses a lead permanently across every channel,
  checked before anything else in the dispatcher. Kasper sets it when someone
  asks.

**Send cap: 5 per run**, and rows armed before `ACTIVATED_AFTER` are never
chased. Together these mean switching the sender on cannot blast a backlog, and
any defect that survived testing is bounded at 5 messages per 10 minutes rather
than unbounded.
