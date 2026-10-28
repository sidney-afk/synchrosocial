// Unit test for the Conversions API relay's event builder (no network).
//   node scripts/meta-capi-relay.test.mjs
import { buildEvent } from "../docs/edge-functions/meta-capi-relay/build.mjs";

let failures = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) failures++; };
const NOW = Date.UTC(2026, 9, 17, 12) ; // fixed clock
const req = { ip: "203.0.113.7, 10.0.0.1", userAgent: "Mozilla/5.0 test", now: NOW };
const base = {
  event_name: "PageView", event_id: "abc-123", event_time: Math.floor(NOW / 1000),
  event_source_url: "https://synchrosocial.com/doctors/?utm_source=facebook&fbclid=IwAR1&iclosedEmail=a%40b.com",
  fbc: "fb.1.1760700000000.IwAR1", fbp: "fb.1.1760700000000.1234567890",
  custom_data: { content_name: "doctor_offer", email: "x@y.com" },
};

let r = buildEvent(base, req);
ok(r.ok, "valid PageView is accepted");
console.log(JSON.stringify(r.event, null, 2));
ok(r.event.event_source_url === "https://synchrosocial.com/doctors/?utm_source=facebook&fbclid=IwAR1", "full URL with path kept, iclosedEmail stripped");
ok(r.event.event_id === "abc-123", "event_id passed through for dedup with the browser copy");
ok(r.event.user_data.fbc === base.fbc && r.event.user_data.fbp === base.fbp, "fbc and fbp carried");
ok(r.event.user_data.client_ip_address === "203.0.113.7", "first IP of x-forwarded-for used");
ok(r.event.action_source === "website", "action_source website");
ok(r.event.custom_data.content_name === "doctor_offer" && !("email" in r.event.custom_data), "only content_name kept in custom_data");

r = buildEvent({ ...base, event_name: "DoctorEmailEntered" }, req);
ok(r.ok && r.event.event_name === "DoctorEmailEntered", "DoctorEmailEntered accepted");
r = buildEvent({ ...base, event_name: "DoctorQualified" }, req);
ok(r.ok && r.event.event_name === "DoctorQualified", "DoctorQualified accepted");
for (const s of ["test", "my-test-1", "referral", "outbound_dm", "Outbound_DM"]) {
  r = buildEvent({ ...base, event_source_url: `https://synchrosocial.com/doctors/?utm_source=${s}` }, req);
  ok(!r.ok && r.reason === "excluded_source", `utm_source=${s} is never sent`);
}
r = buildEvent({ ...base, event_source_url: "https://synchrosocial.com/?utm_source=latest" }, req);
ok(r.ok, "utm_source=latest is not a test");
r = buildEvent({ ...base, event_name: "Purchase" }, req);
ok(!r.ok && r.reason === "event_not_allowed", "unknown event refused");
r = buildEvent({ ...base, event_source_url: "https://evil.example/doctors" }, req);
ok(!r.ok && r.reason === "foreign_url", "foreign URL refused");
r = buildEvent({ ...base, event_id: "" }, req);
ok(!r.ok, "missing event_id refused");
r = buildEvent({ ...base, fbc: "garbage", fbp: "" }, req);
ok(r.ok && !r.event.user_data.fbc && !r.event.user_data.fbp, "malformed fbc dropped, event still sent");
r = buildEvent({ ...base, event_time: 1 }, req);
ok(r.ok && r.event.event_time === Math.floor(NOW / 1000), "stale event_time clamped to now");
r = buildEvent(base, { ...req, userAgent: "" });
ok(!r.ok && r.reason === "no_user_agent", "no user agent refused (Meta requires it)");

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
