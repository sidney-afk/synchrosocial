# Meta Ads Tracking — Deep Research Findings (2026-07-08)

> Output of a deep-research pass (23 sources fetched, 114 claims extracted,
> top 25 adversarially verified: 23 confirmed, 0 refuted, 2 unverified).
> These findings drove the architecture in `README.md`. Confidence notes and
> sources inline. Re-verify anything marked ⚠️ before relying on it —
> Meta's tooling changes fast (they shipped one-click "Meta-enabled CAPI"
> in April 2026).

## Field-test update from our account (2026-07-08)

The native iClosed Meta Pixel integration was connected to dataset
`4309835332571875` with Conversion API enabled. iClosed shows trigger activity
for Page View, Potential, Qualified, and Call booked; Meta Test Events receives
`Potential`, `Qualified`, and `invitee_meeting_scheduled`.

However, Meta currently labels those events as `Received From: Browser` and
`Setup Method: Manual Setup`, not `Server` / `Conversions API`. Treat the
server-to-server part of iClosed's integration as **not confirmed for this
account** until either:

- iClosed support confirms how their CAPI events appear in Meta and whether
  they pass `test_event_code`, or
- Events Manager later shows Server / Conversions API / Browser and Server for
  these events.

Dataset Quality API was enabled during Meta's token generation flow. Meta's UI
states that opt-out is unavailable once configured. That is not a blocker and
does not by itself prove CAPI delivery.

## Confirmed findings (all 3-0 verifier votes unless noted)

