import { Arrow } from './components/Arrow.jsx';
import { awarePlanLabel } from './presentation.js';
import React, { useMemo, useState } from 'react';
import { Status } from './Evidence.jsx';
import { fmt, status } from './model.js';
export function ResidentLayer({ places, zones, record }) {
  function _handleChange(event) {
    setQuery(event.target.value);
    setSelectedId('');
  }
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const byZone = useMemo(() => new Map(zones.map((zone) => [zone.zone_id, zone])), [zones]);
  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (q.length < 2) return [];
    return places.filter((place) => place.name.toLocaleLowerCase().includes(q)).slice(0, 10);
  }, [places, query]);
  const selected = places.find((place) => place.geoid === selectedId);
  const rows = selected?.zone_ids.map((id) => byZone.get(id)).filter(Boolean) || [];
  return (
    <section className="resident-layer" aria-label="Resident information">
      <div className="resident-area" data-area-lookup-card>
        <div className="resident-heading">
          <span className="workspace-kicker">For residents and neighbors</span>
          <h2>Check your area</h2>
          <p>
            Search a town or Census place to see how its census-tract zones appear in the current
            planning scenarios.
          </p>
        </div>
        <label htmlFor="place-search">Town or place name</label>
        <div className="resident-search">
          <input
            id="place-search"
            type="search"
            disabled={!places.length}
            placeholder="Start typing a town…"
            autoComplete="off"
            value={query}
            onChange={_handleChange}
            aria-controls="place-results"
            aria-expanded={matches.length > 0}
          />
          {matches.length > 0 && (
            <div
              id="place-results"
              className="place-results"
              role="listbox"
              aria-label="Matching Census places"
            >
              {matches.map((place) => {
                function _handleClick() {
                  setSelectedId(place.geoid);
                  setQuery(place.name);
                }
                return (
                  <button
                    key={place.geoid}
                    type="button"
                    role="option"
                    aria-selected={selectedId === place.geoid}
                    onClick={_handleClick}
                  >
                    {place.name}
                    <span>
                      {[
                        ...new Set(
                          place.zone_ids
                            .map((id) => byZone.get(id)?.COUNTY?.replace(/ County$/, ''))
                            .filter(Boolean),
                        ),
                      ].join(', ')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {selected && (
          <div className="resident-result" aria-live="polite">
            <div className="resident-result-heading">
              <strong>{selected.name}</strong>
              <span>
                {rows.length} {rows.length === 1 ? 'census tract zone' : 'census tract zones'}
              </span>
            </div>
            <p>
              This place overlaps the zones below. A zone result does not tell you whether a
              particular home would lose power.
            </p>
            <div className="resident-zone-list">
              {rows.map((zone) => (
                <article key={zone.zone_id}>
                  <div>
                    <strong>Zone {zone.zone_id}</strong>
                    <span>{zone.COUNTY.replace(/ County$/, '')}</span>
                  </div>
                  <div>
                    <span>Megawatts only</span>
                    <Status value={status(zone, record.baseline)} />
                  </div>
                  <div>
                    <span>{awarePlanLabel(record)}</span>
                    <Status value={status(zone, record.weighted)} />
                  </div>
                  <div>
                    <span>Households</span>
                    <strong>{fmt(zone.occupied_units)}</strong>
                  </div>
                  <div>
                    <span>Homes using electric heat</span>
                    <strong>
                      {zone.share_electric_heat == null
                        ? 'No data'
                        : `${fmt(zone.share_electric_heat * 100)}%`}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        {places.length === 0 && (
          <p className="resident-unavailable">
            Town lookup is currently unavailable. Explore lets you inspect census tract zones.
          </p>
        )}
        <p className="resident-disclaimer" data-area-disclaimer>
          A modeled planning scenario, not a prediction for your home.
        </p>
      </div>
      <aside className="winter-ready" aria-labelledby="winter-ready-title">
        <span className="workspace-kicker">A few steps before a storm</span>
        <h2 id="winter-ready-title">Get ready for a winter outage</h2>
        <ul>
          <li>Gather warm layers and blankets; plan to stay in one room.</li>
          <li>Charge phones and power banks before severe weather arrives.</li>
          <li>Check on older neighbors and anyone who may need help.</li>
          <li>Never use a stove, oven, or grill to heat your home.</li>
          <li>Run generators outdoors only, away from windows and doors.</li>
        </ul>
        <div className="preparedness-links">
          <a href="https://www.readync.gov/winter-weather" target="_blank" rel="noreferrer">
            ReadyNC winter weather <Arrow direction="external" />
          </a>
          <a href="https://www.ready.gov/winter-weather" target="_blank" rel="noreferrer">
            Ready.gov winter weather <Arrow direction="external" />
          </a>
        </div>
      </aside>
    </section>
  );
}
