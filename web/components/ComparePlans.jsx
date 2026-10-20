import React from 'react';
import { fmt } from '../model.js';
import { DifferencePanel } from '../ComparisonPanels.jsx';
import { MapCanvas, MapLegend } from '../MapCanvas.jsx';
import { ResidentLayer } from '../ResidentLayer.jsx';
import { awarePlanLabel } from '../presentation.js';
import { ZoneDetail } from './ZoneDetail.jsx';
export function ComparePlans({
  mode,
  compareTab,
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
  detailProps,
  zone,
  setSheetOpen,
  changes,
  differenceVisible,
  setDifferenceVisible,
}) {
  return (
    <section
      id="panel-compare"
      role="tabpanel"
      aria-labelledby="tab-compare"
      hidden={mode !== 'compare'}
    >
      <div
        id="compare-plans"
        role="tabpanel"
        aria-labelledby="compare-tab-plans"
        hidden={compareTab !== 'plans'}
      >
        <div className="mobile-plan-toggle" role="group" aria-label="Displayed plan">
          <button aria-pressed={mobilePlan === 'typical'} onClick={() => setMobilePlan('typical')}>
            MW-only
          </button>
          <button aria-pressed={mobilePlan === 'aware'} onClick={() => setMobilePlan('aware')}>
            {record.alpha === 0 ? 'Business cost' : 'Vulnerability-aware'}
          </button>
        </div>
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
                    onSelect={selectZone}
                    onZoomSelected={zoomSelected}
                    active={
                      mode === 'compare' && compareTab === 'plans' && (!mobile || mobilePlan === id)
                    }
                    plan={plan}
                    planLabel={title}
                    id={id}
                    counts={counts}
                    n={n}
                  />
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
          <ZoneDetail {...detailProps} id="compare-zone" />
          <button
            className="button mobile-zone-open"
            disabled={!zone}
            onClick={() => setSheetOpen(true)}
          >
            Inspect selected zone {zone?.zone_id}
          </button>
        </div>

        <details className="resident-disclosure">
          <summary>Area lookup & winter tips</summary>
          <ResidentLayer places={data.places || []} zones={zones} record={record} />
        </details>
      </div>
      <div
        id="compare-changes"
        role="tabpanel"
        aria-labelledby="compare-tab-changes"
        hidden={compareTab !== 'changes'}
      >
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
            onSelect: selectZone,
            onZoomSelected: zoomSelected,
            counts,
            n,
          }}
        />
      </div>
    </section>
  );
}
