import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIES,
  enabledCategories,
  readyItems,
  readyProgress,
  readyStatus,
  SETUP_STEPS,
} from './shell/ready.js';

test('ready checklist adapts to setup answers and reports progress', () => {
  assert.equal(readyItems({}).length, 10);
  assert.equal(readyItems({ heat: 'electric' }).length, 12);
  assert.equal(readyItems({ heat: 'electric', medical: 'yes', people: ['kids'] }).length, 16);
  const progress = readyProgress({}, ['layers', 'charge']);
  assert.deepEqual([progress.done, progress.total, progress.next.id], [2, 10, 'light']);
  assert.equal(
    readyProgress(
      {},
      readyItems({}).map((i) => i.id),
    ).next,
    null,
  );
  assert.equal(SETUP_STEPS.length, 3);
});
test('conditional categories appear only when the setup answers enable them', () => {
  const ids = (a) => enabledCategories(a).map(([id]) => id);
  assert.deepEqual(ids({}), ['before', 'out', 'after']);
  assert.deepEqual(ids({ heat: 'electric' }), ['before', 'out', 'heat', 'after']);
  assert.deepEqual(ids({ medical: 'yes' }), ['before', 'out', 'medical', 'after']);
  assert.equal(CATEGORIES.length, 5);
});
test('copy limits: titles at most 6 words, why lines at most 10, no paragraphs', () => {
  for (const item of readyItems({ heat: 'electric', medical: 'yes', people: ['kids', 'pets'] })) {
    assert.ok(item.title.split(' ').length <= 6, item.title);
    assert.ok(item.why.split(' ').length <= 10, item.why);
  }
});
test('status text follows progress', () => {
  assert.equal(readyStatus({ done: 0, total: 12 }), 'Let’s get started');
  assert.equal(readyStatus({ done: 4, total: 12 }), 'Keep going');
  assert.equal(readyStatus({ done: 9, total: 12 }), 'Almost ready');
  assert.equal(readyStatus({ done: 12, total: 12 }), 'You’re ready');
});
