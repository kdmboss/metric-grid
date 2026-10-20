import React from 'react';
import { LAYERS } from '../MapCanvas.jsx';
export function MapFilters({
  filtersRef,
  searchRef,
  query,
  setQuery,
  results,
  selectZone,
  county,
  selectCounty,
  counties,
  layer,
  setLayer,
  mode,
  compareTab,
  differenceVisible,
  setDifferenceVisible,
  setCompareTab,
  protectedVisible,
  setProtectedVisible,
  boundaryVisible,
  setBoundaryVisible,
}) {
  function _handleChange(event) {
    setDifferenceVisible(event.target.checked);
    if (event.target.checked) setCompareTab('changes');
    event.currentTarget.closest('details').open = false;
  }
  function _handleKeyDown(event) {
    if (event.key === 'Escape') setQuery('');
    if (event.key === 'Enter' && results.length) selectZone(results[0].zone_id);
  }
  return (
    <details
      className="map-filters"
      ref={filtersRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') event.currentTarget.open = false;
      }}
    >
      <summary>Filters</summary>
      <div className="map-toolbar">
        <div className="map-search">
          <label className="sr-only" htmlFor="zone-search">
            Search county, zone ID, or tract GEOID
          </label>
          <span aria-hidden="true">⌕</span>
          <input
            id="zone-search"
            ref={searchRef}
            placeholder="Search county, zone, or tract…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={_handleKeyDown}
          />
          {query && (
            <div className="search-results" role="region" aria-label="Zone search results">
              {results.length ? (
                results.slice(0, 12).map((z) => (
                  <button key={z.zone_id} onClick={() => selectZone(z.zone_id)}>
                    Zone {z.zone_id}
                    <span>
                      {z.COUNTY} · {z.GEOID}
                    </span>
                  </button>
                ))
              ) : (
                <p>No matching zones. Try a county name or tract GEOID.</p>
              )}
            </div>
          )}
        </div>
        <label className="sr-only" htmlFor="county-filter">
          Filter county
        </label>
        <select
          id="county-filter"
          value={county}
          onChange={(event) => selectCounty(event.target.value)}
        >
          <option value="">All counties</option>
          {counties.map((county) => (
            <option key={county}>{county}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="map-layer">
          Map layer
        </label>
        <select id="map-layer" value={layer} onChange={(event) => setLayer(event.target.value)}>
          {Object.entries(LAYERS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
        <details className="map-options">
          <summary>Map overlays</summary>
          <div>
            {mode === 'compare' && (
              <label>
                <input
                  type="checkbox"
                  checked={compareTab === 'changes' && differenceVisible}
                  onChange={_handleChange}
                />
                Difference map
              </label>
            )}
            <label>
              <input
                type="checkbox"
                checked={protectedVisible}
                onChange={(event) => setProtectedVisible(event.target.checked)}
              />
              Protected facilities
            </label>
            <label>
              <input
                type="checkbox"
                checked={boundaryVisible}
                onChange={(event) => setBoundaryVisible(event.target.checked)}
              />
              District boundary
            </label>
          </div>
        </details>
      </div>
    </details>
  );
}
