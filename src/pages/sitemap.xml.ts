import { SITE_LIVE, SITE_PAGES } from "../data/studio.js";

// Lists the company site's pages once it is live. Before launch it lists only the homepage.
export function GET() {
  const pages = SITE_LIVE ? SITE_PAGES : [""];
  const urls = pages.map((p) => `<url><loc>https://synchrosocial.com/${p}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml" } });
}
