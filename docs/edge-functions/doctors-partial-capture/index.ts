// REFERENCE COPY. NOT DEPLOYED FROM HERE.
// Saved 2026-10-09 from the live Supabase function (project "syncview-calendar",
// slug doctors-partial-capture, version 11) so its logic is on record. The function itself
// was not changed. One edit only: the shared secret on the N8N_SECRET line is replaced with
// a placeholder because this repo is public. Everything else is as deployed, apart from line
// endings (the deployed file uses Windows CRLF, this copy uses LF).
// See ./README.md.

// Supabase Edge Function: doctors-partial-capture
//
// Relay for the /doctors page. When a visitor has filled the step-1 form (valid
// email + a qualifying monthly investment) but has NOT pressed submit, the page
// posts what they typed here. We check it lightly and forward it to the n8n
// workflow "Sales - Doctors Partial Lead Capture", which arms a recovery row in
// booking_recovery. The row is email-only unless the page sends sms_consent =
// "yes" (the step-1 form shows an SMS consent line under the phone field, added
// 2026-10-01); n8n only allows a text when that flag is present.
//
// Why this exists instead of calling n8n straight from the browser: the n8n
// webhook needs a secret, and anything in page source is public. The secret
// lives here, server-side.
//
// Deliberately basic (owner decision 2026-09-30): origin allow-list, size cap,
// shape checks, a honeypot pass-through. No database, no rate-limit table.
// n8n also refuses anyone already pending or seen in the last 30 days, and the
// dispatcher sends at most 5 leads per hourly run, which bounds abuse.

const N8N_URL = "https://synchrosocial.app.n8n.cloud/webhook/doctors-partial-capture";
const N8N_SUBMIT_URL = "https://synchrosocial.app.n8n.cloud/webhook/doctors-submit-instant";
const N8N_SECRET = "REDACTED-in-this-public-copy-see-the-deployed-function";
const ALLOWED_ORIGINS = ["https://synchrosocial.com", "https://www.synchrosocial.com"];
const MAX_BODY_BYTES = 4096;

function corsFor(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}

function json(obj: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsFor(origin), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsFor(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, origin);

  // Browsers always send Origin on cross-site POSTs. Anything else is not our page.
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return json({ ok: false, error: "origin" }, 403, origin);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "too_large" }, 413, origin);

  let body: Record<string, unknown> | null = null;
  try {
    body = JSON.parse(raw);
  } catch (_e) {
    body = null;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "invalid_body" }, 400, origin);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400, origin);
  }

  // Only forward known fields, as short strings.
  const FIELDS = [
    "name", "email", "phone", "instagram", "specialty", "investment", "start", "timezone",
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "referrer", "website",
    "sms_consent", "submitted",
  ];
  const out: Record<string, string> = {};
  for (const f of FIELDS) {
    const v = (body as Record<string, unknown>)[f];
    if (typeof v === "string" && v.trim()) out[f] = v.trim().slice(0, 300);
  }

  try {
    // submitted=yes means they pressed Submit (reached the calendar): that goes to the
    // instant booking-link workflow instead of the partial-lead capture one.
    const target = out.submitted === "yes" ? N8N_SUBMIT_URL : N8N_URL;
    const res = await fetch(`${target}?secret=${encodeURIComponent(N8N_SECRET)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(out),
      signal: AbortSignal.timeout(8000),
    });
    // Never leak n8n's answer to the browser; the page does not need it.
    return json({ ok: res.ok }, res.ok ? 200 : 502, origin);
  } catch (_e) {
    return json({ ok: false, error: "upstream" }, 502, origin);
  }
});
