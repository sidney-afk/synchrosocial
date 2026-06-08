// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages on the custom domain synchrosocial.com.
// Because we use a custom domain (see public/CNAME), the site lives at the
// root, so `base` stays '/'. If you ever host this at
// https://<user>.github.io/synchrosocial/ instead, set base to '/synchrosocial'.
export default defineConfig({
  site: 'https://synchrosocial.com',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
