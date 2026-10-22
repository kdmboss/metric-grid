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
    '0 of 9 ready',
    'Add place',
    'Start cooling test',
    'Share my plan',
  ])
    assert.ok(out.includes(expected), expected);
  assert.ok(!out.includes('Sample data'));
  assert.ok(out.split(' ').length <= 40, `Home has ${out.split(' ').length} words`);
});
test('Home with a place, a device and checklist progress stays glanceable', async () => {
  const { Home } = await load('/web/shell/Home.jsx');
  const { makeSampleDevice } = await load('/web/demo/deviceSample.js');
  const { readyProgress } = await load('/web/shell/ready.js');
  const device = makeSampleDevice(NOW.getTime());
  const out = text(
    renderToStaticMarkup(
      h(
        Home,
        await homeProps({
          place: { name: 'Albemarle', geoid: '1', zone_ids: [1, 2] },
          counts: { total: 2, baseline: 2, aware: 0 },
          device,
          progress: readyProgress({}, [
            'layers',
            'room',
            'center',
            'charge',
            'light',
            'stove',
            'co',
          ]),
        }),
      ),
    ),
  );
  for (const expected of [
    'Albemarle',
    '2 areas lose power',
    'All stay on',
    'Living room',
    'Sample data',
    '7 of 9 ready',
  ])
    assert.ok(out.includes(expected), expected);
  assert.ok(out.split(' ').length <= 48, `Home has ${out.split(' ').length} words`);
});
test('every sample-derived surface carries the Sample data badge; real devices never do', async () => {
  const { makeSampleDevice } = await load('/web/demo/deviceSample.js');
  const { resolveDevices } = await load('/web/device/deviceData.js');
  const { DeviceRow, DeviceScreen, OutageDetail, OutageRow, DevicesTab } =
    await load('/web/shell/Devices.jsx');
  const sample = makeSampleDevice(NOW.getTime());
  const render = (el) => text(renderToStaticMarkup(el));
  assert.ok(render(h(DeviceRow, { device: sample, onOpen: noop })).includes('Sample data'));
  assert.ok(
    render(h(DevicesTab, { devices: [sample], onOpen: noop, onAdd: noop })).includes('Sample data'),
  );
  assert.ok(
    render(
      h(DeviceScreen, {
        device: sample,
        home: false,
        setHome: noop,
        onOutage: noop,
        onCooling: noop,
      }),
    ).includes('Sample data'),
  );
  assert.ok(sample.events.length > 0);
  for (const event of sample.events) {
    assert.ok(
      render(h(OutageRow, { event, device: sample, onOpen: noop })).includes('Sample data'),
    );
    assert.ok(render(h(OutageDetail, { device: sample, event })).includes('Sample data'));
  }
  const real = resolveDevices(
    {
      device: { name: 'Hall' },
      readings: [
        { t: '2026-10-21T19:55:00', temp_f: 66.4 },
        { t: '2026-10-21T19:50:00', temp_f: 66.2 },
      ],
      events: [
        {
          start: '2026-10-20T03:00:00',
          end: '2026-10-20T04:00:00',
          temp_start_f: 67,
          temp_end_f: 65,
        },
      ],
    },
    NOW.getTime(),
  )[0];
  assert.equal(real.sample, false);
  assert.ok(!render(h(DeviceRow, { device: real, onOpen: noop })).includes('Sample data'));
  assert.ok(
    !render(
      h(DeviceScreen, { device: real, home: true, setHome: noop, onOutage: noop, onCooling: noop }),
    ).includes('Sample data'),
  );
  const detail = render(h(OutageDetail, { device: real, event: real.events[0] }));
  assert.ok(!detail.includes('Sample data'));
  assert.ok(detail.includes('Recorded by HEARTH Home in this room.'));
});
test('the router sends phones and the app shell to the tabs, and ?view= to the classic planner', async () => {
  const { usesAppShell } = await load('/web/App.jsx');
  assert.equal(usesAppShell('', true, false), true);
  assert.equal(usesAppShell('', false, true), true);
  assert.equal(usesAppShell('', false, false), false);
  assert.equal(usesAppShell('?view=planner', true, true), false);
});
