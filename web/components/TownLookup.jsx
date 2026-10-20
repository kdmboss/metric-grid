import React, { useState } from 'react';
import { Status } from './EvidencePrimitives.jsx';
import { status, fmt } from '../model.js';
import { awarePlanLabel } from '../presentation.js';

export function townSummary(place, record) {
  const count = (plan) => place.zone_ids.filter((id) => plan.zone_ids.includes(id)).length;
  return (
    `${place.name}: ${place.zone_ids.length} areas · ${count(record.baseline)} cut in MW-only plan · ` +
    `${count(record.weighted)} cut in ${awarePlanLabel(record).toLowerCase()} plan`
  );
}
export function TownLookup({ places, zones, record, selected, onPick, onClear }) {
  const [query, setQuery] = useState(''),
    [searching, setSearching] = useState(false);
  const matches =
    query.trim().length > 1
      ? places.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 10)
      : [];
  function change(event) {
    setQuery(event.target.value);
    setSearching(true);
  }
  function keyboard(event) {
    if (event.key === 'Escape') setSearching(false);
    if (event.key === 'Enter' && matches.length) {
      choose(matches[0]);
    }
  }
  function choose(place) {
    setQuery(place.name);
    setSearching(false);
    onPick(place);
  }
  return (
    <section className="town-lookup" aria-label="Check your area" data-area-lookup-card>
      <div className="town-search-row">
        <label htmlFor="place-search">Find your area</label>
        <div className="resident-search">
          <input
            id="place-search"
            type="search"
            placeholder="Town or place…"
            autoComplete="off"
            value={query}
            onChange={change}
            onFocus={() => setSearching(true)}
            onKeyDown={keyboard}
            disabled={!places.length}
            aria-controls="place-results"
            aria-expanded={searching && matches.length > 0}
          />
          {searching && matches.length > 0 && (
            <div
              id="place-results"
              className="place-results"
              role="listbox"
              aria-label="Matching Census places"
            >
              {matches.map((place) => (
                <button
                  key={place.geoid}
                  role="option"
                  aria-selected={selected?.geoid === place.geoid}
                  onClick={() => choose(place)}
                >
                  {place.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <button className="text-button" onClick={onClear}>
            Clear town
          </button>
        )}
      </div>
      {!places.length && <p role="status">Place search could not load; try Explore.</p>}
      {selected && (
        <>
          <p className="town-summary" aria-live="polite">
            {townSummary(selected, record)}
          </p>
          <details className="town-zone-details">
            <summary>View area details</summary>
            <div className="resident-zone-list">
              {selected.zone_ids.map((id) => {
                const zone = zones.find((z) => z.zone_id === id);
                return (
                  <article key={id}>
                    <div>
                      <strong>Zone {id}</strong>
                      <span>{zone.COUNTY}</span>
                    </div>
                    <div>
                      <span>MW-only</span>
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
                      <span>Electric heat</span>
                      <strong>{fmt(zone.share_electric_heat * 100)}%</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </details>
        </>
      )}
      <p className="area-disclaimer" data-area-disclaimer>
        A modeled planning scenario, not a prediction for your home.
      </p>
    </section>
  );
}
