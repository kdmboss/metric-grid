import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  deleteHousehold,
  HOUSEHOLD_KEY,
  householdSummary,
  loadHousehold,
  needLevel,
  needReasons,
  officialLists,
  QUESTIONS,
  saveHousehold,
  showsOfficialLists,
} from './household/household.js';
import { COUNTY_REGISTRIES, registryFor } from './data/registries.js';
import { readJSON } from './shell/store.js';

function fakeStorage() {
  const data = new Map();
  globalThis.localStorage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    key: (i) => [...data.keys()][i],
    get length() {
      return data.size;
    },
  };
  return data;
}
test('there are six optional questions and "prefer not to say" exists for the sensitive ones', () => {
  assert.equal(QUESTIONS.length, 6);
  for (const key of ['medical', 'help']) {
    const q = QUESTIONS.find((x) => x.key === key);
    assert.ok(
      q.options.some(([value]) => value === 'skip'),
      key,
    );
  }
  assert.equal(QUESTIONS.find((q) => q.key === 'backup').multi, true);
});
test('need-level rule', () => {
  assert.equal(needLevel({}), null);
  assert.equal(needLevel({ medical: 'yes' }), 'higher');
  assert.equal(needLevel({ heat: 'electric', warm: 'no' }), 'higher');
  assert.equal(needLevel({ help: 'yes', warm: 'no' }), 'higher');
  assert.equal(needLevel({ heat: 'electric', warm: 'easy' }), 'some');
  assert.equal(needLevel({ help: 'yes' }), 'some');
  assert.equal(needLevel({ past: 'h1to4' }), 'some');
  assert.equal(needLevel({ past: 'gt4' }), 'some');
  assert.equal(needLevel({ warm: 'no' }), 'some');
  assert.equal(needLevel({ backup: ['none'] }), 'some');
  assert.equal(
    needLevel({
      heat: 'gas',
      medical: 'no',
      help: 'no',
      past: 'never',
      warm: 'easy',
      backup: ['generator'],
    }),
    'lower',
  );
  // "Prefer not to say" and "Not sure" never raise the level.
  assert.equal(
    needLevel({ heat: 'unsure', medical: 'skip', help: 'skip', past: 'unsure', warm: 'unsure' }),
    'lower',
  );
  assert.deepEqual(
    needReasons({ heat: 'electric', medical: 'yes', past: 'gt4', backup: ['none'] }),
    ['Electric heat', 'Medical equipment', 'Long past outages', 'No backup'],
  );
  assert.deepEqual(needReasons({ medical: 'skip' }), []);
});
test('the official-lists card shows only for medical equipment or 65+/needs help, with verified entries only', () => {
  assert.equal(showsOfficialLists({ medical: 'yes' }), true);
  assert.equal(showsOfficialLists({ help: 'yes' }), true);
  for (const a of [
    {},
    { medical: 'no', help: 'no' },
    { medical: 'skip', help: 'skip' },
    { heat: 'electric', warm: 'no' },
  ])
    assert.deepEqual(officialLists(a, 'Union County'), []);
  const union = officialLists({ medical: 'yes' }, 'Union County');
  assert.deepEqual(
    union.map((r) => r.id),
    ['duke', 'county', '211'],
  );
  assert.equal(union[0].title, 'Medically Essential Program');
  assert.match(union[0].detail, /does not speed up restoration/);
  // Counties with no verified page get no county row; nothing is invented.
  for (const county of ['Stanly County', 'Anson County', null])
    assert.deepEqual(
      officialLists({ help: 'yes' }, county).map((r) => r.id),
      ['duke', '211'],
    );
  // Every entry is an https link on an official domain and carries a source comment in the table.
  const source = readFileSync(new URL('./data/registries.js', import.meta.url), 'utf8');
  for (const [county, entry] of Object.entries(COUNTY_REGISTRIES)) {
    assert.match(entry.url, /^https:\/\/[^ ]+$/);
    assert.match(
      new URL(entry.url).hostname,
      /(\.gov|richmondnc\.com|scotlandcounty\.org|cabarruscounty\.us)$/,
      county,
    );
    assert.ok(source.includes(entry.url));
    assert.ok(registryFor(county));
  }
  assert.equal(Object.keys(COUNTY_REGISTRIES).length, 7);
  assert.equal(
    readFileSync(new URL('./data/registries.js', import.meta.url), 'utf8').split('// ').length > 7,
    true,
  );
});
test('"Delete my answers" clears storage; answers round-trip locally', () => {
  const data = fakeStorage();
  saveHousehold({ answers: { medical: 'yes', heat: 'electric' }, completed: true });
  assert.ok(data.has(HOUSEHOLD_KEY));
  assert.deepEqual(loadHousehold().answers, { medical: 'yes', heat: 'electric' });
  const cleared = deleteHousehold();
  assert.deepEqual(cleared, { answers: {}, completed: false });
  assert.equal(data.has(HOUSEHOLD_KEY), false);
  assert.equal(readJSON(HOUSEHOLD_KEY, null), null);
  assert.deepEqual(loadHousehold().answers, {});
  // Corrupt storage never throws.
  data.set(HOUSEHOLD_KEY, '{not json');
  assert.deepEqual(loadHousehold().answers, {});
});
test('no network call is made with survey data, and the survey code has no network primitives', () => {
  fakeStorage();
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (...args) => {
    calls.push(args);
    return Promise.resolve({ ok: true });
  };
  try {
    const answers = {
      heat: 'electric',
      medical: 'yes',
      help: 'yes',
      past: 'gt4',
      warm: 'no',
      backup: ['none'],
    };
    saveHousehold({ answers, completed: true });
    loadHousehold();
    needLevel(answers);
    needReasons(answers);
    officialLists(answers, 'Union County');
    householdSummary(answers, 'Albemarle');
    deleteHousehold();
    assert.deepEqual(calls, []);
  } finally {
    globalThis.fetch = realFetch;
  }
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  for (const file of walk('web/household'))
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.share/,
      `${file} must not touch the network`,
    );
});
test('the share summary is plain text built only from the answers the user gave', () => {
  const text = householdSummary(
    { heat: 'electric', medical: 'skip', backup: ['battery', 'generator'] },
    'Albemarle',
  );
  assert.match(text, /^My household \(from HEARTH/);
  assert.match(text, /Town: Albemarle/);
  assert.match(text, /Electric/);
  assert.match(text, /Power bank or batteries, Generator/);
  assert.doesNotMatch(text, /oxygen/i);
  assert.match(text, /Not a medical or official assessment/);
});
