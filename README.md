# Synchro Social

The Synchro Social website, rebuilt from Framer into clean, maintainable code.

- **Framework:** [Astro](https://astro.build/) (static site, no build headaches)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) — responsive by default, one source of truth for the design
- **Hosting:** GitHub Pages (auto-deploys on pushes to the branches listed in `.github/workflows/deploy.yml`)
- **Domain:** `synchrosocial.com` (cut over from Framer — see "Going live" below)

---

## Running it locally

```bash
npm install      # first time only (takes a few minutes)
npm run dev      # start the dev server → http://localhost:4321
npm run build    # produce the static site in dist/
npm run preview  # preview the built site
```

---

## Page map

Two funnels share one codebase. URLs match the original Framer paths exactly.

### Main site — purple theme
| URL | File | What it is |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Homepage (formerly `/v2`; `/v2` now redirects here) |
| `/apply` | `src/pages/apply.astro` | Apply funnel — booking + case studies with reels |
| `/event` | `src/pages/event.astro` | Hub page for Kasper's AI events |
| `/ai-invite/` | `public/ai-invite/` | Static AI invite page + scheduling pages (iClosed) |
| `/onboarding` | `src/pages/onboarding.astro` | Onboarding step 1/4 — What To Expect |
| `/onboarding_step2` | `src/pages/onboarding_step2.astro` | Step 2/4 — Complete This Form |
| `/onboarding_step3` | `src/pages/onboarding_step3.astro` | Step 3/4 — Strategy Session |
| `/onboarding_step4` | `src/pages/onboarding_step4.astro` | Step 4/4 — Final Words |
| `/thank-you` | `src/pages/thank-you.astro` | "You're Booked!" confirmation |

### AI funnel — coral theme
| URL | File | What it is |
| --- | --- | --- |
| `/ai` | `src/pages/ai.astro` | AI clone landing page (sales letter) |
| `/call` | `src/pages/call.astro` | Book the AI intro call |
| `/ai_onboarding` | `src/pages/ai_onboarding.astro` | AI onboarding step 1/4 |
| `/ai_onboarding_step2…4` | `src/pages/ai_onboarding_step*.astro` | AI onboarding steps 2–4 |

### Shared
| URL | File |
| --- | --- |
| `/privacypolicy` | `src/pages/privacypolicy.astro` |
| `/terms-conditions` | `src/pages/terms-conditions.astro` |
| `/404` | `src/pages/404.astro` |

---

## Editing content

- **Copy / text:** edit the relevant `src/pages/*.astro` file. Repeated data
  (client list, team, approach steps) lives in arrays at the top of
  `src/pages/index.astro`.
- **Brand colors & fonts:** `src/styles/global.css` — change a value once and it
  updates everywhere. `brand` = purple (main), `coral` = rose (AI funnel).
- **Reusable pieces:** `src/components/` (logo, buttons, footer, video & iClosed
  embeds, onboarding step shell).

## Swapping in real images

Photos currently render as polished initials-on-gradient placeholders so nothing
looks broken. To use real photos:

1. Drop the file into `public/images/` (e.g. `public/images/danny-morel.jpg`).
2. In `src/pages/index.astro`, set that person's `img` field, e.g.
   `{ name: "Danny Morel", followers: "1.5M+", img: "/images/danny-morel.jpg" }`.

The same applies to the team grid. See `public/images/README.md` for the full
list of images to provide.

## Integrations (already wired)

- **iClosed:** all booking runs on iClosed (`app.iclosed.io`). By page:
  `/apply` + `/call` → `synchrosocial/vsl-funnel`; `/onboarding_step3` →
  `synchrosocial/strategy-session`; `/ai_onboarding_step3` →
  `synchrosocial/ai-clone-consultation`; events/clients (`/event`,
  `/ai-invite/schedule-clients`, `/old`) → `synchrosocial/demo`; investors
  (`/ai-invite/schedule-investors`) → `synchrosocial/1-1-call-with-kasper`.
  Full picture in `docs/ECOSYSTEM_MAP.md`.
- **Onboarding videos:** YouTube (steps 1–3) + Vimeo (final word) on the main
  funnel; AI funnel videos are placeholders until you provide them.
- **Forms:** main onboarding → Notion; AI onboarding → JotForm.

---

## Deploying to GitHub Pages

1. In the repo, go to **Settings → Pages** and set **Source = GitHub Actions**.
2. Push to a branch listed in `.github/workflows/deploy.yml` (or run the
   "Deploy to GitHub Pages" workflow manually). It builds and publishes
   automatically — the most recent push wins.

## Going live on synchrosocial.com (cutover from Framer)

The code is already configured for the live domain (`public/CNAME` and `site`
in `astro.config.mjs` are `synchrosocial.com`). The remaining steps happen
outside this repo:

1. **Framer:** Site Settings → Domains → disconnect/remove `synchrosocial.com`.
2. **Namecheap** (DNS for synchrosocial.com): remove Framer's records for `@`
   (A `76.76.21.21` / CNAME to framer) and add:
   - Four **A records** for `@`: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - A **CNAME record** `www` → `sidney-afk.github.io`
3. **GitHub:** repo **Settings → Pages → Custom domain** → change
   `test.synchrosocial.com` to `synchrosocial.com`, then tick
   **Enforce HTTPS** once the certificate is issued (can take up to an hour).
