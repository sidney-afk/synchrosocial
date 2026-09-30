// Verifies the date helpers that the LIVE n8n workflows use, copied out of them.
// n8n is the source of truth; if you change the code in n8n, change it here too.
//
//   dayOptions()  <- "Sales — Booking Recovery Dispatch" > Select Due
//   when / time   <- "Sales — Call Booked (iClosed)" and "Normal Sales — Booking
//                    Handler" > Send Confirmation SMS (both nodes hold the same code)
//
// Last synced with n8n: 2026-09-30.
const DEFAULT_TZ = 'America/New_York';

// ---- from Dispatch > Select Due ----
function dayOptions(from, tz) {
  const opts = [];
  for (let i = 1; i <= 7 && opts.length < 2; i++) {
    const d = new Date(from.getTime() + i * 86400000);
    const dow = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: tz });
    if (dow === 'Sat' || dow === 'Sun') continue;
    opts.push(i === 1 ? 'tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz }));
  }
  while (opts.length < 2) opts.push('later this week');
  return opts;
}

// ---- from the two "Send Confirmation SMS" nodes ----
function renderConfirmationSms(now, start, tz, firstName) {
  const df = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const diffDays = Math.round((new Date(df.format(start) + 'T00:00:00Z') - new Date(df.format(now) + 'T00:00:00Z')) / 86400000);
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(start);
  const when = diffDays <= 0 ? 'today' : diffDays === 1 ? 'tomorrow' : weekday;
  let time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(start);
  time = time.replace(' ', '').toLowerCase();
  const name = (firstName || 'there').trim();
  const message = "Hi " + name + ", it's Kasper from Synchro Social & just saw that you booked a call for " + when + " at " + time +
    ". I'm excited to chat with you, if there's anything you'd like to share about your brand/work beforehand, please text me but otherwise I'll talk to you " +
    when + "! Reply STOP to opt out, HELP for help.";
  return { when, time, message };
}

let fail = 0;
function check(label, got, want) {
  const ok = got === want;
  if (!ok) fail++;
  console.log((ok ? '  PASS ' : '  FAIL ') + label + '  got=' + JSON.stringify(got) + (ok ? '' : ' want=' + JSON.stringify(want)));
}

// --- recovery email + text day options, one per weekday. 16:00Z is noon ET, clear of DST edges. ---
console.log('\ndayOptions() — the table in MESSAGE_TEMPLATES.md, Date logic');
const cases = [
  ['2026-08-10', 'Monday',    'tomorrow', 'Wednesday'],
  ['2026-08-11', 'Tuesday',   'tomorrow', 'Thursday'],
  ['2026-08-12', 'Wednesday', 'tomorrow', 'Friday'],
  ['2026-08-13', 'Thursday',  'tomorrow', 'Monday'],
  ['2026-08-14', 'Friday',    'Monday',   'Tuesday'],  // the case a hardcoded "tomorrow or Monday" gets wrong
  ['2026-08-15', 'Saturday',  'Monday',   'Tuesday'],
  ['2026-08-16', 'Sunday',    'tomorrow', 'Tuesday'],
];
for (const [date, dow, w1, w2] of cases) {
  const [d1, d2] = dayOptions(new Date(date + 'T16:00:00Z'), DEFAULT_TZ);
  check(dow.padEnd(10) + ' -> "' + d1 + ' or ' + d2 + '"', d1 + '|' + d2, w1 + '|' + w2);
}

// --- booked-call confirmation text ---
console.log('\nrenderConfirmationSms() — booked confirmation');
const now = new Date('2026-08-14T16:00:00Z'); // Fri 12:00 ET
const t = [
  ['same day, 3:45pm ET',  '2026-08-14T19:45:00Z', DEFAULT_TZ,              'today',    '3:45pm'],
  ['next day, 3:45pm ET',  '2026-08-15T19:45:00Z', DEFAULT_TZ,              'tomorrow', '3:45pm'],
  ['4 days out',           '2026-08-18T19:45:00Z', DEFAULT_TZ,              'Tuesday',  '3:45pm'],
  // Known behaviour, not a goal: 7+ days out still says only the weekday name.
  ['13 days out',          '2026-08-27T19:45:00Z', DEFAULT_TZ,              'Thursday', '3:45pm'],
  // Known behaviour: the live code keeps ":00" on the hour.
  ['on the hour',          '2026-08-15T19:00:00Z', DEFAULT_TZ,              'tomorrow', '3:00pm'],
  ['LA lead sees LA time', '2026-08-15T19:45:00Z', 'America/Los_Angeles',   'tomorrow', '12:45pm'],
];
for (const [label, iso, tz, w1, w2] of t) {
  const r = renderConfirmationSms(now, new Date(iso), tz, 'Niko');
  check(label.padEnd(24) + ' -> "' + r.when + ' at ' + r.time + '"', r.when + '|' + r.time, w1 + '|' + w2);
}
const sample = renderConfirmationSms(now, new Date('2026-08-15T19:45:00Z'), DEFAULT_TZ, 'Niko').message;
check('message starts with the sender line', sample.indexOf("Hi Niko, it's Kasper from Synchro Social & just saw that you booked a call for tomorrow at 3:45pm.") === 0, true);
check('message ends with the opt-out line', /Reply STOP to opt out, HELP for help\.$/.test(sample), true);
check('missing first name falls back to "there"', renderConfirmationSms(now, new Date('2026-08-15T19:45:00Z'), DEFAULT_TZ, '').message.indexOf('Hi there,'), 0);

// --- the timezone trap this exists to prevent ---
console.log('\nthe bug this prevents');
const bookingUTC = new Date('2026-08-15T19:45:00Z');
const et = renderConfirmationSms(now, bookingUTC, DEFAULT_TZ, 'x').time;
const la = renderConfirmationSms(now, bookingUTC, 'America/Los_Angeles', 'x').time;
console.log('  same booking, ET lead:  "' + et + '"');
console.log('  same booking, LA lead:  "' + la + '"');
check('LA lead is NOT told the ET time', la === et, false);

// --- calendar-day vs 24h-bucket ---
// A booking only 15 HOURS away can still be tomorrow. A naive hours / 24 bucket would call it "today".
console.log('\ncalendar-day vs 24h-bucket');
const eveNow = new Date('2026-08-14T22:00:00Z');   // Fri 18:00 ET
const nextMorn = new Date('2026-08-15T13:00:00Z'); // Sat 09:00 ET, 15h later, next day
check('15h apart across midnight reads "tomorrow"', renderConfirmationSms(eveNow, nextMorn, DEFAULT_TZ, 'x').when, 'tomorrow');
const sameEve = new Date('2026-08-15T00:30:00Z');  // Fri 20:30 ET, same ET day as eveNow
check('same-evening booking reads "today"', renderConfirmationSms(eveNow, sameEve, DEFAULT_TZ, 'x').when, 'today');

console.log('\n' + (fail ? fail + ' FAILURE(S)' : 'all assertions passed'));
process.exit(fail ? 1 : 0);
