import { CoolingCard } from './CoolingCard.jsx';
import React from 'react';
import { fmt } from '../model.js';
import { DifferencePanel } from '../ComparisonPanels.jsx';
import { MapCanvas, MapLegend } from '../MapCanvas.jsx';
import { ResidentLayer } from '../ResidentLayer.jsx';
import { awarePlanLabel } from '../presentation.js';
export function ComparePlans({
  mode,
  compareTab,
  setCompareTab,
  selectionLabel,
  mobilePlan,
  setMobilePlan,
  record,
  n,
  paths,
  zones,
  layer,
  county,
  protectedVisible,
  boundaryVisible,
  view,
  setView,
  state,
  selectZone,
  zoomSelected,
  mobile,
  counts,
  data,
  changes,
  differenceVisible,
  setDifferenceVisible,
  selectionIds,
  present,
}) {
  return (
    <section
      id="panel-compare"
      role="tabpanel"
      aria-labelledby="tab-compare"
      hidden={mode !== 'compare'}
    >
      <p className="map-task-hint">
        Select an area to see its community profile and save it for preparation.
      </p>
      <div className="mobile-plan-toggle" role="group" aria-label="Displayed plan">
        <button
          aria-pressed={compareTab === 'plans' && mobilePlan === 'typical'}
          onClick={() => {
            setCompareTab('plans');
            setMobilePlan('typical');
          }}
        >
          MW-only
        </button>
        <button
          aria-pressed={compareTab === 'plans' && mobilePlan === 'aware'}
          onClick={() => {
            setCompareTab('plans');
            setMobilePlan('aware');
          }}
        >
          {record.alpha === 0 ? 'Business cost' : 'Aware'}
        </button>
        <button
          className="app-only"
          aria-pressed={compareTab === 'changes'}
          onClick={() => {
            setCompareTab('changes');
            setDifferenceVisible(true);
          }}
        >
          Changes
        </button>
      </div>
      <div
        id="compare-plans"
        role="tabpanel"
        aria-labelledby="compare-tab-plans"
        hidden={compareTab !== 'plans'}
      >
        <div className="compare-layout" data-mobile-plan={mobilePlan}>
          <div>
            <div className="comparison-maps">
              {[
                ['typical', 'Megawatts only', `Typical of ${n} equivalent plans`, record.baseline],
                [
                  'aware',
                  awarePlanLabel(record),
                  record.alpha === 0
                    ? 'Interruption-cost objective only'
                    : 'Same MW band, different priorities',
                  record.weighted,
                ],
              ].map(([id, title, subtitle, plan]) => (
                <article className="compare-map" data-plan={id} key={id}>
                  <div className="compare-map-title">
                    <div>
                      <h2>{title}</h2>
                      <p>{subtitle}</p>
                    </div>
                    <span>{plan.zone_ids.length} zones cut</span>
                  </div>
                  {(!mobile || mobilePlan === id) && (
                    <MapCanvas
                      paths={paths}
                      zones={zones}
                      layer={layer}
                      county={county}
                      protectedVisible={protectedVisible}
                      boundaryVisible={boundaryVisible}
                      view={view}
                      setView={setView}
                      selected={state.zone}
                      selectionIds={selectionIds}
                      selectionLabel={selectionLabel}
                      present={present}
                      onSelect={selectZone}
                      onZoomSelected={zoomSelected}
                      active={
                        mode === 'compare' &&
                        compareTab === 'plans' &&
                        (!mobile || mobilePlan === id)
                      }
                      plan={plan}
                      planLabel={title}
                      id={id}
                      counts={counts}
                      n={n}
                    />
                  )}
                  <div className="compare-map-totals">
                    <strong>
                      {fmt(plan.mw_shed, 1)} MW <small>actual cut</small>
                    </strong>
                    <span>
                      {fmt(plan.households)} homes · {fmt(plan.electric_heat_households)} electric
                      heat
                    </span>
                    <span>
                      ${fmt(plan.h_econ)} · 2013 dollars · {data.config.harm.h_hours} hour
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <MapLegend
              layer={layer}
              compare
              data={data}
              protectedVisible={protectedVisible}
              boundaryVisible={boundaryVisible}
            />
          </div>
        </div>

        <details className="resident-disclosure">
          <summary>Winter outage tips</summary>
          <ResidentLayer places={data.places || []} zones={zones} record={record} />
        </details>
      </div>
      <div
        id="compare-changes"
        role="tabpanel"
        aria-labelledby="compare-tab-changes"
        hidden={compareTab !== 'changes'}
      >
        {compareTab === 'changes' && (
          <DifferencePanel
            changes={changes}
            visible={differenceVisible}
            setVisible={setDifferenceVisible}
            mapProps={{
              active: mode === 'compare' && compareTab === 'changes',
              paths,
              zones,
              layer,
              county,
              protectedVisible,
              boundaryVisible,
              view,
              setView,
              selected: state.zone,
              selectionIds,
              selectionLabel,
              present,
              onSelect: selectZone,
              onZoomSelected: zoomSelected,
              counts,
              n,
            }}
          />
        )}
      </div>
      <CoolingCard cooling={data.node_cooling} />
    </section>
  );
}
