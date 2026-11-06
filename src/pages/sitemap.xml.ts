import { SITE_LIVE, SITE_PAGES } from "../data/studio.js";

// Lists the company site's pages. Pages that are hidden from search (the funnel,
// thank-you and legacy pages) are left out on purpose.
const LASTMOD = "2026-11-06";
export function GET() {
  const pages = SITE_LIVE ? SITE_PAGES : [""];
  const urls = pages
    .map((p) => `<url><loc>https://synchrosocial.com/${p}</loc><lastmod>${LASTMOD}</lastmod></url>`)
    .join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml" } });
}
