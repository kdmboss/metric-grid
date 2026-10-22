/**
 * Deterministic SAMPLE data for the Devices tab when no real device export exists.
 * Everything here is invented for demonstration; the UI must always label it "Sample data".
 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const iso = (ms) => {
  const d = new Date(ms),
    p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};
const round1 = (n) => Math.round(n * 10) / 10;
const STEP = 5 * 60000;
// [days ago, start hour, start minute, duration minutes, outdoor °F, time constant hours]
const OUTAGES = [
  [1, 3, 12, 192, 27, 17],
  [3, 18, 40, 65, 34, 19],
  [5, 6, 5, 47, 22, 16],
];
export function makeSampleDevice(now = Date.now()) {
  const random = rng(20221224);
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  const indoor = (ms) =>
    68.2 + 1.3 * Math.sin(((ms - base.getTime()) / 86400000 - 0.33) * 2 * Math.PI);
  const events = OUTAGES.map(([daysAgo, hour, minute, minutes, outdoor, tau]) => {
    const start = new Date(base);
    start.setDate(start.getDate() - daysAgo);
    start.setHours(hour, minute, 0, 0);
    const t0 = indoor(start.getTime());
    const end = start.getTime() + minutes * 60000;
    const t1 = outdoor + (t0 - outdoor) * Math.exp(-minutes / 60 / tau);
    return {
      start: iso(start.getTime()),
      end: iso(end),
      temp_start_f: round1(t0),
      temp_end_f: round1(t1),
      _s: start.getTime(),
      _e: end,
    };
  }).sort((a, b) => a._s - b._s);
  const readings = [];
  const first = Math.floor((now - 6 * 86400000) / STEP) * STEP;
  for (let ms = first; ms <= now; ms += STEP) {
    if (events.some((e) => ms >= e._s && ms < e._e)) continue; // the device is off during an outage
    let t = indoor(ms) + (random() - 0.5) * 0.12;
    const after = events.find((e) => ms >= e._e && ms < e._e + 40 * 60000);
    if (after) {
      const m = (ms - after._e) / 60000;
      t = after.temp_end_f + (indoor(ms) - after.temp_end_f) * (1 - Math.exp(-m / 18));
    }
    readings.push({ t: iso(ms), temp_f: round1(t) });
  }
  return {
    id: 'sample',
    name: 'Demo device',
    room: 'Living room',
    sample: true,
    readings,
    events: events.map(({ _s, _e, ...event }) => event).reverse(),
  };
}
