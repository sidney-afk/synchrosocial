# /doctors: save an unfinished form as soon as the email is valid

**DO NOT MERGE before Tuesday 13 October 2026, 9:33 am Costa Rica time, and not before Kasper approves.**
Merging this pull request deploys the page to the live site.

## What changes
| Before | After |
|---|---|
| Unfinished form saved only when the email is valid AND the $3,000 answer is a Yes. | Saved as soon as the email is valid, whatever else is filled in. Recovery email always, recovery text only when a valid phone was typed (the consent line is directly under the phone field). |
| Sent once per email. | Sent again whenever anything on the form changes (phone, answers, ...). n8n updates the one row (never a second row). |
| "Not right now": nothing sent. | "Not right now" is sent too: n8n cancels any armed follow-up (row suppressed, reason `not_right_now`) and arms nothing. A later change back to Yes re-arms the same row. |
| Booking or Submit cancels/moves the follow-up. | Unchanged. |

## Where
- Page script: `src/pages/doctors.astro` (`maybeSendPartial`).
- n8n "Sales - Doctors Partial Lead Capture" (`8nq6jGbpmCDZxnQz`): version "Match own row by email only". Edited as a DRAFT, **not published**. Changed nodes: `Authenticate + Normalize`, `Decide Insert`; new nodes `Update Existing?`, `Update Row`, `Respond Updated`, `Cancel Existing?`, `Cancel Row`, `Respond Cancelled`. `Qualified Lead?` is unchanged but now passes every lead with a valid email.
- Supabase `doctors-partial-capture`: not changed (passes every field through).

## Go-live order
1. Publish the n8n draft first. It is safe with the old page too.
2. Merge this pull request.

## Undo
- Page: revert the merge commit.
- n8n: restore version `0aa042b8` ("Accept the $3,000 question answers") from Version history.

## Decisions to know about
- Timer (owner decision 2026-10-11): the first follow-up is due 20 minutes after the visitor's LAST change to the form. Every save (any field changing) pushes the due time back. n8n starts the sender 21 minutes after every save, so the last save finds its row due; earlier ones find it not due and do nothing. Cost: about one short n8n run per save. The hourly sender stays as the safety net. Submit moves the row out as before.
- A visitor who fixes a mistyped email: the page cancels the follow-up armed for the old address, then sends the new one.
- Update and cancel only touch the row with the SAME email. A first test run cancelled a different lead that shared a phone number; fixed before this was written up.
- The row's `updated_at` is not touched by an update, because the dispatcher reads a row touched more than a minute after capture as "reached the calendar".
- Row 203 (sms_consent sent "yes", stored "no") is by design: n8n stores consent only with a valid phone, and that lead typed none.

## Tests
`scripts/browser/doctors-early-capture.test.mjs` (page, fully mocked, nothing leaves the machine); `doctors-price-question.test.mjs` updated for the cancel notice.

## Wording (NOT changed, proposal only)
The sender (`Sales - Booking Recovery Dispatch`) says this to a doctor lead today, whether or not they submitted:
- Email, subject "your application": "Hi NAME, Kasper here from Synchro Social. I saw your application come through, but it looks like you didn't get to pick a time. Is there anything I should know about your practice before we talk? You can grab any slot that suits you here: <iClosed link>?fu=re  Kasper"
- Text: "Hey NAME, it's Kasper from Synchro Social. Just got your application. Is there anything I should know about your practice before we talk? If it's easier, you can grab a time here: <iClosed link>?fu=rt  Oh, and if you'd rather not get texts from me, just reply STOP."

For someone who left before submitting both are wrong ("application", "pick a time"). Proposal for those leads only (a doctors partial row whose `raw` has no `instant_sent_at`); submitters keep the text above:
- Email, subject "finish your application": "Hi NAME, Kasper here from Synchro Social. You started an application on our doctors page but didn't get to finish it. Is there anything I should know about your practice? You can pick up where you left off here: https://synchrosocial.com/doctors?fu=ue  Kasper"
- Text: "Hey NAME, it's Kasper from Synchro Social. Looks like you started applying but didn't get to finish. You can pick up where you left off here: https://synchrosocial.com/doctors?fu=ut  Oh, and if you'd rather not get texts from me, just reply STOP."

## Confirming a real text goes out
The made-up test phone sits in an October 9 test row marked booked, so the sender treats it as "already booked" until about 8 November. At go-live: publish the n8n draft, then post ONE test lead with the owner's own number, a +test email and utm_source=test straight to the webhook (the page cannot be used before the merge, the relay only accepts synchrosocial.com). The text arrives labelled "[TEST - internal, please ignore]". Tell Kasper first: he gets a Telegram alert for it. Then merge.
