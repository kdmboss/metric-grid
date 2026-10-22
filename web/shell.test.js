import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIES,
  enabledCategories,
  readyItems,
  readyProgress,
  readyStatus,
} from './shell/ready.js';

const ids = (a) => enabledCategories(a).map(([id]) => id);
test('ready checklist adapts to household answers and reports progress', () => {
  assert.equal(readyItems({}).length, 10);
  assert.equal(readyItems({ heat: 'electric' }).length, 12);
  assert.equal(readyItems({ heat: 'electric', medical: 'yes' }).length, 15);
  assert.equal(readyItems({ heat: 'electric', medical: 'yes', help: 'yes' }).length, 17);
  const progress = readyProgress({}, ['layers', 'charge']);
  assert.deepEqual([progress.done, progress.total, progress.next.id], [2, 10, 'light']);
  assert.equal(
    readyProgress(
      {},
      readyItems({}).map((i) => i.id),
    ).next,
    null,
  );
});
test('which checklist categories turn on for each answer combination, most important first', () => {
  assert.deepEqual(ids({}), ['before', 'out', 'after']);
  assert.deepEqual(ids({ heat: 'gas', medical: 'no', help: 'no', warm: 'easy' }), [
    'before',
    'out',
    'after',
  ]);
  assert.deepEqual(ids({ heat: 'electric' }), ['heat', 'before', 'out', 'after']);
  assert.deepEqual(ids({ medical: 'yes' }), ['medical', 'before', 'out', 'after']);
  assert.deepEqual(ids({ help: 'yes' }), ['help', 'before', 'out', 'after']);
  assert.deepEqual(ids({ warm: 'no' }), ['help', 'before', 'out', 'after']);
  assert.deepEqual(ids({ heat: 'electric', medical: 'yes', help: 'yes' }), [
    'medical',
    'help',
    'heat',
    'before',
    'out',
    'after',
  ]);
  assert.deepEqual(ids({ medical: 'skip', help: 'skip' }), ['before', 'out', 'after']);
  assert.equal(CATEGORIES.length, 6);
  // The next item to do follows the most important category.
  assert.equal(readyProgress({ medical: 'yes' }, []).next.cat, 'medical');
});
test('copy limits: titles at most 6 words, why lines at most 10, no paragraphs', () => {
  for (const item of readyItems({ heat: 'electric', medical: 'yes', help: 'yes' })) {
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
