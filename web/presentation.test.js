import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  awarePlanLabel,
  comparisonDirection,
  objectiveExplanation,
  initialNavigation,
} from './presentation.js';
import { planChanges, swapSentence } from './comparison.js';
import { enrichZones } from './model.js';
const data = JSON.parse(readFileSync(new URL('../public/data/app.json', import.meta.url), 'utf8'));
test(
  'objective labels and outcome directions remain honest across every ' + 'supported priority',
  () => {
    for (const record of data.records.filter((r) => r.solved)) {
      assert.equal(
        awarePlanLabel(record),
        record.alpha === 0 ? 'Business-cost optimized' : 'Vulnerability-aware',
      );
      if (record.alpha === 0)
        assert.match(objectiveExplanation(record), /interruption cost only.*zero weight/);
      for (const metric of ['households', 'electric_heat_households', 'h_human', 'h_econ']) {
        const b = record.baseline[metric],
          w = record.weighted[metric];
        assert.equal(
          comparisonDirection(b, w),
          Math.abs(w - b) < 1e-9 ? 'unchanged' : w > b ? 'higher' : 'lower',
        );
      }
      const changes = planChanges(enrichZones(data), record);
      if (record.alpha === 0) {
        assert.doesNotMatch(swapSentence(changes), /vulnerability-aware/);
        assert.ok(
          Object.values(changes.byId).every((row) => !row.label.includes('vulnerability-aware')),
        );
      }
    }
    assert.equal(comparisonDirection(5, 5), 'unchanged');
    assert.equal(comparisonDirection(0, 1), 'higher');
  },
);
test(
  'county and range deep links migrate to Evidence while explicit Explore ' + 'links stay put',
  () => {
    for (const section of ['counties', 'range'])
      assert.deepEqual(initialNavigation(`?mode=compare&section=${section}`), {
        mode: 'evidence',
        compareTab: 'plans',
        evidenceTab: section,
      });
    assert.equal(initialNavigation('?mode=explore&section=counties').mode, 'explore');
    assert.equal(initialNavigation('?mode=evidence&section=methods').evidenceTab, 'methods');
    assert.equal(initialNavigation('?mode=compare&section=changes').compareTab, 'changes');
    assert.equal(initialNavigation('?mode=unknown').mode, 'compare');
  },
);
