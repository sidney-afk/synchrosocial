// Pure logic for the meta-capi-relay edge function: turns one browser event
// into one Conversions API event, or explains why it was dropped.
// Plain JavaScript so the same file runs in Supabase (Deno) and in the Node
// test (scripts/meta-capi-relay.test.mjs).

export const ALLOWED_EVENTS = ["PageView", "ViewContent", "DoctorEmailEntered", "Lead"];
export const CUSTOM_EVENTS = ["DoctorEmailEntered"];
const ALLOWED_HOSTS = ["synchrosocial.com", "www.synchrosocial.com"];
// Same rule as src/components/MetaPixel.astro and the n8n CAPI workflow.
const TEST_SOURCE = /(^|[^a-z0-9])test([^a-z0-9]|$)/i;
const EXCLUDED_SOURCE = /^(referral|outbound_dm)$/i;
const PII_PARAMS = ["iclosedEmail", "iclosedPhone", "iclosedName", "email", "phone", "name"];
const FB_ID = /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_\-.]{1,400}$/;

const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * @param {Record<string, unknown>} body  what the page posted
 * @param {{ ip?: string, userAgent?: string, now?: number }} req  request facts
 * @returns {{ ok: true, event: object } | { ok: false, reason: string }}
 */
export function buildEvent(body, req = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, reason: "invalid_body" };
  const name = str(body.event_name, 50);
  if (!ALLOWED_EVENTS.includes(name)) return { ok: false, reason: "event_not_allowed" };
  const eventId = str(body.event_id, 100);
  if (!eventId) return { ok: false, reason: "no_event_id" };

  let url;
  try { url = new URL(str(body.event_source_url, 2000)); } catch (_e) { return { ok: false, reason: "bad_url" }; }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.includes(url.hostname)) return { ok: false, reason: "foreign_url" };
  const src = String(url.searchParams.get("utm_source") || "").trim();
  if (TEST_SOURCE.test(src) || EXCLUDED_SOURCE.test(src)) return { ok: false, reason: "excluded_source" };
  for (const k of PII_PARAMS) url.searchParams.delete(k);
  url.hash = "";

  const now = Math.floor((req.now ?? Date.now()) / 1000);
  let t = Number(body.event_time);
  // Meta rejects events older than 7 days or in the future; clamp to "now" when off.
  if (!Number.isFinite(t) || t > now + 60 || t < now - 7 * 86400) t = now;

  const userData = {};
  const fbc = str(body.fbc, 500);
  const fbp = str(body.fbp, 500);
  if (FB_ID.test(fbc)) userData.fbc = fbc;
  if (FB_ID.test(fbp)) userData.fbp = fbp;
  if (req.ip) userData.client_ip_address = String(req.ip).split(",")[0].trim();
  if (req.userAgent) userData.client_user_agent = String(req.userAgent).slice(0, 500);
  if (!userData.client_user_agent) return { ok: false, reason: "no_user_agent" }; // required for website events

  const customData = {};
  const cd = body.custom_data && typeof body.custom_data === "object" ? body.custom_data : {};
  const contentName = str(cd.content_name, 100);
  if (contentName) customData.content_name = contentName;

  const event = {
    event_name: name,
    event_time: Math.floor(t),
    event_id: eventId,
    action_source: "website",
    event_source_url: url.toString(),
    user_data: userData,
  };
  if (Object.keys(customData).length) event.custom_data = customData;
  return { ok: true, event };
}
