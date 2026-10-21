import { LogoMark } from './components/LogoMark.jsx';
import { InterfaceIcon } from './components/InterfaceIcon.jsx';
import React, { useMemo, useState } from 'react';
import { enrichZones, mapPaths } from './model.js';
import { HOME_VIEW, fitPaths } from './mapGeometry.js';
import { residentRecord } from './resident.js';
import { MapCanvas } from './MapCanvas.jsx';
import { TownLookup } from './components/TownLookup.jsx';
import { ResidentLayer } from './ResidentLayer.jsx';
import { StandaloneHeader } from './components/StandaloneHeader.jsx';
import { CoolingCard } from './components/CoolingCard.jsx';
import { useAppShell } from './hooks/useAppShell.js';
export function ResidentView({ data, choose, switchView }) {
  const { standalone, scrolled } = useAppShell();
  const record = useMemo(() => residentRecord(data), [data]);
  const zones = useMemo(() => enrichZones(data), [data]);
  const paths = useMemo(() => mapPaths(data.zones, data.district), [data]);
  const [place, setPlace] = useState(null),
    [view, setView] = useState(HOME_VIEW),
    [zone, setZone] = useState(0);
  function pick(next) {
    setPlace(next);
    setZone(0);
    const fitted = fitPaths(paths.zones.filter((z) => next.zone_ids.includes(z.zone_id)));
    setView({
      scale: fitted.scale / 1.25,
      x: 320 - (320 - fitted.x) / 1.25,
      y: 195 - (195 - fitted.y) / 1.25,
    });
  }
  function clear() {
    setPlace(null);
    setZone(0);
    setView(HOME_VIEW);
  }
  return (
    <div className={`planning-app resident-app ${standalone ? 'is-standalone' : ''}`}>
      {standalone ? (
        <StandaloneHeader scrolled={scrolled} mode="my area" onSwitchView={switchView} />
      ) : (
        <header className="resident-header">
          <strong className="hearth-wordmark">
            <LogoMark />
            HEARTH
          </strong>
          <details className="native-menu">
            <summary aria-label="App options">
              <InterfaceIcon name="more" />
            </summary>
            <div className="menu-content">
              <button onClick={switchView}>Switch view</button>
            </div>
          </details>
        </header>
      )}
      <main className="resident-main">
        <h1>Check your area.</h1>
        <p>Find your town and get ready for winter outages.</p>
        <TownLookup
          places={data.places || []}
          zones={zones}
          record={record}
          selected={place}
          onPick={pick}
          onClear={clear}
          resident
        />
        {place && (
          <section className="resident-map-card" aria-label="Town planning context">
            <h2>{place.name}</h2>
            <MapCanvas
              paths={paths}
              zones={zones}
              layer="vulnerability"
              county=""
              protectedVisible
              boundaryVisible
              view={view}
              setView={setView}
              selected={zone}
              onSelect={setZone}
              id="resident"
              selectionIds={place.zone_ids}
              selectionLabel={place.name}
              active
            />
            <div className="resident-legend" aria-label="Map legend">
              <span>Lighter = lower vulnerability</span>
              <span>Darker = higher</span>
              <span>
                <i className="swatch hatch" aria-hidden="true" />
                Has a critical facility (stays on)
              </span>
            </div>
          </section>
        )}
        <ResidentLayer />
        <CoolingCard cooling={data.node_cooling} />
        <button className="text-button resident-planner-link" onClick={() => choose('planner')}>
          See the full planning tool →
        </button>
      </main>
    </div>
  );
}
