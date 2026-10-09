# /doctors $3,000 question: plan, checklist, undo

Question: "Our service starts at $3,000 a month. Is that within reach for you right now?"
Answers: `Yes`, `Yes, but I'd like to talk it through first`, `Not right now` (only this one is turned away).

## What lives where
| Place | What it holds | Changed by |
|---|---|---|
| `src/pages/doctors.astro` | question, answers, who is turned away, the Lead rule, `PRICE_KEY` (`within-reach`) | this branch |
| iClosed, event "Doctor Strategy Call" | new single-select question (identifier `within-reach`), one disqualification rule (`Not right now`, message "We start at $3,000/mo..."), old question removed from this event only | owner via Claude in Chrome |
| n8n "Sales - Doctors Partial Lead Capture" (`8nq6jGbpmCDZxnQz`) | which answers arm a follow-up row; stored question label | published 2026-10-09, accepts new and old answers |
| n8n "Sales - Doctors Instant Booking Link" (`cM3G9REliKpwicnR`) | which answers get the booking link by email/text | published 2026-10-09, accepts new and old answers |
| Supabase `doctors-partial-capture` | passes the answer through, never reads it | not changed |
| n8n "Sales - Booking Recovery Capture (iClosed)" `src=disqualified` webhook | reads iClosed's own status, not the answer text | not changed |

## Facts from the iClosed report (2026-10-09)
- The old question is used only by Doctor Strategy Call. Social Media Consultation has its own separate question and rule.
- The iClosed Meta Pixel is turned off. n8n "Booked Call to Meta CAPI" is the only sender of Schedule.
- Nobody who picked "Under $2,000" ever reached iClosed (the page stops them), so iClosed's own rule has never fired for doctors. The page is the real gate.

## Undo
- Page: revert the merge commit of the pull request that carries this file (GitHub Pages redeploys in about 1 to 2 minutes).
- n8n: restore the previous version of each workflow from its Version history (names: "Add doctor-strategy-call to acquisition calendars" for the Meta one; the version before "Accept the $3,000 question answers" for the other two).
- iClosed: put the rule back to the old question and "Under $2,000", add the old question back to the event from the library (it is never deleted).
