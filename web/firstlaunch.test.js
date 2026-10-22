import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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
const text = (markup) =>
  markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const noop = () => {};
async function props(extra = {}) {
  const { enrichZones, mapPaths } = await load('/web/model.js');
  const { residentRecord } = await load('/web/resident.js');
  return {
    places: data.places,
    zones: enrichZones(data),
    record: residentRecord(data),
    paths: mapPaths(data.zones, data.district),
    onPlace: noop,
    onDone: noop,
    onPlanner: noop,
    ...extra,
  };
}
test('the welcome screen shows only on first launch', async () => {
  const { isFirstLaunch } = await load('/web/household/Onboarding.jsx');
  assert.equal(isFirstLaunch(undefined), true);
  assert.equal(isFirstLaunch(false), true);
  assert.equal(isFirstLaunch(null), true);
  assert.equal(isFirstLaunch(true), false);
  const { Onboarding } = await load('/web/household/Onboarding.jsx');
  const out = text(renderToStaticMarkup(h(Onboarding, await props())));
  for (const expected of [
    'HEARTH',
    'Know who loses power before the next winter storm.',
    'See how your town fared on Christmas Eve 2022',
    'Get a winter plan built for your household',
    'Track how fast your home gets cold',
    'Get started',
    'I plan for a county →',
    'Modeled on public data · Your answers stay on this phone',
  ])
    assert.ok(out.includes(expected), expected);
  const markup = renderToStaticMarkup(h(Onboarding, await props()));
  assert.equal((markup.match(/class="thumb-tract/g) || []).length, data.zones.features.length);
});
test('"I plan for a county" skips the check-in and lands on the Map', async () => {
  const { onboardingOutcome } = await load('/web/household/Onboarding.jsx');
  assert.deepEqual(onboardingOutcome('planner'), {
    onboarded: true,
    tab: 'map',
    saveAnswers: false,
  });
  assert.deepEqual(onboardingOutcome('checkin'), {
    onboarded: true,
    tab: 'home',
    saveAnswers: true,
  });
});
test('"Add your town": popular chips come from the data, with the new copy and step count', async () => {
  const { Onboarding } = await load('/web/household/Onboarding.jsx');
  const { popularTowns } = await load('/web/county/county.js');
  const p = await props();
  const out = text(renderToStaticMarkup(h(Onboarding, { ...p, initialStage: 'town' })));
  for (const expected of [
    'Back',
    '1 of 7',
    'Add your town',
    'We’ll show whether the usual plan would have cut power there.',
    'Popular in NC-08',
    'Skip',
  ])
    assert.ok(out.includes(expected), expected);
  const names = popularTowns(p.places, p.zones).map((x) => x.name);
  assert.equal(names.length, 8);
  for (const name of names) assert.ok(out.includes(name), name);
  // Other data, other chips: nothing is hard-coded.
  const places = [{ geoid: 'x', name: 'Testville', zone_ids: [p.zones[0].zone_id] }];
  const other = text(renderToStaticMarkup(h(Onboarding, { ...p, places, initialStage: 'town' })));
  assert.ok(other.includes('Testville'));
  assert.ok(
    !names.some((name) => other.includes(name)) || names.every((name) => name === 'Testville'),
  );
});
