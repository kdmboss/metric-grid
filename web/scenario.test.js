import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enrichZones } from './model.js';
import { priorityZones, countyConcentration } from './hooks/scenarioSelectors.js';
import { viewportFrame, zoomAt } from './mapGeometry.js';

test('priority ranking excludes protected zones and resolves frequency ties by SVI then zone ID', () => {
  const zones = [
    { zone_id: 1, protected: true, RPL_THEMES: 1, share_electric_heat: 1 },
    { zone_id: 2, RPL_THEMES: 0.8, share_electric_heat: 0.1 },
    { zone_id: 3, RPL_THEMES: 0.9, share_electric_heat: 0.1 },
    { zone_id: 4, RPL_THEMES: 0.9, share_electric_heat: 0.1 },
    { zone_id: 5, RPL_THEMES: 0.1, share_electric_heat: 0.1 },
    { zone_id: 6, RPL_THEMES: 0.1, share_electric_heat: 0.8 },
  ];
  const ids = priorityZones(
    zones,
    { 1: 200, 2: 50, 3: 50, 4: 50, 5: 200, 6: 100 },
    { svi_min: 0.75, electric_heat_min: 0.5, max_rows: 4 },
  ).map((z) => z.zone_id);
  assert.deepEqual(ids, [6, 3, 4, 2]);
});

test('concentration accounts for every displayed MW and keeps the highest county first', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/app.json', import.meta.url)));
  const zones = enrichZones(data);
  for (const record of data.records.filter((r) => r.solved)) {
    const rows = countyConcentration(zones, record);
    assert.ok(Math.abs(rows.reduce((sum, [, mw]) => sum + mw, 0) - record.weighted.mw_shed) < 1e-6);
    assert.ok(rows.every((row, i) => !i || rows[i - 1][1] >= row[1]));
    const ids = new Set(record.weighted.zone_ids);
    for (const [county, mw] of rows) {
      const sum = zones
        .filter((z) => z.COUNTY === county && ids.has(z.zone_id))
        .reduce((sum, z) => sum + z.L_mw, 0);
      assert.ok(Math.abs(sum - mw) < 1e-9);
    }
  }
});

test('cursor zoom holds the pointed map coordinate fixed and viewport padding stays symmetric', () => {
  const view = { scale: 2, x: 12, y: -8 },
    point = { x: 120, y: 90 };
  const next = zoomAt(view, 1.4, point);
  assert.ok(Math.abs((point.x - view.x) / view.scale - (point.x - next.x) / next.scale) < 1e-9);
  assert.ok(Math.abs((point.y - view.y) / view.scale - (point.y - next.y) / next.scale) < 1e-9);
  const frame = viewportFrame([{ d: 'M10,20L110,20L110,120L10,120Z' }], 600, 600);
  assert.equal(frame.x + frame.width / 2, 60);
  assert.equal(frame.y + frame.height / 2, 70);
  assert.ok(Math.abs(((10 - frame.x) / frame.width) * 600 - 16) < 1e-9);
});
