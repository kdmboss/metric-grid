import { Icon } from '../ui/Icon.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { PickerRow } from '../ui/ActionSheet.jsx';
import { Group } from '../ui/Group.jsx';
import React, { useImperativeHandle, useState } from 'react';
import { LAYERS } from '../MapCanvas.jsx';
function SwitchRow({ title, checked, onChange }) {
  return (
    <label className="ios-row ios-switch-row">
      <span className="ios-row-body">
        <span className="ios-row-title">{title}</span>
      </span>
      <input
        type="checkbox"
        className="ios-switch"
        role="switch"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}
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
  const [open, setOpen] = useState(false);
  // The workspace closes filters when a zone or tab changes, through the same `.open` flag.
  useImperativeHandle(filtersRef, () => ({
    get open() {
      return open;
    },
    set open(value) {
      setOpen(Boolean(value));
    },
  }));
  function _handleChange(event) {
    setDifferenceVisible(event.target.checked);
    if (event.target.checked) setCompareTab('changes');
    setOpen(false);
  }
  function _handleKeyDown(event) {
    if (event.key === 'Escape') setQuery('');
    if (event.key === 'Enter' && results.length) selectZone(results[0].zone_id);
  }
  return (
    <div className="map-filters">
      <button
        type="button"
        className="filters-button"
        aria-label="Map filters"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span>Filters</span>
        <Icon name="filter" size={20} />
      </button>
      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Map filters"
        className="ios-filters-sheet"
      >
        <div className="ios-sheet-list">
          <div className="map-search ios-search ios-search-inline">
            <label className="sr-only" htmlFor="zone-search">
              Search county, zone ID, or tract GEOID
            </label>
            <Icon name="search" size={16} />
            <input
              id="zone-search"
              type="search"
              ref={searchRef}
              placeholder="Search county, zone, or tract…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={_handleKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {query && (
            <Group className="search-results" aria-label="Zone search results">
              {results.length ? (
                results.slice(0, 12).map((z) => (
                  <button
                    type="button"
                    className="ios-row"
                    key={z.zone_id}
                    onClick={() => selectZone(z.zone_id)}
                  >
                    <span className="ios-row-body">
                      <span className="ios-row-title">Zone {z.zone_id}</span>
                      <span className="ios-row-detail">
                        {z.COUNTY} · {z.GEOID}
                      </span>
                    </span>
                    <Icon name="chevron" size={18} className="ios-chevron" />
                  </button>
                ))
              ) : (
                <p className="ios-row ios-row-empty">
                  No matching zones. Try a county name or tract GEOID.
                </p>
              )}
            </Group>
          )}
          <Group title="Show">
            <PickerRow
              icon="pin"
              label="County"
              title="County"
              value={county}
              onChange={selectCounty}
              options={[
                { value: '', label: 'All counties' },
                ...counties.map((name) => ({ value: name, label: name })),
              ]}
            />
            <PickerRow
              icon="layers"
              label="Map layer"
              title="Map layer"
              value={layer}
              onChange={setLayer}
              options={Object.entries(LAYERS).map(([key, value]) => ({
                value: key,
                label: value.name,
              }))}
            />
          </Group>
          <Group title="Map overlays">
            {mode === 'compare' && (
              <SwitchRow
                title="Difference map"
                checked={compareTab === 'changes' && differenceVisible}
                onChange={_handleChange}
              />
            )}
            <SwitchRow
              title="Protected facilities"
              checked={protectedVisible}
              onChange={(event) => setProtectedVisible(event.target.checked)}
            />
            <SwitchRow
              title="District boundary"
              checked={boundaryVisible}
              onChange={(event) => setBoundaryVisible(event.target.checked)}
            />
          </Group>
        </div>
      </ModalSheet>
    </div>
  );
}
