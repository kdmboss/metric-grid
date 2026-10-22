import { readFileSync, readdirSync, existsSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
  cutCounts,
  defaults,
  enrichZones,
  getView,
  locate,
  mapPaths,
  planMetrics,
  readState,
  status,
  targets,
} from './model.js';
import {
  planChanges,
  countySummary,
  countyLabelAnchors,
  swapSentence,
  benefitSentence,
  mapFrame,
} from './comparison.js';
import { approvedContent } from './content.js';
import {
  FOLLOWUPS,
  csvCell,
  exportRows,
  priorityName,
  sanitizePlan,
  shortlistCsv,
} from './planning.js';
import {
  COUNTY_COLUMNS,
  countyTemplate,
  MAX_COUNTY_ROWS,
  validateCountyData,
} from './countyData.js';
const data = JSON.parse(readFileSync(new URL('../public/data/app.json', import.meta.url), 'utf8'));
const zones = enrichZones(data);
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 1e-6, `${label}: ${actual} != ${expected}`);
const countyFixture = (overrides) => ({
  tract_geoid: String(zones[0].GEOID),
  resource_name: 'Test fixture resource',
  resource_type: 'warming_center',
  capacity_people: '25',
  source: 'Automated test fixture',
  updated_on: '2026-10-19',
  notes: 'Not a real resource',
  ...overrides,
});
const countyCsv = (records) =>
  countyTemplate() +
  records
    .map((row) =>
      COUNTY_COLUMNS.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','),
    )
    .join('\r\n');
