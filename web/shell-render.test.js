import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
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

const NOW = new Date('2026-10-21T20:00:00');
const text = (markup) =>
  markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const noop = () => {};

async function homeProps(overrides = {}) {
  const { readyProgress } = await load('/web/shell/ready.js');
  return {
    now: NOW,
    place: null,
    counts: null,
    device: null,
    progress: readyProgress({}, []),
    onAddPlace: noop,
    onOpenPlace: noop,
    onOpenDevice: noop,
    onOpenReady: noop,
    onCooling: noop,
    onShare: noop,
    ...overrides,
  };
}
test('Home renders with 0 places, 0 devices and a fresh checklist', async () => {
  const { Home } = await load('/web/shell/Home.jsx');
  const out = text(renderToStaticMarkup(h(Home, await homeProps())));
  for (const expected of [
    'Home',
    'Good evening',
    'Add your town',
    '0 of 10 ready',
    'Add place',
    'Start cooling test',
    'Share my plan',
  ])
    assert.ok(out.includes(expected), expected);
  assert.ok(!out.includes('Sample data'));
  assert.ok(out.split(' ').length <= 40, `Home has ${out.split(' ').length} words`);
});
const FIXTURE = {
  device: { id: 'fixture', name: 'Living room' },
  readings: Array.from({ length: 40 }, (_, i) => ({
    t: new Date(NOW.getTime() - (39 - i) * 5 * 60000 - 3 * 60000).toISOString().slice(0, 19),
    temp_f: 67 + i / 40,
  })),
  events: [
    {
      start: '2026-10-20T18:02:00',
      end: '2026-10-20T21:14:00',
      temp_start_f: 71.2,
      temp_end_f: 63.9,
    },
  ],
};
test('Home with a place, a device and checklist progress stays glanceable', async () => {
  const { Home } = await load('/web/shell/Home.jsx');
  const { resolveDevices } = await load('/web/device/deviceData.js');
  const { readyProgress } = await load('/web/shell/ready.js');
  const [device] = resolveDevices(FIXTURE);
  const out = text(
    renderToStaticMarkup(
      h(
        Home,
        await homeProps({
          place: { name: 'Albemarle', geoid: '1', zone_ids: [1, 2] },
          counts: { total: 2, baseline: 2, aware: 0 },
          device,
          progress: readyProgress({}, ['layers', 'charge', 'light']),
        }),
      ),
    ),
  );
  for (const expected of ['Albemarle', '2 areas lose power', 'All stay on', 'Living room', 'of'])
    assert.ok(out.includes(expected), expected);
  assert.ok(!out.includes('Sample'));
  assert.ok(out.split(' ').length <= 70, `Home has ${out.split(' ').length} words`);
});
test('Devices: a clean empty state without data, real rows and outage math with data', async () => {
  const { resolveDevices } = await load('/web/device/deviceData.js');
  const { DevicesTab, DeviceScreen, OutageDetail } = await load('/web/shell/Devices.jsx');
  const render = (el) => text(renderToStaticMarkup(el));
  const empty = render(h(DevicesTab, { devices: [], onOpen: noop, onSetup: noop }));
  for (const expected of ['No device connected yet', 'logs power outages', 'How to set it up'])
    assert.ok(empty.includes(expected), expected);
  const [device] = resolveDevices(FIXTURE);
  const screen = render(h(DeviceScreen, { device, home: true, setHome: noop, onOutage: noop }));
  for (const expected of [
    'Last reading',
    'Power outages',
    '6:02 PM – 9:14 PM',
    '3 h 12 min',
    '−7.3 °F',
  ])
    assert.ok(screen.includes(expected), expected);
  const detail = render(h(OutageDetail, { event: device.events[0] }));
  for (const expected of [
    '3 h 12 min',
    'Power off',
    'Power back',
    '71.2 °F',
    '63.9 °F',
    '7.3 °F',
    '2.3 °F/hour',
    'Recorded by HEARTH Home in this room.',
  ])
    assert.ok(detail.includes(expected), expected);
});
test('no sample or demo device data exists anywhere in the app source', async () => {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  assert.equal(existsSync('web/demo'), false);
  for (const file of walk('web').filter((f) => /\.(jsx?|css)$/.test(f) && !f.includes('.test.')))
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      /Sample data|Demo device|deviceSample|makeSampleDevice/,
      file,
    );
});
test('the router sends phones and the app shell to the tabs, and ?view= to the classic planner', async () => {
  const { usesAppShell } = await load('/web/App.jsx');
  assert.equal(usesAppShell('', true, false), true);
  assert.equal(usesAppShell('', false, true), true);
  assert.equal(usesAppShell('', false, false), false);
  assert.equal(usesAppShell('?view=planner', true, true), false);
});
test('Home shows the need card without health detail, and the official-lists card only when it applies', async () => {
  const { Home } = await load('/web/shell/Home.jsx');
  const { OfficialLists } = await load('/web/household/cards.jsx');
  const { needLevel, officialLists, showsOfficialLists } = await load(
    '/web/household/household.js',
  );
  const answers = { heat: 'electric', medical: 'yes', warm: 'no', backup: ['none'] };
  const render = async (extra) => text(renderToStaticMarkup(h(Home, await homeProps(extra))));
  const none = await render({});
  assert.ok(!none.includes('need') && !none.includes('official lists'));
  const shown = await render({
    level: needLevel(answers),
    answers,
    showLists: showsOfficialLists(answers),
  });
  for (const expected of [
    'Higher need',
    'Electric heat',
    'Medical equipment',
    'No backup',
    'Not a medical or official assessment',
    'Get on the official lists',
  ])
    assert.ok(shown.includes(expected), expected);
  assert.ok(!/oxygen|dialysis|CPAP/i.test(shown));
  const lower = await render({
    level: needLevel({ heat: 'gas', warm: 'easy' }),
    answers: { heat: 'gas', warm: 'easy' },
    showLists: false,
  });
  assert.ok(lower.includes('Lower need') && !lower.includes('official lists'));
  const lists = text(
    renderToStaticMarkup(h(OfficialLists, { rows: officialLists(answers, 'Union County') })),
  );
  for (const expected of [
    'Medically Essential Program',
    'Emergency Access and Functional Needs Registry',
    'NC 211',
    'HEARTH doesn’t sign you up or share your answers',
  ])
    assert.ok(lists.includes(expected), expected);
});

