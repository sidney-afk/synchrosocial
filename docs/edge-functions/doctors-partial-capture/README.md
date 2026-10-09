# doctors-partial-capture (reference copy)

Saved 2026-10-09. The live function runs in the Supabase project "syncview-calendar"
(slug `doctors-partial-capture`, version 11 at the time of saving). Nothing here deploys it.

- `index.ts` is the deployed source with one change: the secret is replaced by a placeholder
  (this repo is public). The real value is in the deployed function and in the two n8n
  webhooks it calls (`doctors-partial-capture`, `doctors-submit-instant`).
- It does not read or judge the money answer. The page's `investment` field is forwarded as
  a short string, so changing the question's answers needs no change here.
- Before 2026-10-09 no copy of this source existed in any repo (`client-analytics`
  docs/ATLAS.md says so). If it is ever redeployed from here, put the real secret back first.
