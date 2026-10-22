import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { enrichZones, locate, mapPaths, defaults, getView, mapProjection } from './model.js';
import {
  COUNTY_COLUMNS,
  dashboardTemplate,
  inspectCountyData,
  OPTIONAL_COLUMNS,
  RESOURCE_TYPES,
  validateCountyData,
} from './countyData.js';
import { countySummary, COUNTY_NAMES, ALL } from './county/county.js';
import { resourcePins, withStatuses } from './county/resources.js';

let server, load;
before(async () => {
  server = await createServer({
    configFile: false,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
  });
  load = (path) => server.ssrLoadModule(path);
});
after(() => server.close());

const data = JSON.parse(readFileSync(new URL('../public/data/app.json', import.meta.url), 'utf8'));
const zones = enrichZones(data);
const features = data.zones.features;
const props = zones.map((z) => z);
const record = getView(data, defaults(data)).record;
const text = (m) =>
  m
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const HEADER = [...COUNTY_COLUMNS, ...OPTIONAL_COLUMNS].join(',');
const cell = (v) => `"${String(v).replaceAll('"', '""')}"`;
const row = (o) => [...COUNTY_COLUMNS, ...OPTIONAL_COLUMNS].map((k) => cell(o[k] ?? '')).join(',');
const base = {
  tract_geoid: '',
  resource_name: 'Test library',
  resource_type: 'public_building',
  source: 'Test source',
  updated_on: '2026-10-22',
  notes: '',
  address: '1 Main St',
  latitude: '34.981346',
  longitude: '-80.547167',
};
const csv = (...rows) => `${HEADER}\r\n${rows.map(row).join('\r\n')}\r\n`;

