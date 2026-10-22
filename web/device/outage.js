/** Outage math and display helpers. Timestamps are naive local ISO strings ("2026-10-20T03:12:00"). */
export const REFERENCE_F = 64;
const parse = (value) => new Date(value).getTime();

export function outageStats(event) {
  const durationMs = parse(event.end) - parse(event.start);
  const hours = durationMs / 3600000;
  const drop = event.temp_start_f - event.temp_end_f;
  return {
    durationMs,
    minutes: Math.round(durationMs / 60000),
    hours,
    drop,
    rate: hours > 0 ? drop / hours : null,
  };
}
export function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(total / 60),
    m = total % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
}
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
/** Typical cooling rate from the recorded outages, and hours until the 64 °F reference. */
export function coolingSummary(events, currentF) {
  const rates = events.map((e) => outageStats(e).rate).filter((r) => Number.isFinite(r) && r > 0);
  const rate = median(rates);
  if (rate == null) return { rate: null, hoursTo64: null, events: 0 };
  return {
    rate,
    hoursTo64: Number.isFinite(currentF) ? Math.max(0, (currentF - REFERENCE_F) / rate) : null,
    events: rates.length,
  };
}
export function relativeTime(then, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - parse(then)) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function clock(value) {
  const d = new Date(value),
    h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
}
export function dateLabel(value) {
  const d = new Date(value);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
/** Last 16 minutes of readings; if the log is sparser, the last four readings. */
export function sparkSeries(readings, now = Date.now()) {
  const recent = readings.filter((r) => now - parse(r.t) <= 16 * 60000 && parse(r.t) <= now);
  return recent.length >= 3 ? recent : readings.slice(-4);
}
export function greeting(date = new Date()) {
  const h = date.getHours();
  return h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : 'Good evening';
}
export function hourLabel(value) {
  const h = new Date(value).getHours();
  return `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
}
export const last24h = (readings, now = Date.now()) =>
  readings.filter((r) => now - parse(r.t) <= 24 * 3600000);
/** "3:12–6:24 a.m." when both ends share a half-day, otherwise the full pair. */
export function clockRange(start, end) {
  const a = clock(start),
    b = clock(end);
  const sa = a.slice(-4),
    sb = b.slice(-4);
  return sa === sb ? `${a.slice(0, -5)}–${b}` : `${a}–${b}`;
}
/** Display smoothing only: a centered 3-point average. Stored readings are never altered. */
export function smoothReadings(readings) {
  return readings.map((r, i) => {
    const near = readings.slice(Math.max(0, i - 1), i + 2);
    return { ...r, temp_f: near.reduce((n, x) => n + x.temp_f, 0) / near.length };
  });
}
/** "6:02 PM" */
export function clock12(value) {
  const d = new Date(value),
    h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
/** "Oct 22, 9:41 PM" */
export const stamp = (value) => `${dateLabel(value)}, ${clock12(value)}`;
/** Readings in the 24 hours before the last one (a device that lost power still shows its last day). */
export function lastDay(readings) {
  if (!readings.length) return [];
  const end = parse(readings.at(-1).t);
  return readings.filter((r) => end - parse(r.t) <= 24 * 3600000);
}
