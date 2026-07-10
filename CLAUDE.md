# Synchro Social website — session context

Astro 5 + Tailwind 4 static site, deployed to synchrosocial.com via GitHub
Pages (pushes to `main` auto-deploy the LIVE site — see
`.github/workflows/deploy.yml`). `README.md` has the page map and editing
guide.

## Key docs — read before working on the related area

- **`docs/CLIENT_LIFECYCLE_MAP.md`** — the master map of the entire client
  lifecycle: traffic → booking → nurture → sales close → contract/invoice →
  onboarding → provisioning → samples → production. Includes the full n8n
  workflow inventory and the cross-system relationship map. Read this to
  understand how anything connects to anything.
- **`docs/ECOSYSTEM_MAP.md`** — how every page, funnel, and iClosed booking
  calendar connects. Read this before touching any funnel/booking page.
- **`docs/meta-ads/README.md`** — the Meta ads project memory: accounts/IDs,
  tracking architecture, event map, decisions log, what's done, what remains.
  **If the task involves Meta ads, tracking, the pixel, CAPI, HubSpot, or
  conversions, read this FIRST and keep it updated** (decisions → §Decisions,
  work done → §Session log). Companion docs: `SETUP_RUNBOOK.md` (manual steps
  in Meta/iClosed/HubSpot UIs), `RESEARCH.md` (verified 2026 platform facts).
- **`docs/pixel-matching-playbook.md`** — method for rebuilding pages to
  match a reference design pixel-for-pixel.

## Conventions

- The Meta Pixel loads on every page via `src/components/MetaPixel.astro`
  (imported in `src/layouts/Layout.astro`). Conversion events are mapped in
  `docs/meta-ads/README.md` §event map — don't add/rename fbq events without
  updating that doc.
- Booking embeds use `src/components/IClosedEmbed.astro`, which also bridges
  iClosed's postMessage lifecycle events to the pixel.
- Sidney's connected tools (HubSpot, n8n at synchrosocial.app.n8n.cloud,
  Google Drive, Gmail, Slack) are reachable via MCP in Claude sessions; the
  n8n workflows are production sales automation — don't edit them without
  explicit go-ahead.
