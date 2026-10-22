import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { Segmented } from '../ui/Segmented.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { CountUp } from '../ui/CountUp.jsx';
import { MapCanvas, MapLegend } from '../MapCanvas.jsx';
import { DetentSheet } from '../components/DetentSheet.jsx';
import { PeopleResults } from '../components/PeopleResults.jsx';
import { ScenarioControls } from '../components/ScenarioControls.jsx';
import { change, fmt, signed } from '../model.js';
import { priorityName } from '../planning.js';
import { SPRING_SOFT } from '../ui/springs.js';

function KpiRow({ record }) {
  const b = record.baseline,
    w = record.weighted,
    human = change(b.h_human, w.h_human),
    homes = w.households - b.households;
  return (
    <div className="kpi-row" aria-live="polite">
      <div>
        <strong>
          <CountUp value={w.electric_heat_households} format={(v) => fmt(v)} />
        </strong>
        <span>Electric-heat homes</span>
      </div>
      <div>
        <strong>
          <CountUp value={Math.abs(human)} format={(v) => fmt(v, Math.abs(human) < 1 ? 1 : 0)} />%
        </strong>
        <span>Weighted impact</span>
      </div>
      <div>
        <strong>
          <CountUp
            value={homes}
            format={(v) => (Math.round(v) === 0 ? '0' : signed(Math.round(v)))}
          />
        </strong>
        <span>Total homes</span>
      </div>
    </div>
  );
}
/** The simulator, visual first: a full-bleed map with floating controls. Details are one sheet away. */
export function MapTab({ workspace: w, views, zoneOpen, hidePill }) {
  const [controls, setControls] = useState(false);
  const [detent, setDetent] = useState('peek');
  const record = w.record;
  const planKey = w.compareTab === 'changes' ? 'changes' : w.mobilePlan;
  const isChanges = planKey === 'changes';
  const plan = planKey === 'aware' ? record.weighted : record.baseline;
  const planLabel = planKey === 'aware' ? 'People-first' : 'Megawatts only';
  const mapProps = {
    paths: w.paths,
    zones: w.zones,
    layer: w.layer,
    county: w.county,
    protectedVisible: w.protectedVisible,
    boundaryVisible: w.boundaryVisible,
    view: w.view,
    setView: w.setView,
    selected: w.state.zone,
    selectionIds: w.selectedPlace?.zone_ids || [],
    selectionLabel: w.selectedPlace?.name || '',
    present: w.present,
    onSelect: w.selectZone,
    onZoomSelected: w.zoomSelected,
    active: true,
    counts: w.counts,
    n: w.n,
    id: 'map',
  };
  return (
    <div className="map-screen">
      <MapCanvas {...mapProps} {...(isChanges ? { changes: w.changes } : { plan, planLabel })} />
      <div className="map-float-top">
        <Segmented
          label="Displayed plan"
          value={planKey}
          onChange={(key) => {
            if (key === 'changes') {
              w.setCompareTab('changes');
              w.setDifferenceVisible(true);
            } else {
              w.setCompareTab('plans');
              w.setMobilePlan(key);
            }
          }}
          items={[
            ['typical', 'MW-only'],
            ['aware', record.alpha === 0 ? 'Business cost' : 'People-first'],
            ['changes', 'Changes'],
          ]}
        />
      </div>
      <AnimatePresence>
        {!zoneOpen && !hidePill && detent === 'peek' && (
          <motion.button
            type="button"
            className="map-pill"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={SPRING_SOFT}
            onClick={() => setControls(true)}
            aria-haspopup="dialog"
          >
            <span>
              {fmt(record.target_mw, 0)} MW cut · {priorityName(record.alpha)}
            </span>
            <Icon name="down" size={18} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!zoneOpen && !hidePill && (
          <DetentSheet
            key="kpi"
            label="Scenario results"
            peek={124}
            onDetent={setDetent}
            header={<KpiRow record={record} />}
          >
            <PeopleResults record={record} />
            <MapLegend
              layer={w.layer}
              compare
              data={w.data}
              protectedVisible={w.protectedVisible}
              boundaryVisible={w.boundaryVisible}
            />
          </DetentSheet>
        )}
      </AnimatePresence>
      <ModalSheet
        open={controls}
        onClose={() => setControls(false)}
        title="Scenario"
        className="scenario-sheet"
      >
        <div className="ios-sheet-list">
          <ScenarioControls {...views.ScenarioControls} />
        </div>
      </ModalSheet>
    </div>
  );
}
