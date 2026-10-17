# meta-capi-relay (written 2026-10-17, NOT deployed)

Server copy (Conversions API) of the site's early browser events: `PageView`,
`ViewContent`, `DoctorEmailEntered`, and the /doctors `Lead`. The browser sends
each event to the pixel and posts the same event here with the same `event_id`,
the full page URL, `fbc` and `fbp`. This function adds the visitor's IP and
browser from the request and forwards it to Meta. Meta keeps one of the pair.

- `build.mjs`: all the checks and the Meta payload (tested by
  `scripts/meta-capi-relay.test.mjs`, run with `node scripts/meta-capi-relay.test.mjs`).
- `index.ts`: the Supabase wrapper (CORS, origin check, token from secrets).

What it refuses: other event names, URLs not on synchrosocial.com, visits whose
URL has `utm_source` = test / referral / outbound_dm, posts from other origins.
It never receives an email, phone or name (the page does not send them, and
`iclosedEmail`/`iclosedPhone`/`iclosedName`/`email`/`phone`/`name` are stripped
from the URL anyway).

## Switching it on (Sidney, about 10 minutes)

1. Events Manager > dataset "Synchro Social Data" > Settings > Conversions API >
   generate an access token (a fresh one: the July token was exposed, see README §9).
2. Supabase project "syncview-calendar" > Edge Functions > deploy this folder as
   `meta-capi-relay` with "Verify JWT" OFF (the site has no login), then add
   secret `META_CAPI_TOKEN`. For a first check also add `META_TEST_EVENT_CODE`
   (the code shown in Events Manager > Test events) and remove it after.
3. Paste `https://<project>.supabase.co/functions/v1/meta-capi-relay` into
   `CAPI_RELAY_URL` in `src/components/MetaPixel.astro` (the last pair of quotes on that line) and merge. Until then
   the site sends browser events only, exactly as before this change.

Volume: one call per page view and per funnel event; well inside Supabase's
free invocation allowance at current traffic.
