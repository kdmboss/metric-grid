import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enrichZones } from './model.js';
import { riskLevel } from './county/risk.js';
import {
  ALL,
  areasToWatch,
  COUNTY_NAMES,
  countyFacilities,
  countySentence,
  countySummary,
  reasonChips,
  townAnchors,
  townFor,
} from './county/county.js';
import { mapPaths } from './model.js';

const data = JSON.parse(readFileSync(new URL('../public/data/app.json', import.meta.url), 'utf8'));
const zones = enrichZones(data);
const solved = data.records.filter((r) => r.solved);

test('county sentence numbers equal the sums of the county tracts under each plan', () => {
  for (const record of solved.slice(0, 12))
    for (const county of [...COUNTY_NAMES, ALL]) {
      const summary = countySummary(zones, record, county);
      const tracts = zones.filter((z) => county === ALL || z.COUNTY === county);
      for (const [key, plan] of [
        ['baseline', record.baseline],
        ['weighted', record.weighted],
      ]) {
        let homes = 0,
          heat = 0,
          areas = 0;
        for (const z of tracts)
          if (plan.zone_ids.includes(z.zone_id)) {
            homes += z.occupied_units;
            heat += z.heat_electricity;
            areas += 1;
          }
        assert.deepEqual(summary[key], { homes, heat, areas });
        const text = countySentence(summary);
        if (homes) {
          assert.ok(text.includes(homes.toLocaleString('en-US')), `${county} ${key} homes`);
          assert.ok(text.includes(heat.toLocaleString('en-US')), `${county} ${key} heat`);
        }
      }
    }
});
test('county sentence says so when a plan cuts no homes', () => {
  const none = {
    county: 'Stanly County',
    baseline: { homes: 0, heat: 0, areas: 0 },
    weighted: { homes: 0, heat: 0, areas: 0 },
  };
  assert.equal(
    countySentence(none),
    'In a storm like Christmas Eve 2022, both plans keep every area in Stanly County on.',
  );
  const oneSided = { ...none, baseline: { homes: 4120, heat: 2610, areas: 6 } };
  assert.match(
    countySentence(oneSided),
    /MW-only plan cuts power to 4,120 homes here — 2,610 heat with electricity\./,
  );
  assert.match(
    countySentence(oneSided),
    /people-first plan keeps every area in Stanly County on\./i,
  );
  const other = { ...none, weighted: { homes: 2980, heat: 1140, areas: 3 } };
  assert.match(countySentence(other), /MW-only plan keeps every area in Stanly County on\./);
  assert.match(
    countySentence(other),
    /people-first plan cuts 2,980 — 1,140 heat with electricity\./i,
  );
});
test('risk-level rule and its boundaries', () => {
  const z = (svi, heat, missing = false) => ({
    RPL_THEMES: svi,
    share_electric_heat: heat,
    svi_missing: missing,
  });
  assert.equal(riskLevel(z(0.75, 0.1)), 'high');
  assert.equal(riskLevel(z(0.2, 0.7)), 'high');
  assert.equal(riskLevel(z(0.749, 0.699)), 'medium');
  assert.equal(riskLevel(z(0.5, 0)), 'medium');
  assert.equal(riskLevel(z(0.1, 0.5)), 'medium');
  assert.equal(riskLevel(z(0.499, 0.499)), 'low');
  assert.equal(riskLevel(z(null, 0.9, true)), 'unknown');
  assert.equal(riskLevel(z(0.9, 0.9, true)), 'unknown');
  const counts = {};
  zones.forEach((q) => (counts[riskLevel(q)] = (counts[riskLevel(q)] || 0) + 1));
  assert.equal(
    Object.values(counts).reduce((a, b) => a + b, 0),
    zones.length,
  );
});
test('areas to watch are high-risk, ranked deterministically, and reasons come from real values', () => {
  for (const county of COUNTY_NAMES) {
    const a = areasToWatch(zones, county);
    const b = areasToWatch([...zones].reverse(), county);
    assert.deepEqual(
      a.map((q) => q.zone_id),
      b.map((q) => q.zone_id),
    );
    assert.ok(a.length <= 3 && a.every((q) => q.COUNTY === county && riskLevel(q) === 'high'));
    const human = a.map((q) => q.human);
    assert.deepEqual(
      human,
      [...human].sort((x, y) => y - x),
    );
    for (const tract of a) {
      const chips = reasonChips(tract);
      assert.equal(chips.length, 2);
      assert.deepEqual(chips, reasonChips(tract));
    }
  }
  const z = {
    RPL_THEMES: 0.91,
    svi_missing: false,
    share_electric_heat: 0.92,
    housing_units: 100,
    occupied_units: 90,
    renter_occupied: 52,
    yearbuilt_007: 30,
    yearbuilt_008: 31,
    yearbuilt_009: 0,
    yearbuilt_010: 0,
    yearbuilt_011: 0,
  };
  assert.deepEqual(reasonChips(z), ['92% electric heat', 'SVI 0.91 (high)']);
  assert.deepEqual(reasonChips({ ...z, share_electric_heat: 0.2 }), [
    'SVI 0.91 (high)',
    '61% homes built before 1980',
  ]);
});
test('town names: a tract in a place shows the place, otherwise "Area <id>"', () => {
  const place = data.places.find((p) => p.name === 'Albemarle');
  assert.equal(
    townFor(
      zones.find((q) => q.zone_id === place.zone_ids[0]),
      data.places,
    ) !== null,
    true,
  );
  const free = zones.find((q) => !data.places.some((p) => p.zone_ids.includes(q.zone_id)));
  if (free) assert.equal(townFor(free, data.places), null);
  const anchors = townAnchors(data.places, mapPaths(data.zones, data.district).zones, zones, 8);
  for (const county of COUNTY_NAMES)
    assert.ok(anchors.filter((t) => t.county === county).length <= 8);
  assert.ok(anchors.every((t) => Number.isFinite(t.x) && Number.isFinite(t.y)));
});

// An independent point-in-polygon check, so the app's locate() is not testing itself.
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i],
      [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
test('county facilities equal facilities.geojson filtered by point-in-polygon on the county tracts', () => {
  const raw = JSON.parse(
    readFileSync(new URL('../data/frozen/facilities.geojson', import.meta.url), 'utf8'),
  );
  const wanted = new Set(['hospital', 'nursing_home', 'fire_station']);
  let assigned = 0;
  for (const county of COUNTY_NAMES) {
    const rings = data.zones.features
      .filter((f) => f.properties.COUNTY === county)
      .flatMap((f) =>
        f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates,
      );
    const expected = raw.features
      .filter((f) => wanted.has(f.properties.facility_type))
      .filter((f) =>
        rings.some(
          (poly) =>
            inRing(f.geometry.coordinates, poly[0]) &&
            !poly.slice(1).some((h) => inRing(f.geometry.coordinates, h)),
        ),
      )
      .map((f) => f.properties.name ?? null)
      .sort();
    const actual = countyFacilities(data.facilities, data.zones.features, county)
      .map((f) => f.name)
      .sort();
    assert.deepEqual(actual, expected, county);
    assigned += actual.length;
  }
  assert.ok(
    assigned > 0 &&
      assigned <= raw.features.filter((f) => wanted.has(f.properties.facility_type)).length,
  );
  assert.equal(
    countyFacilities(data.facilities, data.zones.features, ALL).length >= assigned,
    true,
  );
});
