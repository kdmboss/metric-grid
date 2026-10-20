import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('public/data/app.json', 'utf8'));
test('frozen town lookup is populated and every place maps to existing zones', () => {
  assert.ok(data.places.length > 0);
  const ids = new Set(data.zones.features.map((z) => z.properties.zone_id));
  for (const place of data.places) {
    assert.ok(place.name && place.zone_ids.length);
    assert.ok(place.zone_ids.every((id) => ids.has(id)));
  }
  for (const name of ['Albemarle', 'Rockingham', 'Laurinburg', 'Lumberton']) {
    assert.ok(data.places.some((place) => place.name === name));
  }
});
test('town lookup keeps the household prediction disclaimer beside its results', () => {
  const source = readFileSync('web/components/TownLookup.jsx', 'utf8');
  assert.ok(source.includes('A modeled planning scenario, not a prediction for your home.'));
  assert.ok(source.includes('data-area-disclaimer'));
});
