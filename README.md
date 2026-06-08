# Synchro Social

The Synchro Social website, rebuilt from Framer into clean, maintainable code.

- **Framework:** [Astro](https://astro.build/) (static site, no build headaches)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) — responsive by default, one source of truth for the design
- **Hosting:** GitHub Pages (auto-deploys on every push to `main`)
- **Test domain:** `test.synchrosocial.com` (the live `synchrosocial.com` stays on Framer until you cut over)

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
| `/` | `src/pages/index.astro` | Homepage (hero, clients, approach, stats, team, booking) |
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
- **Reusable pieces:** `src/components/` (logo, buttons, footer, video & Calendly
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

- **Calendly:** home `kasper-synchro/demo`, onboarding step 3
  `kasper-synchro/strategy-session`, AI `kasper-synchro/ai`.
- **Onboarding videos:** YouTube (steps 1–3) + Vimeo (final word) on the main
  funnel; AI funnel videos are placeholders until you provide them.
- **Forms:** main onboarding → Notion; AI onboarding → JotForm.

---

## Deploying to GitHub Pages

1. In the repo, go to **Settings → Pages** and set **Source = GitHub Actions**.
2. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually). The
   workflow in `.github/workflows/deploy.yml` builds and publishes automatically.
3. **Custom domain:** `public/CNAME` is set to `test.synchrosocial.com`. Add a
   DNS `CNAME` record pointing `test` → `<your-github-username>.github.io`.
4. When you're ready to replace the live Framer site, change `public/CNAME` and
   `site` in `astro.config.mjs` to `synchrosocial.com`, then repoint that DNS
   record to GitHub Pages.
