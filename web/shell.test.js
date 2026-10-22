import test from 'node:test';
import assert from 'node:assert/strict';
import { readyItems, readyProgress, SETUP_STEPS } from './shell/ready.js';

test('ready checklist adapts to setup answers and reports progress', () => {
  const base = readyItems({});
  assert.equal(base.length, 9);
  const tailored = readyItems({ backup: 'generator', people: ['medical', 'pets'] });
  assert.equal(tailored.length, 13);
  assert.ok(tailored.some((i) => i.id === 'outdoors'));
  const progress = readyProgress({}, ['layers', 'room']);
  assert.deepEqual([progress.done, progress.total, progress.next.id], [2, 9, 'center']);
  assert.equal(
    readyProgress(
      {},
      base.map((i) => i.id),
    ).next,
    null,
  );
  assert.equal(SETUP_STEPS.length, 3);
});