test(
  'county CSV preserves quoted content, matches counties and leaves model ' + 'inputs untouched',
  () => {
    const original = JSON.stringify({
      zones,
      records: data.records,
    });
    const note = 'Comma, quote " and\na new line <script>fixture</script>';
    const parsed = validateCountyData(
      '\uFEFF' +
        countyCsv([
          countyFixture({
            notes: note,
          }),
        ]),
      zones,
    );
    assert.equal(parsed[0].county, zones[0].COUNTY);
    assert.equal(parsed[0].zone_id, zones[0].zone_id);
    assert.equal(parsed[0].capacity_people, 25);
    assert.equal(parsed[0].notes, note);
    assert.equal(
      validateCountyData(
        countyCsv([
          countyFixture({
            capacity_people: '',
          }),
        ]),
        zones,
      )[0].capacity_people,
      null,
    );
    assert.equal(
      JSON.stringify({
        zones,
        records: data.records,
      }),
      original,
    );
    assert.equal(countyTemplate(), COUNTY_COLUMNS.join(',') + '\r\n');
  },
);
test(
  'county CSV rejects unknown tracts, ambiguous rows, invalid capacity and ' + 'invalid dates',
  () => {
    for (const override of [
      {
        tract_geoid: '99999999999',
      },
      {
        tract_geoid: '',
      },
      {
        source: '',
      },
      {
        resource_name: '',
      },
      {
        resource_type: 'hospital',
      },
      {
        capacity_people: '-1',
      },
      {
        capacity_people: '1.5',
      },
      {
        capacity_people: 'unknown',
      },
      {
        updated_on: '2026-02-30',
      },
      {
        updated_on: '10/19/2026',
      },
    ]) {
      assert.throws(
        () => validateCountyData(countyCsv([countyFixture(override)]), zones),
        /Record 1:/,
      );
    }
    assert.throws(
      () => validateCountyData(countyCsv([countyFixture(), countyFixture()]), zones),
      /duplicate resource/,
    );
    assert.throws(() => validateCountyData(countyTemplate(), zones), /at least one/);
    assert.throws(
      () => validateCountyData('tract_geoid,resource_name\n123,fixture', zones),
      /column headers/,
    );
    assert.throws(
      () => validateCountyData(countyTemplate() + '"unfinished', zones),
      /closing quote/,
    );
    assert.throws(
      () => validateCountyData(countyTemplate() + '"closed"extra', zones),
      /after a quoted cell/,
    );
    assert.throws(() => validateCountyData(countyTemplate() + 'one,two', zones), /number of cells/);
  },
);
test('county import enforces size and row limits before accepting a resource list', () => {
  assert.throws(() => validateCountyData('x'.repeat(1024 * 1024 + 1), zones), /1 MB/);
  assert.throws(
    () =>
      validateCountyData(
        countyCsv(
          Array.from(
            {
              length: MAX_COUNTY_ROWS + 1,
            },
            (_, i) =>
              countyFixture({
                resource_name: `Fixture ${i}`,
              }),
          ),
        ),
        zones,
      ),
    /at most 500/,
  );
});
test('retired visible brand names are absent from browser source and built assets', () => {
  const retiredNames = [['METRIC', 'Grid'].join('-'), ['Metric', 'Grid'].join('')];
  const collect = (directory) =>
    readdirSync(directory, {
      withFileTypes: true,
    }).flatMap((entry) => {
      const file = new URL(`../${directory}/${entry.name}`, import.meta.url);
      return entry.isDirectory()
        ? collect(`${directory}/${entry.name}`)
        : [readFileSync(file, 'utf8')];
    });
  const source = collect('web');
  const built = existsSync(new URL('../dist', import.meta.url)) ? collect('dist') : [];
  for (const text of [...source, ...built])
    for (const retired of retiredNames)
      assert.equal(text.includes(retired), false, `retired brand found: ${retired}`);
});
test(
  'every precomputed scenario preserves original plan metrics, MW bands, ' +
    'and facility exclusions',
  () => {
    for (const record of data.records.filter((r) => r.solved)) {
      for (const kind of ['baseline', 'weighted']) {
        const plan = record[kind];
        const calculated = planMetrics(zones, plan.zone_ids);
        for (const [metric, value] of Object.entries(calculated))
          close(
            value,
            plan[metric],
            `${record.target_key}/${record.alpha}/${record.cap}/${kind}/${metric}`,
          );
        assert.ok(
          calculated.mw_shed >= record.band_lo_mw - 1e-6 &&
            calculated.mw_shed <= record.band_hi_mw + 1e-6,
        );
        assert.ok(
          zones.filter((z) => plan.zone_ids.includes(z.zone_id)).every((z) => !z.protected),
        );
        if (record.cap) {
          const counties = {};
          zones
            .filter((z) => plan.zone_ids.includes(z.zone_id))
            .forEach((z) => {
              counties[z.COUNTY] = (counties[z.COUNTY] || 0) + z.L_mw;
            });
          assert.ok(
            Object.values(counties).every(
              (mw) => mw / calculated.mw_shed <= data.config.optimizer.county_cap.max_share + 1e-6,
            ),
          );
        }
      }
    }
  },
);
test('every control combination selects the corresponding original record', () => {
  for (const target of targets(data))
    for (const alpha of data.config.optimizer.alpha_grid)
      for (const cap of [false, true]) {
        const view = getView(data, {
          target,
          alpha,
          cap,
        });
        const original = data.records.find(
          (r) => r.target_key === target && r.alpha === alpha && r.cap === cap,
        );
        if (original.solved) {
          assert.equal(view.record, original);
          assert.equal(view.note, null);
        } else assert.ok(view.note);
      }
});
test('all comparison distributions reproduce stored extrema and plan counts', () => {
  for (const record of data.records.filter((r) => r.solved)) {
    const plans = data.loadonly.sets[record.loadonly_key].plans;
    const metrics = plans.map((plan) => planMetrics(zones, plan));
    assert.equal(plans.length, record.loadonly.n);
    assert.deepEqual(
      plans[data.loadonly.sets[record.loadonly_key].typical_index],
      record.baseline.zone_ids,
    );
    for (const key of ['households', 'electric_heat_households', 'h_human', 'h_econ']) {
      const values = metrics.map((m) => m[key]);
      close(Math.min(...values), record.loadonly[key].min, `distribution min ${key}`);
      close(Math.max(...values), record.loadonly[key].max, `distribution max ${key}`);
      assert.equal(
        values.filter((v) => v > record.weighted[key] + 1e-6).length,
        record.loadonly[key].n_plans_more,
      );
    }
    assert.equal(
      Object.values(cutCounts(plans)).reduce((a, b) => a + b, 0),
      plans.reduce((sum, p) => sum + p.length, 0),
    );
  }
});
test('the original (cap off) Elliott headline is unchanged in the presolved data', () => {
  // Same assertions as before the default changed: the cap-off record is still available and untouched.
  const r = getView(data, { ...defaults(data), cap: false }).record;
  assert.equal(r.cap, false);
  assert.equal(r.baseline.electric_heat_households - r.weighted.electric_heat_households, 3412);
  assert.equal(r.weighted.households - r.baseline.households, 2543);
});
test('the default scenario is Elliott / Balanced with the county cap ON', () => {
  assert.deepEqual(
    { alpha: defaults(data).alpha, target: defaults(data).target, cap: defaults(data).cap },
    { alpha: 0.5, target: 'elliott', cap: true },
  );
  const r = getView(data, defaults(data)).record;
  assert.equal(r.cap, true);
  assert.equal(r.baseline.electric_heat_households - r.weighted.electric_heat_households, 3428);
  assert.equal(r.weighted.households - r.baseline.households, 109);
  assert.equal(readState(data, '').cap, true);
  assert.equal(readState(data, '?cap=0').cap, false);
  assert.equal(readState(data, '?cap=1').cap, true);
});
test('malformed deep links fall back safely and legacy deep links still work', () => {
  assert.deepEqual(readState(data, '?alpha=nope&pct=NaN&zone=9999'), defaults(data));
  assert.deepEqual(readState(data, '?alpha=&pct=&zone=bad'), defaults(data));
  assert.deepEqual(readState(data, '?alpha=1&pct=10&cap=1&zone=23'), {
    alpha: 1,
    target: '10',
    cap: true,
    zone: 23,
  });
  assert.equal(readState(data, '?alpha=.6').alpha, 0.5);
});
test(
  'missing or infeasible settings visibly disclose the nearest result and ' +
    'retain the cap when possible',
  () => {
    const clone = structuredClone(data),
      original = clone.records.find((r) => r.target_key === 'elliott' && r.alpha === 0.5 && r.cap);
    original.solved = false;
    original.reason = 'Synthetic infeasible target';
    const result = getView(clone, {
      target: 'elliott',
      alpha: 0.5,
      cap: true,
    });
    assert.ok(result.record.solved);
    assert.equal(result.record.cap, true);
    assert.match(result.note, /cannot be met/);
    const missing = getView(data, {
      target: '11',
      alpha: 0.6,
      cap: false,
    });
    assert.match(missing.note, /not precomputed/);
  },
);
test('example building locations match original tract assignments', () => {
  assert.deepEqual(
    data.config.example_locations.map((location) =>
      locate(data.zones.features, [location.lon, location.lat]),
    ),
    [17, 141, 100],
  );
});
test('map geometry is finite and zero-household missing SVI stays visibly missing', () => {
  const paths = mapPaths(data.zones, data.district);
  assert.equal(paths.zones.length, 183);
  assert.ok(paths.zones.every((z) => z.d.startsWith('M') && !/NaN|Infinity/.test(z.d)));
  assert.ok(paths.district.startsWith('M'));
  for (const zone of zones.filter((z) => z.svi_missing)) {
    assert.equal(zone.RPL_THEMES, null);
    if (zone.occupied_units === 0) assert.equal(zone.human, 0);
  }
  const protectedZone = zones.find((z) => z.protected);
  assert.equal(
    status(protectedZone, {
      zone_ids: [],
    }),
    'Protected',
  );
});
test(
  'content export hides empty/unapproved/unattributed quotes and retains ' +
    'author text without interpreting HTML',
  () => {
    assert.deepEqual(approvedContent([], ''), {
      quotes: [],
      story: '',
    });
    const fixture = {
      name: 'Reviewer fixture',
      role: 'Test role',
      quote: 'Test-only approved content',
      permission: true,
    };
    assert.equal(
      approvedContent(
        [
          {
            ...fixture,
            permission: false,
          },
          {
            ...fixture,
            permission: 'true',
          },
          {
            ...fixture,
            role: '',
          },
          {
            ...fixture,
            name: ' ',
          },
          fixture,
        ],
        '',
      ).quotes.length,
      1,
    );
    assert.equal(
      approvedContent(null, '  <script>fixture</script>  ').story,
      '<script>fixture</script>',
    );
    assert.deepEqual(data.content, {
      quotes: [],
      story: '',
    });
  },
);
test('saved plans discard malformed and duplicate entries without changing valid notes', () => {
  const plan = sanitizePlan(
    [
      {
        zone: 17,
        note: 'Line one\nLine two',
        followup: FOLLOWUPS[1],
      },
      {
        zone: 17,
      },
      {
        zone: 9999,
      },
      null,
      {
        zone: 141,
        note: 42,
        followup: 'unknown',
      },
    ],
    new Set(zones.map((z) => z.zone_id)),
  );
  assert.equal(plan.length, 2);
  assert.equal(plan[0].note, 'Line one\nLine two');
  assert.equal(plan[1].note, '');
  assert.equal(plan[1].followup, FOLLOWUPS[0]);
  assert.deepEqual(sanitizePlan({}, new Set()), []);
});
test(
  'CSV exports provenance, the current scenario, truthful evidence, and ' + 'safely escaped notes',
  () => {
    const record = getView(data, {
      ...defaults(data),
      cap: true,
    }).record;
    const rows = exportRows(data, record, zones, [
      {
        zone: 17,
        followup: FOLLOWUPS[0],
        note: '=HYPERLINK("fixture")\nSecond line',
      },
    ]);
    const row = rows[0],
      z = zones.find((z) => z.zone_id === 17);
    assert.equal(row.reference_date, data.constants.scenario.date);
    assert.equal(row.county_cap, true);
    assert.equal(row.estimated_zone_load_mw, z.L_mw);
    assert.equal(row.social_vulnerability_index, z.RPL_THEMES);
    assert.equal(row.aware_status, status(z, record.weighted));
    assert.equal(row.interruption_cost_2013_usd_1h, z.econ);
    assert.match(row.limitations, /not a uniform sample/);
    const csv = shortlistCsv(rows);
    assert.match(csv, /^\uFEFF"app_name"/);
    assert.match(csv, /"HEARTH"/);
    assert.match(csv, /estimated_zone_load_mw/);
    assert.match(csv, /"'=HYPERLINK\(""fixture""\)/);
    assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
    assert.equal(csvCell('@formula'), '"\'@formula"');
    assert.equal(shortlistCsv([]), '');
  },
);
test('plain-language priorities disclose both objective extremes', () => {
  assert.equal(priorityName(0), 'Business cost only');
  assert.equal(priorityName(1), 'People at risk only');
  assert.equal(priorityName(0.5), 'Balanced');
});
test(
  'web interface copy preserves the required sentence and excludes ' +
    'prohibited claims or typed headline outcomes',
  () => {
    const require = createRequire(import.meta.url);
    const { parse } = require('@babel/parser');
    const files = [
      'Workspace.jsx',
      'Evidence.jsx',
      'MapCanvas.jsx',
      'ComparisonPanels.jsx',
      'comparison.js',
      'main.jsx',
    ];
    const required =
      'The Elliott regional event anchors this scenario. NC-08 load and ' +
      'required reduction are modeled district-scale estimates, not observed ' +
      'utility circuit values.';
    const banned = [
      'privacy-preserving',
      'federated learning',
      'AI optimizer',
      'conventional plan',
      'circuit',
      'feeder',
      'service area',
      'neighborhood demand',
      'least harm',
      'outage plan',
    ];
    const all = files
      .map((name) => readFileSync(new URL(name, import.meta.url), 'utf8'))
      .join('\n');
    assert.ok(all.includes(required));
    const sanctionedBrandCopy = [
      "Outage planning that remembers who's home",
      'HEARTH · NC-08 outage planning',
    ];
    const copyUnderAudit = sanctionedBrandCopy.reduce(
      (copy, phrase) => copy.replaceAll(phrase, ''),
      all.replace(required, ''),
    );
    for (const phrase of banned)
      assert.ok(!copyUnderAudit.toLowerCase().includes(phrase.toLowerCase()), phrase);
    const outcomes = ['3,412', '5,484', '8,896', '2,543', '17,956', '15,413', '73%', '12.6%'];
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'JSXText' || node.type === 'StringLiteral')
        for (const outcome of outcomes)
          assert.ok(!String(node.value).includes(outcome), `Typed model outcome: ${outcome}`);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === 'object') visit(value);
      }
    };
    files.forEach((name) =>
      visit(
        parse(readFileSync(new URL(name, import.meta.url), 'utf8'), {
          sourceType: 'module',
          plugins: ['jsx'],
        }),
      ),
    );
  },
);
test(
  'difference categories partition every zone and match both plans across ' +
    'all supported scenarios',
  () => {
    for (const record of data.records.filter((r) => r.solved)) {
      const result = planChanges(zones, record);
      assert.equal(
        Object.values(result.counts).reduce((a, b) => a + b, 0),
        zones.length,
      );
      assert.equal(result.counts.protected, zones.filter((z) => z.protected).length);
      assert.equal(
        result.counts['only-baseline'] + result.counts.both,
        record.baseline.zone_ids.length,
      );
      assert.equal(
        result.counts['only-aware'] + result.counts.both,
        record.weighted.zone_ids.length,
      );
      for (const z of zones) {
        const key = result.byId[z.zone_id].category;
        if (z.protected) assert.equal(key, 'protected');
        else {
          assert.equal(
            ['only-baseline', 'both'].includes(key),
            record.baseline.zone_ids.includes(z.zone_id),
          );
          assert.equal(
            ['only-aware', 'both'].includes(key),
            record.weighted.zone_ids.includes(z.zone_id),
          );
        }
      }
    }
  },
);
test(
  'county totals reproduce plan totals and heating shares use the summed ' + 'ACS denominator',
  () => {
    const counties = [...new Set(zones.map((z) => z.COUNTY))];
    for (const record of data.records.filter((r) => r.solved)) {
      const rows = counties.map((c) => countySummary(zones, record, c));
      close(
        rows.reduce((n, r) => n + r.households, 0),
        zones.reduce((n, z) => n + z.occupied_units, 0),
        'district households',
      );
      assert.equal(
        rows.reduce((n, r) => n + r.zones, 0),
        zones.length,
      );
      assert.equal(
        rows.reduce((n, r) => n + r.protectedZones, 0),
        zones.filter((z) => z.protected).length,
      );
      for (const key of ['baseline', 'weighted']) {
        close(
          rows.reduce((n, r) => n + r[key].mw, 0),
          record[key].mw_shed,
          'county MW',
        );
        close(
          rows.reduce((n, r) => n + r[key].share, 0),
          1,
          'county share',
        );
        close(
          rows.reduce((n, r) => n + r[key].heatHomes, 0),
          record[key].electric_heat_households,
          'county heat',
        );
        close(
          rows.reduce((n, r) => n + r[key].households, 0),
          record[key].households,
          'county households',
        );
      }
      for (const row of rows) {
        const countyZones = zones.filter((z) => z.COUNTY === row.county);
        close(
          row.heatShare,
          countyZones.reduce((n, z) => n + z.heat_electricity, 0) /
            countyZones.reduce((n, z) => n + z.heat_total_occupied, 0),
          'ACS heat share',
        );
      }
    }
  },
);
test('swap explanation reverses or becomes neutral when improvement is unsupported', () => {
  const result = planChanges(zones, getView(data, defaults(data)).record);
  assert.match(swapSentence(result), /higher average social vulnerability.*lower average/);
  assert.match(
    swapSentence({
      ...result,
      removedMeanSvi: 0.1,
      addedMeanSvi: 0.8,
    }),
    /lower average social vulnerability.*higher average/,
  );
  for (const values of [
    {
      removedMeanSvi: null,
      addedMeanSvi: 0.8,
    },
    {
      removedMeanSvi: 0.5,
      addedMeanSvi: 0.5,
    },
  ])
    assert.doesNotMatch(
      swapSentence({
        ...result,
        ...values,
      }),
      /higher|lower/,
    );
  assert.match(
    swapSentence({
      counts: {
        'only-baseline': 0,
        'only-aware': 0,
      },
    }),
    /same zones/,
  );
});
test('local county labels have unique finite anchors within the map', () => {
  const paths = mapPaths(data.zones, data.district);
  const labels = countyLabelAnchors(paths.zones);
  assert.equal(labels.length, new Set(zones.map((z) => z.COUNTY)).size);
  assert.equal(new Set(labels.map((l) => l.county)).size, labels.length);
  for (const label of labels)
    assert.ok(
      Number.isFinite(label.x) &&
        Number.isFinite(label.y) &&
        label.x >= 0 &&
        label.x <= 640 &&
        label.y >= 0 &&
        label.y <= 390,
    );
});
test('benefit copy only claims lower cold exposure when both measures support it', () => {
  for (const record of data.records.filter((r) => r.solved)) {
    const improved =
      record.weighted.h_human < record.baseline.h_human &&
      record.weighted.electric_heat_households < record.baseline.electric_heat_households;
    assert.equal(benefitSentence(record).includes('leaving fewer'), improved);
  }
  assert.ok(data.history.approx_customers_interrupted > 0);
  assert.match(data.history.customers_source_url, /^https:\/\/news\.duke-energy\.com\//);
});
test('responsive map frames contain every original tract point without cropping', () => {
  const paths = mapPaths(data.zones, data.district).zones;
  for (const ratio of [0.8, 1, 1.5, 2, 3.5]) {
    const frame = mapFrame(paths, ratio);
    close(frame.width / frame.height, ratio, 'frame aspect');
    for (const path of paths)
      for (const match of path.d.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)) {
        const x = Number(match[1]),
          y = Number(match[2]);
        assert.ok(
          x > frame.x && x < frame.x + frame.width && y > frame.y && y < frame.y + frame.height,
        );
      }
  }
});
