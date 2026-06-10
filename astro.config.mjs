// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages on the live domain synchrosocial.com (see
// public/CNAME). The custom domain serves from the root, so `base` is '/'.
export default defineConfig({
  site: 'https://synchrosocial.com',
  base: '/',
  redirects: {
    // The new homepage lived at /v2 during the test phase — keep old links alive.
    '/v2': '/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