test('the desktop route: wide windows open the county planner; ?view= keeps the classic views', async () => {
  const { usesDashboard, isPresent } = await load('/web/dashboard/CountyDashboard.jsx');
  assert.equal(usesDashboard('', true), true);
  assert.equal(usesDashboard('', false), false);
  assert.equal(usesDashboard('?view=county', false), true);
  assert.equal(usesDashboard('?view=planner', true), false);
  assert.equal(usesDashboard('?view=resident', true), false);
  assert.equal(isPresent('?present=1'), true);
  assert.equal(isPresent('?view=county'), false);
});
test('the left rail lists All NC-08 and nine counties with live people-first vs MW-only homes cut', async () => {
  const { Rail } = await load('/web/dashboard/CountyDashboard.jsx');
  const w = { state: { target: 'elliott', alpha: 0.5, cap: true }, update() {}, zones, record };
  const markup = renderToStaticMarkup(h(Rail, { data, w, county: 'Union County', onCounty() {} }));
  const out = text(markup);
  for (const name of [
    'All NC-08',
    'Union',
    'Mecklenburg',
    'Cabarrus',
    'Robeson',
    'Stanly',
    'Richmond',
    'Montgomery',
    'Anson',
    'Scotland',
  ])
    assert.ok(out.includes(name), name);
  assert.equal((markup.match(/class="county-item"/g) || []).length, 10 - 0, 'ten rows');
  for (const name of [ALL, ...COUNTY_NAMES]) {
    const s = countySummary(zones, record, name);
    assert.ok(out.includes(s.baseline.homes.toLocaleString('en-US')), `${name} MW-only`);
    assert.ok(out.includes(s.weighted.homes.toLocaleString('en-US')), `${name} people-first`);
  }
  for (const control of [
    'Power shortage',
    'Planning priority',
    'Limit how much any one county takes',
  ])
    assert.ok(out.includes(control), control);
  assert.match(markup, /role="switch"[^>]*checked/);
  // Moving the cap changes the rail numbers: Union's people-first cut is 8,946 with the cap and 15,910 without.
  const off = getView(data, { ...defaults(data), cap: false }).record;
  const offOut = text(
    renderToStaticMarkup(
      h(Rail, {
        data,
        w: { ...w, record: off, state: { ...w.state, cap: false } },
        county: 'Union County',
        onCounty() {},
      }),
    ),
  );
  assert.ok(out.includes('8,946') && offOut.includes('15,910') && !offOut.includes('8,946'));
});
test('the import accepts latitude and longitude and reports every bad row with its row number', () => {
  const good = base;
  const missing = { ...base, resource_name: 'No place', latitude: '', longitude: '' };
  const outside = { ...base, resource_name: 'Raleigh', latitude: '35.7796', longitude: '-78.6382' };
  const halfway = { ...base, resource_name: 'Half', latitude: '34.98', longitude: '' };
  const result = inspectCountyData(csv(good, missing, outside, halfway), props, features);
  assert.deepEqual(
    result.rows.map((r) => r.resource_name),
    ['Test library'],
  );
  assert.deepEqual(
    result.errors.map((e) => [e.row, e.message.replace(/\s\(.*?\)/, '')]),
    [
      [3, 'missing coordinates. Add latitude and longitude, or a tract_geoid.'],
      [4, 'the location is outside NC-08.'],
      [5, 'latitude and longitude must both be numbers.'],
    ],
  );
  assert.throws(
    () => validateCountyData(csv(good, missing), props, features),
    /Record 2: missing coordinates/,
  );
  const ok = result.rows[0];
  assert.equal(ok.county, 'Union County');
  assert.equal(ok.tract_geoid, '37179020501');
  assert.equal(locate(features, [ok.lon, ok.lat]), ok.zone_id);
  // A tract_geoid that disagrees with the coordinates is rejected.
  const clash = inspectCountyData(csv({ ...base, tract_geoid: '37179020800' }), props, features);
  assert.match(clash.errors[0].message, /coordinates fall in tract 37179020501/);
  assert.ok(RESOURCE_TYPES.includes('public_building'));
  assert.equal(dashboardTemplate(), `${HEADER}\r\n`);
  // Existing behavior: header names must be exact, and tract-only rows still work.
  assert.throws(
    () => inspectCountyData('tract_geoid,resource_name\n1,x', props, features),
    /column headers/,
  );
  const tractOnly = inspectCountyData(
    csv({ ...base, tract_geoid: '37179020501', latitude: '', longitude: '' }),
    props,
    features,
  );
  assert.equal(tractOnly.errors.length, 0);
  assert.equal(tractOnly.rows[0].lat, null);
});
test('the demo CSV: 6 to 8 real Union County public buildings that validate cleanly', () => {
  const file = readFileSync(
    new URL('../docs/demo/union_public_buildings.csv', import.meta.url),
    'utf8',
  );
  const { rows, errors } = inspectCountyData(file, props, features);
  assert.deepEqual(errors, []);
  assert.ok(rows.length >= 6 && rows.length <= 8, `${rows.length} rows`);
  for (const r of rows) {
    assert.equal(r.county, 'Union County');
    assert.equal(r.resource_type, 'public_building');
    assert.match(r.address, /, (Monroe|Marshville|Indian Trail|Wingate), NC \d{5}$/);
    assert.ok(r.source.length > 20 && /Census|OpenStreetMap/.test(r.source));
    assert.match(r.notes, /Not confirmed as an official warming center/);
    assert.equal(locate(features, [r.lon, r.lat]), r.zone_id);
    assert.doesNotMatch(`${r.resource_name} ${r.notes}`, /^Official warming/i);
  }
  assert.equal(new Set(rows.map((r) => r.resource_name)).size, rows.length);
});
test('imported places get both plan statuses and pins in the matching colors', () => {
  const file = readFileSync(
    new URL('../docs/demo/union_public_buildings.csv', import.meta.url),
    'utf8',
  );
  const parsed = inspectCountyData(file, props, features).rows;
  const withStatus = withStatuses(parsed, zones, record);
  assert.ok(
    withStatus.every(
      (r) =>
        ['Cut', 'Kept on', 'Protected'].includes(r.baseline) &&
        ['Cut', 'Kept on', 'Protected'].includes(r.weighted),
    ),
  );
  const paths = mapPaths(data.zones, data.district);
  const project = mapProjection(data.zones, data.district);
  const pins = resourcePins(withStatus, paths, project, 'typical');
  assert.equal(pins.length, parsed.length);
  assert.deepEqual(
    pins.map((p) => p.tone),
    withStatus.map((r) =>
      r.baseline === 'Cut' ? 'pin-cut' : r.baseline === 'Protected' ? 'pin-protected' : 'pin-kept',
    ),
  );
  assert.ok(
    pins.every(
      (p) =>
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x > 0 &&
        p.x < 640 &&
        p.y > 0 &&
        p.y < 390,
    ),
  );
  const aware = resourcePins(withStatus, paths, project, 'aware');
  assert.deepEqual(
    aware.map((p) => p.tone),
    withStatus.map((r) =>
      r.weighted === 'Cut' ? 'pin-cut' : r.weighted === 'Protected' ? 'pin-protected' : 'pin-kept',
    ),
  );
});
test('Areas to watch can be shortlisted, and the brief carries scenario, areas and resources', async () => {
  const { CountyBody } = await load('/web/county/CountySheet.jsx');
  const { areasToWatch, countySentence, shiftSentence, planStatuses } =
    await load('/web/county/county.js');
  const { BriefPage, briefTitle, scenarioLine, BRIEF_LINE } = await load(
    '/web/dashboard/Brief.jsx',
  );
  const county = 'Union County';
  const summary = countySummary(zones, record, county);
  const watch = areasToWatch(zones, county);
  const bodyProps = {
    county,
    summary,
    zones,
    record,
    places: data.places,
    watch,
    facilities: [],
    flat: true,
    onWatch() {},
    onFacility() {},
    onScenario() {},
  };
  const fresh = text(
    renderToStaticMarkup(
      h(CountyBody, { ...bodyProps, shortlist: { ids: new Set(), onAdd() {} } }),
    ),
  );
  assert.equal((fresh.match(/Add to shortlist/g) || []).length, watch.length);
  const done = text(
    renderToStaticMarkup(
      h(CountyBody, { ...bodyProps, shortlist: { ids: new Set([watch[0].zone_id]), onAdd() {} } }),
    ),
  );
  assert.ok(done.includes('Shortlisted'));
  assert.ok(
    !fresh.includes('Limit how much any one county takes'),
    'controls live in the rail on desktop',
  );
  const district = countySummary(zones, record, ALL);
  const rows = withStatuses(
    inspectCountyData(
      readFileSync(new URL('../docs/demo/union_public_buildings.csv', import.meta.url), 'utf8'),
      props,
      features,
    ).rows,
    zones,
    record,
  );
  const items = watch
    .slice(0, 2)
    .map((z) => ({ zone: { ...z, ...planStatuses(z, record) }, note: '' }));
  const brief = text(
    renderToStaticMarkup(
      h(BriefPage, {
        county,
        scenario: scenarioLine(record, 'Balanced', true, 'elliott'),
        sentence: countySentence(summary),
        shift: shiftSentence(summary, district, zones, county),
        items,
        places: data.places,
        resources: rows,
        today: 'October 22, 2026',
        onClose() {},
      }),
    ),
  );
  assert.equal(briefTitle(county), 'Union County outage planning brief');
  for (const expected of [
    'Union County outage planning brief',
    'Elliott storm · 92 MW cut · Balanced priority · county cap on',
    countySentence(summary),
    'Areas to investigate',
    'Local resources (uploaded)',
    'Union County Public Library, Main Library',
    BRIEF_LINE,
  ])
    assert.ok(brief.includes(expected), expected.slice(0, 50));
  for (const { zone } of items) assert.ok(brief.includes(`Zone ${zone.zone_id}`));
  assert.match(BRIEF_LINE, /not a prediction/);
  assert.ok(brief.includes('8,946') && brief.includes('3,428'));
});
