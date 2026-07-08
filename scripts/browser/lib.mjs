// Shared Playwright launch helpers for headless rendering in this cloud env.
// Chromium is pointed at the local TLS-bridge relay (scripts/browser/relay.cjs),
// which must be running first. See docs/headless-browser-in-this-env.md.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Playwright is preinstalled globally in this environment (not a repo dep).
function loadPlaywright() {
  const candidates = ['playwright', '/opt/node22/lib/node_modules/playwright'];
  for (const c of candidates) {
    try { return require(c); } catch {}
  }
  throw new Error('playwright not found. It is preinstalled globally here at ' +
    '/opt/node22/lib/node_modules/playwright — check that path, or `npm i -D playwright`.');
}
export const { chromium } = loadPlaywright();

// A real Chrome UA (some sites gate on headless UAs).
export const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const RELAY_PORT = process.env.RELAY_PORT || '8899';
export const RELAY = `http://127.0.0.1:${RELAY_PORT}`;

export async function launch() {
  return chromium.launch({
    headless: true,
    // --no-sandbox: required running as root. --ignore-certificate-errors:
    // accept the relay's self-signed cert (and any origin cert).
    args: ['--no-sandbox', '--ignore-certificate-errors'],
    proxy: { server: RELAY }, // route ALL traffic (incl. localhost) via the relay
  });
}

export async function newCtx(browser, width = 1440, height = 1000) {
  return browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: UA,
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
}
