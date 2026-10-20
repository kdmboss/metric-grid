import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { entryChoice } from './entry.js';
import { residentRecord, residentCounts } from './resident.js';
import { enrichZones, status } from './model.js';
const data = JSON.parse(readFileSync('public/data/app.json', 'utf8'));
test('entry queries override saved choice and broken storage falls back to welcome', () => {
  assert.equal(entryChoice('?view=resident', { getItem: () => 'planner' }), 'resident');
  assert.equal(entryChoice('?view=planner', { getItem: () => 'resident' }), 'planner');
  assert.equal(entryChoice('', { getItem: () => 'resident' }), 'resident');
  assert.equal(
    entryChoice('', {
      getItem: () => {
        throw Error('blocked');
      },
    }),
    null,
  );
});
test('resident town counts match status for the fixed Elliott Balanced scenario', () => {
  const r = residentRecord(data),
    zones = enrichZones(data);
  assert.equal(r.target_key, 'elliott');
  assert.equal(r.alpha, 0.5);
  assert.equal(r.cap, false);
  for (const place of data.places) {
    const actual = residentCounts(place, zones, r),
      rows = zones.filter((z) => place.zone_ids.includes(z.zone_id));
    assert.equal(actual.total, rows.length);
    assert.equal(actual.baseline, rows.filter((z) => status(z, r.baseline) === 'Cut').length);
    assert.equal(actual.aware, rows.filter((z) => status(z, r.weighted) === 'Cut').length);
  }
});
test('no cooling fixture is bundled as a real measurement', () => {
  assert.ok(!data.node_cooling || data.node_cooling.is_demo === false);
});
