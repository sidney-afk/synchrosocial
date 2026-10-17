// meta-capi-relay — Supabase edge function (NOT DEPLOYED YET, see README.md).
//
// The browser (src/components/MetaPixel.astro, window.__metaTrack) posts one
// event here right after it fires the same event in the pixel, with the same
// event_id. This function adds the visitor's IP and browser (from the request),
// checks the event, and forwards it to Meta's Conversions API. Meta counts the
// browser copy and this server copy once (same event name + event_id).
//
// Secrets (Supabase > Edge Functions > Secrets), never in code:
//   META_CAPI_TOKEN        Conversions API access token for dataset 4309835332571875
//   META_TEST_EVENT_CODE   optional; when set, events go to Events Manager > Test events only
import { buildEvent } from "./build.mjs";

const DATASET = "4309835332571875";
const GRAPH = `https://graph.facebook.com/v21.0/${DATASET}/events`;
const ALLOWED_ORIGINS = ["https://synchrosocial.com", "https://www.synchrosocial.com"];
const MAX_BODY_BYTES = 4096;

function cors(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}
const reply = (obj: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply({ ok: false, error: "method" }, 405, origin);
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return reply({ ok: false, error: "origin" }, 403, origin);

  const token = Deno.env.get("META_CAPI_TOKEN") || "";
  if (!token) return reply({ ok: false, error: "not_configured" }, 503, origin);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return reply({ ok: false, error: "too_large" }, 413, origin);
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch (_e) { body = null; }

  const built = buildEvent(body as Record<string, unknown>, {
    ip: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "",
    userAgent: req.headers.get("user-agent") || "",
  });
  if (!built.ok) return reply({ ok: true, sent: false, reason: built.reason }, 200, origin);

  const payload: Record<string, unknown> = { data: [built.event] };
  const testCode = Deno.env.get("META_TEST_EVENT_CODE");
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(`${GRAPH}?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return reply({ ok: res.ok, sent: res.ok }, res.ok ? 200 : 502, origin);
  } catch (_e) {
    return reply({ ok: false, error: "upstream" }, 502, origin);
  }
});