### Pixel & datasets
- **Datasets replaced pixels as the container object; the dataset ID IS the
  pixel ID.** Our `fbq('init','4309835332571875')` is correct. The base
  snippet is unchanged by the transition.
  ([Meta help 898185560232180](https://www.facebook.com/business/help/898185560232180))
- **Base code in the shared layout `<head>` satisfies the "every page"
  requirement** — exactly what `src/components/MetaPixel.astro` does.
  ([Meta help 952192354843755](https://www.facebook.com/business/help/952192354843755),
  [developers.facebook.com/docs/meta-pixel/get-started](https://developers.facebook.com/docs/meta-pixel/get-started))
- **Pixel-only launch is officially sanctioned** ("Meta Pixel only" is a
  setup option in Events Manager). CAPI is recommended, not required —
  practitioner data puts pixel-only at ~17.8% worse cost-per-result, and
  pixel-only misses iOS opt-out users. So: launch pixel-first, add CAPI fast.

### Aggregated Event Measurement — GONE as a task
- The 8-events-per-domain prioritization was **eliminated**; the AEM tab was
  **removed** from Events Manager; no conversion-domain selection at campaign
  creation. AEM still processes iOS traffic automatically — zero setup needed.
  ([Meta help 721422165168355](https://www.facebook.com/business/help/721422165168355))
- **Domain verification is NOT required for events to process.** Still worth
  doing for link-preview/edit permissions (runbook step A3), but it does not
  block launch. ⚠️ (secondary claims about the three verification methods
  went unverified due to verifier quota — the methods are meta-tag / HTML
  file / DNS TXT per Meta help 286768115176155.)

### Conversions API without a server
- **Meta's CAPI Gateway is NOT serverless** — it requires self-provisioning
  a paid cloud instance (AWS EKS / ECS / GCP, ~$10–400+/mo). Not for us.
  ([Gateway docs](https://developers.facebook.com/documentation/ads-commerce/gateway-products/conversions-api-gateway))
- Stape hosts the Gateway at **$10/mo per pixel** — the fallback option if
  needed, but iClosed makes it unnecessary (below).
- **iClosed has a native Meta CAPI integration** (docs updated Feb 2026):
  paste the **dataset ID + a CAPI access token** (generated in Events Manager
  → Settings → "Set up manually" → Generate access token) into iClosed →
  Integrations → Meta Pixel. iClosed then sends **server-to-server events
  from its own infrastructure** as the lead moves through the booking form:
  `Page view`, `Potential`, `Qualified`, `Disqualified`, `Call booked`.
  Payloads include SHA256-hashed email + phone, external_id, client IP,
  user agent, and **fbp/fbc (fbc derived from fbclid)** — strong matching.
  Plan limits: 1 pixel on Startup, 5 on Business/Enterprise.
  ([iClosed Meta Pixel doc](https://docs.iclosed.io/en/articles/10248143-meta-pixel),
  [iClosed CAPI doc](https://docs.iclosed.io/en/articles/10255683-iclosed-meta-pixel-conversion-api-direct-integration))
  - ⚠️ **Caveat:** these arrive as **custom events** (e.g.
    `invitee_meeting_scheduled`), not Meta standard events — to optimize a
    campaign on them you first wrap them in a **custom conversion** in
    Events Manager.
- **The embedded widget posts booking-lifecycle messages to the parent page**
  (documented in iClosed's GTM guide, May 2026): `iclosed.potential`,
  `iclosed.qualified`, `iclosed.disqualified`, `iclosed.call_scheduled` —
  which is exactly what our `IClosedEmbed.astro` bridge listens for. Quirk:
  `potential` can fire twice when the form collects both email and phone.
  ([iClosed GTM doc](https://docs.iclosed.io/en/articles/10420617-google-tag-manager))

### Deduplication
- Meta dedupes on **event_name + event_id within a 48h window** (user
  identifiers are not used for dedup). Same-name events WITHOUT matching IDs
  double-count; different-name events never dedupe.
- iClosed's CAPI events carry their own event_id and dedupe against
  iClosed's own paired browser events. **Our site-fired `Schedule`/`Lead`
  will NOT collide with iClosed's CAPI custom events** (different names) —
  they are two parallel streams. Point campaign optimization at exactly ONE.

### Conversion tracking on /thank-you
- Two zero-server options, both valid: fire `fbq('track', …)` on page load
  (what we do), and/or a **zero-code custom conversion** in Events Manager
  with a URL-contains-`/thank-you` rule riding on PageView (good backstop;
  100 custom conversions per ad account limit).

### Advanced matching
- Manual advanced matching = passing `em/ph/fn/ln/…` into `fbq('init')`;
  the pixel normalizes + SHA-256 hashes client-side. Our booking form is
  inside iClosed's iframe, so the parent page has no PII → **manual AM is
  not applicable browser-side**; iClosed's CAPI covers matching instead.
  Enable **Automatic Advanced Matching** in Events Manager settings anyway
  (harmless, free).
  ([Advanced matching docs](https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching/))

## NOT settled by research (treat as open)

1. **HubSpot free tier ↔ Meta**: HubSpot has a native Meta-CAPI conversion
   sync ([knowledge base article](https://knowledge.hubspot.com/ads/create-and-sync-ad-conversion-events-with-your-meta-ads-accounts-using-metas-conversion-api))
   and lead syncing, but whether the FREE tier includes them was not
   verified. Our n8n relay is the proven fallback for CRM→Meta offline
   events either way.
2. **Whether iClosed's /thank-you redirect appends query params** (email
   etc.) usable for advanced matching — check empirically with a test
   booking (runbook C3).
3. **Schedule vs Lead optimization semantics** — no verified evidence that
   Meta's delivery system treats one better; we fire both (identical
   moment/IDs prefixed apart) and let Ads Manager choose. Also unverified:
   whether custom-conversion goals (for iClosed's `Call booked`) get parity
   with standard events in delivery.
4. **The current Diagnostics warning** on the dataset — read it in Events
   Manager once events flow; likely "no recent activity".

## Stats
- 5 search angles → 23 sources (8 primary/official) → 114 claims → 25
  verified (3 independent adversarial votes each): 23 confirmed, 2
  unverified (verifier quota), 0 refuted.
