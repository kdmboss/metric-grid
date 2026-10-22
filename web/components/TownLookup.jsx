import { Icon } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { PushScreen } from '../ui/PushScreen.jsx';
import { isNative } from '../platform.js';
import { residentCounts } from '../resident.js';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Status } from './EvidencePrimitives.jsx';
import { status, fmt } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
import { SPRING } from '../ui/springs.js';

export function townSummary(place, record) {
  const count = (plan) => place.zone_ids.filter((id) => plan.zone_ids.includes(id)).length;
  return (
    `${place.name}: ${place.zone_ids.length} areas · ${count(record.baseline)} cut in MW-only plan · ` +
    `${count(record.weighted)} cut in ${awarePlanLabel(record).toLowerCase()} plan`
  );
}
export function TownLookup({ places, zones, record, selected, onPick, onClear, resident = false }) {
  const [query, setQuery] = useState(''),
    [searching, setSearching] = useState(false),
    [focused, setFocused] = useState(false),
    [detail, setDetail] = useState(false);
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
  function cancel() {
    setQuery(selected?.name || '');
    setSearching(false);
    document.getElementById('place-search')?.blur();
  }
  return (
    <section className="town-lookup" aria-label="Check your area" data-area-lookup-card>
      <div className="town-search-row">
        <label htmlFor="place-search">{resident ? 'Check my area' : 'Find your area'}</label>
        <div className="resident-search">
          <div className="ios-search" data-focused={focused}>
            <Icon name="search" size={16} />
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
              onFocus={() => {
                setSearching(true);
                setFocused(true);
              }}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              onKeyDown={keyboard}
              disabled={!places.length}
              aria-controls={searching && matches.length > 0 ? 'place-results' : undefined}
              aria-expanded={searching && matches.length > 0}
            />
            {(selected || query) && (
              <button
                type="button"
                className="clear-town"
                aria-label="Clear town"
                onClick={() => {
                  setQuery('');
                  setSearching(false);
                  onClear();
                }}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <AnimatePresence initial={false}>
            {focused && (
              <motion.button
                type="button"
                className="ios-cancel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={SPRING}
                onPointerDown={(event) => event.preventDefault()}
                onClick={cancel}
              >
                Cancel
              </motion.button>
            )}
          </AnimatePresence>
          {searching && matches.length > 0 && (
            <div
              id="place-results"
              className="place-results ios-group"
              role="listbox"
              aria-label="Matching Census places"
            >
              {matches.map((place) => (
                <button
                  type="button"
                  className="ios-row"
                  key={place.geoid}
                  role="option"
                  aria-selected={selected?.geoid === place.geoid}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => choose(place)}
                >
                  <span className="ios-row-body">
                    <span className="ios-row-title">{place.name}</span>
                  </span>
                  {selected?.geoid === place.geoid && (
                    <Icon name="check" size={20} className="ios-check" />
                  )}
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
                {selected.name} <span>· {counts.total} areas</span>
              </h2>
              <Group>
                <Row title="MW-only plan">
                  <Status
                    tone={counts.baseline > 0 ? 'cut' : 'kept'}
                    value={
                      counts.baseline > 0
                        ? `${counts.baseline} of ${counts.total} areas lose power`
                        : `All ${counts.total} stay on`
                    }
                  />
                </Row>
                <Row title="People-first plan">
                  <Status
                    tone={counts.aware > 0 ? 'cut' : 'kept'}
                    value={
                      counts.aware > 0
                        ? `${counts.aware} of ${counts.total} areas lose power`
                        : `All ${counts.total} stay on`
                    }
                  />
                </Row>
              </Group>
              <p className="ios-section-footer area-disclaimer" data-area-disclaimer>
                Based on a modeled replay of the Christmas Eve 2022 storm. Not a prediction for your
                home.
              </p>
            </div>
          )}
          {!resident && (
            <Group>
              <Row
                icon="pin"
                title={selected.name}
                detail={townSummary(selected, record).split(': ')[1]}
                onClick={() => setDetail(true)}
                aria-live="polite"
              />
            </Group>
          )}
          {!resident && (
            <PushScreen
              open={detail}
              title={selected.name}
              backLabel="Back"
              onBack={() => setDetail(false)}
            >
              {selected.zone_ids.map((id) => {
                const zone = zones.find((z) => z.zone_id === id);
                return (
                  <Group key={id} title={`Zone ${id} · ${zone.COUNTY}`}>
                    <Row title="MW-only">
                      <Status value={status(zone, record.baseline)} />
                    </Row>
                    <Row title={awarePlanLabel(record)}>
                      <Status value={status(zone, record.weighted)} />
                    </Row>
                    <Row icon="home" title="Households" value={fmt(zone.occupied_units)} />
                    <Row
                      icon="bolt"
                      tone="amber"
                      title="Electric heat"
                      value={`${fmt(zone.share_electric_heat * 100)}%`}
                    />
                  </Group>
                );
              })}
            </PushScreen>
          )}
        </>
      )}
    </section>
  );
}
