// Verifies the two date helpers copied verbatim out of the n8n code nodes.
const DEFAULT_TZ = 'America/New_York';

// ---- from 02-booking-recovery-dispatch.json "Select Due" ----
function dayOptions(from, tz) {
  const nameOf = (d) => d.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz });
  const dowOf = (d) => d.toLocaleDateString('en-US', { weekday: 'short', timeZone: tz });
  const opts = [];
  for (let i = 1; i <= 7 && opts.length < 2; i++) {
    const d = new Date(from.getTime() + i * 86400000);
    const dow = dowOf(d);
    if (dow === 'Sat' || dow === 'Sun') continue;
    opts.push(i === 1 ? 'tomorrow' : nameOf(d));
  }
  while (opts.length < 2) opts.push('later this week');
  return opts;
}

// ---- from 03-booked-confirmation-sms.json "Render Call Time" ----
function timeLabel(d, tz) {
  const s = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
  return s.replace(/\s/g, '').replace(':00', '').toLowerCase();
}
function dayKey(d, tz) { return d.toLocaleDateString('en-CA', { timeZone: tz }); }
function daysBetween(a, b, tz) {
  return Math.round((Date.parse(dayKey(b, tz) + 'T00:00:00Z') - Date.parse(dayKey(a, tz) + 'T00:00:00Z')) / 86400000);
}
function renderCall(now, start, tz) {
  const t = timeLabel(start, tz);
  const delta = daysBetween(now, start, tz);
  if (delta <= 0) return ['today at ' + t, 'later today'];
  if (delta === 1) return ['tomorrow at ' + t, 'tomorrow'];
  if (delta <= 6) {
    const wd = start.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz });
    return [wd + ' at ' + t, wd];
  }
  const dl = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz });
  return [dl + ' at ' + t, 'then'];
}

let fail = 0;
function check(label, got, want) {
  const ok = got === want;
  if (!ok) fail++;
  console.log((ok ? '  PASS ' : '  FAIL ') + label + '  got=' + JSON.stringify(got) + (ok ? '' : ' want=' + JSON.stringify(want)));
}

// --- E1/S1 day options, one per weekday. Noon ET to avoid DST edges. ---
console.log('\ndayOptions() — the table in MESSAGE_TEMPLATES.md §Date logic');
const cases = [
  ['2026-08-10', 'Monday',    'tomorrow', 'Wednesday'],
  ['2026-08-11', 'Tuesday',   'tomorrow', 'Thursday'],
  ['2026-08-12', 'Wednesday', 'tomorrow', 'Friday'],
  ['2026-08-13', 'Thursday',  'tomorrow', 'Monday'],   // Sidney's original
  ['2026-08-14', 'Friday',    'Monday',   'Tuesday'],  // the bug case — today
  ['2026-08-15', 'Saturday',  'Monday',   'Tuesday'],
  ['2026-08-16', 'Sunday',    'tomorrow', 'Tuesday'],
];
for (const [date, dow, w1, w2] of cases) {
  const [d1, d2] = dayOptions(new Date(date + 'T16:00:00Z'), DEFAULT_TZ);
  check(dow.padEnd(10) + ' -> "' + d1 + ' or ' + d2 + '"', d1 + '|' + d2, w1 + '|' + w2);
}

// --- S2 call time rendering ---
console.log('\nrenderCall() — booked confirmation');
const now = new Date('2026-08-14T16:00:00Z'); // Fri 12:00 ET
const t = [
  ['same day, 3:45pm ET',  '2026-08-14T19:45:00Z', DEFAULT_TZ, 'today at 3:45pm',      'later today'],
  ['next day, 3:45pm ET',  '2026-08-15T19:45:00Z', DEFAULT_TZ, 'tomorrow at 3:45pm',   'tomorrow'],
  ['4 days out',           '2026-08-18T19:45:00Z', DEFAULT_TZ, 'Tuesday at 3:45pm',    'Tuesday'],
  ['13 days out',          '2026-08-27T19:45:00Z', DEFAULT_TZ, 'Thu, Aug 27 at 3:45pm', 'then'],
  ['on the hour drops :00','2026-08-15T19:00:00Z', DEFAULT_TZ, 'tomorrow at 3pm',      'tomorrow'],
  ['LA lead sees LA time', '2026-08-15T19:45:00Z', 'America/Los_Angeles', 'tomorrow at 12:45pm', 'tomorrow'],
];
for (const [label, iso, tz, w1, w2] of t) {
  const [a, b] = renderCall(now, new Date(iso), tz);
  check(label.padEnd(24) + ' -> "' + a + '"', a + '|' + b, w1 + '|' + w2);
}

// --- the timezone trap this exists to prevent ---
console.log('\nthe bug this prevents');
const bookingUTC = new Date('2026-08-15T19:45:00Z');
const et = renderCall(now, bookingUTC, DEFAULT_TZ)[0];
const la = renderCall(now, bookingUTC, 'America/Los_Angeles')[0];
console.log('  same booking, ET lead:  "' + et + '"');
console.log('  same booking, LA lead:  "' + la + '"');
check('LA lead is NOT told the ET time', la === et, false);

// --- calendar-day vs 24h-bucket ---
// The discriminating case: a booking only 15 HOURS away, but across midnight.
// A naive Math.floor(hoursApart / 24) would call this "today" and the lead
// would show up a day late.
console.log('\ncalendar-day vs 24h-bucket');
const eveNow = new Date('2026-08-14T22:00:00Z');   // Fri 18:00 ET
const nextMorn = new Date('2026-08-15T13:00:00Z'); // Sat 09:00 ET — 15h later, next day
check('15h apart across midnight reads "tomorrow"', renderCall(eveNow, nextMorn, DEFAULT_TZ)[1], 'tomorrow');
console.log('    (hours apart: ' + ((nextMorn - eveNow) / 3600000) + ' — a 24h bucket would say "today")');

// And the mirror: 20:30 the SAME evening is still today, not tomorrow.
const sameEve = new Date('2026-08-15T00:30:00Z'); // Fri 20:30 ET, same ET day as eveNow
check('same-evening booking reads "later today"', renderCall(eveNow, sameEve, DEFAULT_TZ)[1], 'later today');

console.log('\n' + (fail ? fail + ' FAILURE(S)' : 'all assertions passed'));
process.exit(fail ? 1 : 0);
