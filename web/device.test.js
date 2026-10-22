import test from 'node:test';
import assert from 'node:assert/strict';
import {
  coolingSummary,
  formatDuration,
  greeting,
  outageStats,
  relativeTime,
  sparkSeries,
} from './device/outage.js';
import { hasRealDevice, resolveDevices } from './device/deviceData.js';
import { makeSampleDevice } from './demo/deviceSample.js';

const NOW = new Date('2026-10-21T20:00:00').getTime();

test('outage detail math: duration, drop and drop rate', () => {
  const stats = outageStats({
    start: '2026-10-20T03:12:00',
    end: '2026-10-20T06:24:00',
    temp_start_f: 71.2,
    temp_end_f: 63.9,
  });
  assert.equal(stats.minutes, 192);
  assert.equal(formatDuration(stats.durationMs), '3 h 12 min');
  assert.ok(Math.abs(stats.drop - 7.3) < 1e-9);
  assert.ok(Math.abs(stats.rate - 7.3 / 3.2) < 1e-9);
  assert.equal(formatDuration(3 * 3600000), '3 h');
  assert.equal(formatDuration(47 * 60000), '47 min');
});

test('cooling summary uses the median recorded rate and counts down to 64 °F', () => {
  const events = [
    { start: '2026-10-20T00:00:00', end: '2026-10-20T02:00:00', temp_start_f: 70, temp_end_f: 66 },
    { start: '2026-10-19T00:00:00', end: '2026-10-19T01:00:00', temp_start_f: 70, temp_end_f: 66 },
    { start: '2026-10-18T00:00:00', end: '2026-10-18T04:00:00', temp_start_f: 70, temp_end_f: 62 },
  ];
  const summary = coolingSummary(events, 68);
  assert.equal(summary.rate, 2);
  assert.equal(summary.hoursTo64, 2);
  assert.deepEqual(coolingSummary([], 68), { rate: null, hoursTo64: null, events: 0 });
  assert.equal(coolingSummary(events, 60).hoursTo64, 0);
});

test('sample device is deterministic, labelled, and physically plausible', () => {
  const a = makeSampleDevice(NOW),
    b = makeSampleDevice(NOW);
  assert.deepEqual(a, b);
  assert.equal(a.sample, true);
  assert.equal(a.name, 'Demo device');
  assert.ok(a.events.length >= 3);
  for (const event of a.events) {
    const stats = outageStats(event);
    assert.ok(stats.minutes > 0 && stats.drop > 0 && stats.rate > 0 && stats.rate < 5);
    assert.ok(Date.parse(event.end) < NOW);
  }
  assert.ok(a.readings.length > 150);
  const times = a.readings.map((r) => Date.parse(r.t));
  assert.deepEqual(
    times,
    [...times].sort((x, y) => x - y),
  );
});

test('real device files take priority and sample data is never mixed in', () => {
  const real = {
    device: { id: 'abc', name: 'Bedroom' },
    readings: [
      { t: '2026-10-21T19:50:00', temp_f: 66.2 },
      { t: '2026-10-21T19:55:00', temp_f: 66.4 },
    ],
    events: [
      {
        start: '2026-10-20T03:00:00',
        end: '2026-10-20T04:00:00',
        temp_start_f: 67,
        temp_end_f: 65,
      },
      { start: 'bad', end: 'worse', temp_start_f: 1, temp_end_f: 2 },
    ],
  };
  assert.equal(hasRealDevice(real), true);
  const [device, ...rest] = resolveDevices(real, NOW);
  assert.equal(rest.length, 0);
  assert.equal(device.sample, false);
  assert.equal(device.events.length, 1);
  assert.equal(device.readings.length, 2);
  assert.equal(hasRealDevice(null), false);
  assert.equal(hasRealDevice({ readings: [] }), false);
  const [fallback] = resolveDevices(undefined, NOW);
  assert.equal(fallback.sample, true);
});

test('relative time, greeting and spark window', () => {
  assert.equal(relativeTime('2026-10-21T19:58:00', NOW), '2 min ago');
  assert.equal(relativeTime('2026-10-21T19:59:50', NOW), 'just now');
  assert.equal(relativeTime('2026-10-21T17:00:00', NOW), '3 h ago');
  assert.equal(relativeTime('2026-10-18T20:00:00', NOW), '3 d ago');
  assert.equal(greeting(new Date('2026-10-21T08:00:00')), 'Good morning');
  assert.equal(greeting(new Date('2026-10-21T14:00:00')), 'Good afternoon');
  assert.equal(greeting(new Date('2026-10-21T21:00:00')), 'Good evening');
  const readings = Array.from({ length: 12 }, (_, i) => ({
    t: new Date(NOW - (11 - i) * 5 * 60000).toISOString().slice(0, 19),
    temp_f: 68 + i / 10,
  }));
  assert.ok(sparkSeries(readings, NOW).length >= 3);
});
