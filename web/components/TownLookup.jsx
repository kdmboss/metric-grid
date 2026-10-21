import { InterfaceIcon } from './InterfaceIcon.jsx';
import { isNative } from '../platform.js';
import { residentCounts } from '../resident.js';
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
export function TownLookup({ places, zones, record, selected, onPick, onClear, resident = false }) {
  const [query, setQuery] = useState(''),
    [searching, setSearching] = useState(false);
  const counts = selected ? residentCounts(selected, zones, record) : null;
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
    if (isNative()) document.getElementById('place-search')?.blur();
  }
  return (
    <section className="town-lookup" aria-label="Check your area" data-area-lookup-card>
      <div className="town-search-row">
        <label htmlFor="place-search">{resident ? 'Check my area' : 'Find your area'}</label>
        <div className="resident-search">
          <input
            id="place-search"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            placeholder={resident ? 'Type your town…' : 'Town or place…'}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={change}
            onFocus={() => setSearching(true)}
            onKeyDown={keyboard}
            disabled={!places.length}
            aria-controls={searching && matches.length > 0 ? 'place-results' : undefined}
            aria-expanded={searching && matches.length > 0}
          />
          {selected && (
            <button
              className="clear-town"
              aria-label="Clear town"
              onClick={() => {
                setQuery('');
                setSearching(false);
                onClear();
              }}
            >
              <InterfaceIcon name="close" />
            </button>
          )}
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
      </div>
      {!places.length && <p role="status">Place search could not load; try Explore.</p>}
      {selected && (
        <>
          {resident && (
            <div className="resident-result-card" aria-live="polite">
              <h2>
                {selected.name} · {counts.total} areas
              </h2>
              <div className="resident-answer-row">
                <span>MW-only plan</span>
                <Status
                  tone={counts.baseline > 0 ? 'cut' : 'kept'}
                  value={
                    counts.baseline > 0
                      ? `${counts.baseline} of ${counts.total} areas lose power`
                      : `All ${counts.total} stay on`
                  }
                />
              </div>
              <div className="resident-answer-row">
                <span>People-first plan</span>
                <Status
                  tone={counts.aware > 0 ? 'cut' : 'kept'}
                  value={
                    counts.aware > 0
                      ? `${counts.aware} of ${counts.total} areas lose power`
                      : `All ${counts.total} stay on`
                  }
                />
              </div>
              <p className="fine area-disclaimer" data-area-disclaimer>
                Based on a modeled replay of the Christmas Eve 2022 storm. Not a prediction for your
                home.
              </p>
            </div>
          )}
          {!resident && (
            <p className="town-summary" aria-live="polite">
              {townSummary(selected, record)}
            </p>
          )}
          {!resident && (
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
          )}
        </>
      )}
    </section>
  );
}
