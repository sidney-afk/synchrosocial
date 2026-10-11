# /doctors: save an unfinished form as soon as the email is valid

**DO NOT MERGE before Tuesday 13 October 2026, 9:33 am Costa Rica time, and not before Kasper approves.**
Merging this pull request deploys the page to the live site.

## What changes
| Before | After |
|---|---|
| Unfinished form saved only when the email is valid AND the $3,000 answer is a Yes. | Saved as soon as the email is valid, whatever else is filled in. Recovery email always, recovery text only when a valid phone was typed (the consent line is directly under the phone field). |
| Sent once per email. | Sent again when the phone or the $3,000 answer changes. n8n updates the one row (never a second row). |
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
- The follow-up timer is still 5 minutes from the first save. Because the first save is now earlier, a visitor still filling the form after 5 minutes can get the recovery email. Submit moves it out as before.
- Update and cancel only touch the row with the SAME email. A first test run cancelled a different lead that shared a phone number; fixed before this was written up.
- The row's `updated_at` is not touched by an update, because the dispatcher reads a row touched more than a minute after capture as "reached the calendar".
- Row 203 (sms_consent sent "yes", stored "no") is by design: n8n stores consent only with a valid phone, and that lead typed none.

## Tests
`scripts/browser/doctors-early-capture.test.mjs` (page, fully mocked, nothing leaves the machine); `doctors-price-question.test.mjs` updated for the cancel notice.
