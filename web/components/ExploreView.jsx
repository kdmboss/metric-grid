import { Arrow } from './Arrow.jsx';
import React from 'react';
import { Badge, Status } from '../Evidence.jsx';
import { locate, status } from '../model.js';
import { LAYERS, MapCanvas, MapLegend } from '../MapCanvas.jsx';
import { awarePlanLabel } from '../presentation.js';
import { ZoneDetail } from './ZoneDetail.jsx';
import { PriorityTable } from './PriorityTable.jsx';
export function ExploreView({
  mode,
  layer,
  paths,
  zones,
  county,
  protectedVisible,
  boundaryVisible,
  view,
  setView,
  state,
  selectZone,
  zoomSelected,
  counts,
  n,
  data,
  detailProps,
  zone,
  setSheetOpen,
  setShowAllPriority,
  showAllPriority,
  record,
  priority,
  setMode,
  plan,
  addZone,
}) {
  return (
    <section
      id="panel-explore"
      role="tabpanel"
      aria-labelledby="tab-explore"
      hidden={mode !== 'explore'}
    >
      <div className="explore-layout">
        <div className="geography">
          <div className="canvas-heading">
            <div>
              <h2>Who lives here?</h2>
              <p>Explore the communities behind the comparison.</p>
            </div>
            <Badge>{LAYERS[layer].name}</Badge>
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
            active={mode === 'explore'}
            id="explore"
            counts={counts}
            n={n}
          />
          <MapLegend
            layer={layer}
            data={data}
            protectedVisible={protectedVisible}
            boundaryVisible={boundaryVisible}
          />
        </div>
        <ZoneDetail {...detailProps} id="zone" />
        <button
          className="button mobile-zone-open"
          disabled={!zone}
          onClick={() => setSheetOpen(true)}
        >
          Inspect selected zone {zone?.zone_id}
        </button>
      </div>{' '}
      <PriorityTable
        setShowAllPriority={setShowAllPriority}
        showAllPriority={showAllPriority}
        record={record}
        priority={priority}
        selectZone={selectZone}
        setMode={setMode}
        counts={counts}
        n={n}
        plan={plan}
        addZone={addZone}
      />
      <details className="details examples-disclosure">
        <summary>Explore the example public buildings</summary>
        <div className="example-locations">
          {data.config.example_locations.map((location) => {
            function _handleClick() {
              selectZone(id);
              setMode('explore');
              document.getElementById('workspace').scrollIntoView();
            }
            const id = locate(data.zones.features, [location.lon, location.lat]),
              z = zones.find((z) => z.zone_id === id);
            return (
              <article key={location.label}>
                <h3>{location.label}</h3>
                {z && (
                  <>
                    <button className="zone-link" onClick={_handleClick}>
                      Inspect zone {id} <Arrow direction="right" />
                    </button>
                    <p>
                      Megawatts only <Status value={status(z, record.baseline)} /> ·{' '}
                      {awarePlanLabel(record)} <Status value={status(z, record.weighted)} />
                    </p>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </details>
    </section>
  );
}
