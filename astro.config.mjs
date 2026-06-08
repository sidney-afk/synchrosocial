// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages on the TEST subdomain test.synchrosocial.com, so the
// live synchrosocial.com (still on Framer) stays untouched while we build.
// The custom domain (see public/CNAME) serves from the root, so `base` is '/'.
// When you're ready to cut the real domain over, change the CNAME + `site` to
// synchrosocial.com and point DNS at GitHub Pages.
export default defineConfig({
  site: 'https://test.synchrosocial.com',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
