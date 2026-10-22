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

import { fmt } from './model.js';
import { popularTowns, shiftSentence } from './county/county.js';

test('shift sentence: only when people-first cuts more homes in the county, and only with true clauses', () => {
  const record = solved.find((r) => r.target_key === 'elliott' && r.alpha === 0.5 && !r.cap);
  const district = countySummary(zones, record, ALL);
  const fewer = district.baseline.heat - district.weighted.heat;
  assert.equal(fewer, 3412);
  const union = countySummary(zones, record, 'Union County');
  assert.ok(union.weighted.homes > union.baseline.homes);
  const text = shiftSentence(union, district, zones, 'Union County');
  assert.equal(
    text,
    'The people-first plan shifts more of the cut here because these neighborhoods score lower on ' +
      'vulnerability than other parts of the district. District-wide, it leaves about 3,412 fewer ' +
      'electric-heat homes in the dark.',
  );
  // Counties where the people-first plan does not cut more homes get no second sentence.
  for (const county of COUNTY_NAMES.filter((c) => c !== 'Union County'))
    assert.equal(
      shiftSentence(countySummary(zones, record, county), district, zones, county),
      null,
      county,
    );
  assert.equal(shiftSentence(district, district, zones, ALL), null);
  // The vulnerability reason is dropped when the county is not actually lower than the district.
  const high = zones.map((z) => (z.COUNTY === 'Union County' ? { ...z, RPL_THEMES: 0.99 } : z));
  assert.equal(
    shiftSentence(union, district, high, 'Union County'),
    'The people-first plan shifts more of the cut here. ' +
      'District-wide, it leaves about 3,412 fewer electric-heat homes in the dark.',
  );
  // The district-wide clause is dropped when it would not be true.
  const flat = { ...district, weighted: { ...district.weighted, heat: district.baseline.heat } };
  assert.doesNotMatch(shiftSentence(union, flat, zones, 'Union County'), /District-wide/);
});
test('the county cap lowers the share any one county takes in every capped scenario', () => {
  const cap = data.config.optimizer.county_cap.max_share;
  for (const record of solved.filter((r) => r.cap))
    for (const plan of [record.baseline, record.weighted]) {
      const byCounty = {};
      zones
        .filter((z) => plan.zone_ids.includes(z.zone_id))
        .forEach((z) => (byCounty[z.COUNTY] = (byCounty[z.COUNTY] || 0) + z.L_mw));
      for (const mw of Object.values(byCounty)) assert.ok(mw / plan.mw_shed <= cap + 1e-6);
    }
  const off = solved.find((r) => r.target_key === 'elliott' && r.alpha === 0.5 && !r.cap);
  const on = solved.find((r) => r.target_key === 'elliott' && r.alpha === 0.5 && r.cap);
  assert.notDeepEqual(
    countySummary(zones, off, 'Union County').weighted,
    countySummary(zones, on, 'Union County').weighted,
  );
});
test('popular towns are the largest by occupied homes, computed from the data', () => {
  const homes = (p) =>
    p.zone_ids.reduce((n, id) => n + zones.find((z) => z.zone_id === id).occupied_units, 0);
  const expected = [...data.places]
    .sort((a, b) => homes(b) - homes(a) || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((p) => p.name);
  const actual = popularTowns(data.places, zones).map((p) => p.name);
  assert.deepEqual(actual, expected);
  assert.equal(actual.length, 8);
  // Different data gives different chips: nothing is hard-coded.
  const fake = [
    { geoid: '1', name: 'Alpha', zone_ids: [zones[0].zone_id] },
    { geoid: '2', name: 'Beta', zone_ids: [zones[1].zone_id, zones[2].zone_id] },
  ];
  assert.equal(popularTowns(fake, zones).length, 2);
  assert.deepEqual(popularTowns(fake, zones, 1).length, 1);
  assert.equal(fmt(4017), '4,017');
  assert.equal(fmt(15910), '15,910');
});
