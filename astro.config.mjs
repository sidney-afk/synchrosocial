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
    // The two VSL landing pages shipped as /danny_vsl and /baya_vsl and were
    // renamed to /apply2 and /apply3 on 2026-08-28. Both went out on paid
    // traffic under the old paths, so these must stay for as long as any ad,
    // link or QR code can still point at them.
    '/danny_vsl': '/apply2',
    '/baya_vsl': '/apply3',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
