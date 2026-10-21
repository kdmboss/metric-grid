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
test('resident town result keeps its single prediction disclaimer beside the answer', () => {
  const source = readFileSync('web/components/TownLookup.jsx', 'utf8').replace(/\s+/g, ' ');
  assert.ok(
    source.includes(
      'Based on a modeled replay of the Christmas Eve 2022 storm. Not a prediction for your home.',
    ),
  );
  assert.ok(source.includes('data-area-disclaimer'));
});