const THIN = new RegExp(`[${String.fromCharCode(0x2009)}${String.fromCharCode(0x202f)}]`);
const ALL_SOURCES = async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  return walk('web')
    .filter((f) => /\.(jsx?|css)$/.test(f))
    .map((f) => [f, readFileSync(f, 'utf8')]);
};
test('numbers use en-US commas everywhere: no thin or narrow spaces in source or rendered output', async () => {
  for (const [file, source] of await ALL_SOURCES())
    assert.ok(!THIN.test(source), `${file} has a thin space`);
  const { CountUp } = await load('/web/ui/CountUp.jsx');
  const { fmt } = await load('/web/model.js');
  const markup = renderToStaticMarkup(h(CountUp, { value: 15910, format: (v) => fmt(v) }));
  assert.ok(markup.includes('15,910') && !THIN.test(markup));
});
test('Home with no town: new heading, the district card from data; with a town: no district card', async () => {
  const { Home } = await load('/web/shell/Home.jsx');
  const { enrichZones, mapPaths } = await load('/web/model.js');
  const { residentRecord } = await load('/web/resident.js');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync('public/data/app.json', 'utf8'));
  const paths = mapPaths(data.zones, data.district);
  const homes = residentRecord(data).baseline.households;
  const render = async (extra) =>
    text(renderToStaticMarkup(h(Home, await homeProps({ paths, districtHomes: homes, ...extra }))));
  const empty = await render({});
  assert.ok(empty.includes('See how your town fared on Christmas Eve 2022'));
  assert.ok(!empty.includes('Is your area safe?'));
  assert.ok(
    empty.includes(
      `In the replay, about ${homes.toLocaleString('en-US')} homes lost power under the usual plan`,
    ),
  );
  assert.equal(homes, 15413);
  const withTown = await render({
    place: { name: 'Albemarle', geoid: '1', zone_ids: [1] },
    counts: { total: 1, baseline: 1, aware: 0 },
  });
  assert.ok(!withTown.includes('In the replay'));
  void enrichZones;
});
test('every tab renders an icon in both states, and the selected icon is filled', async () => {
  const { TabBar, TABS } = await load('/web/shell/TabBar.jsx');
  assert.equal(TABS.length, 5);
  for (const [id] of TABS) {
    const markup = renderToStaticMarkup(h(TabBar, { value: id, onChange: noop }));
    const buttons = markup.split('<button').slice(1);
    assert.equal(buttons.length, 5);
    for (const [index, button] of buttons.entries()) {
      assert.match(button, /<svg/, `tab ${index} has an icon`);
      const selected = TABS[index][0] === id;
      assert.equal(button.includes('aria-selected="true"'), selected);
      assert.equal(
        button.includes('data-filled="true"'),
        selected,
        `tab ${TABS[index][0]} filled when selected`,
      );
      if (selected && TABS[index][0] === 'more')
        assert.ok(
          button.includes('<circle') && /r="2\.6"/.test(button),
          'filled More is solid dots',
        );
    }
  }
});
