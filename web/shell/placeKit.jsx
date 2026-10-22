import React, { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { Status } from '../components/EvidencePrimitives.jsx';
import { fmt, status } from '../model.js';
import { awarePlanLabel } from '../presentation.js';

export function planStatus(count, total) {
  return count > 0
    ? { tone: 'cut', text: `${count} ${count === 1 ? 'area loses' : 'areas lose'} power` }
    : { tone: 'kept', text: total ? 'All stay on' : 'No data' };
}
export function PlanRows({ counts }) {
  const a = planStatus(counts.baseline, counts.total),
    b = planStatus(counts.aware, counts.total);
  return (
    <>
      <div className="plan-row">
        <span>MW-only plan</span>
        <Status tone={a.tone} value={a.text} />
      </div>
      <div className="plan-row">
        <span>People-first plan</span>
        <Status tone={b.tone} value={b.text} />
      </div>
    </>
  );
}
export function PlacePicker({ open, onClose, places, saved, onAdd }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(
    () =>
      query.trim().length > 1
        ? places
            .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
            .slice(0, 12)
        : [],
    [places, query],
  );
  return (
    <ModalSheet
      open={open}
      onClose={() => {
        setQuery('');
        onClose();
      }}
      title="Add your town"
    >
      <div className="ios-search ios-search-inline">
        <Icon name="search" size={16} />
        <input
          id="place-search"
          type="search"
          placeholder="Town or place…"
          aria-label="Search towns"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="ios-sheet-list">
        {matches.length > 0 && (
          <Group>
            {matches.map((place) => (
              <button
                type="button"
                key={place.geoid}
                className="ios-row"
                onClick={() => {
                  onAdd(place);
                  setQuery('');
                  onClose();
                }}
              >
                <span className="ios-row-body">
                  <span className="ios-row-title">{place.name}</span>
                </span>
                {saved.includes(place.geoid) && (
                  <Icon name="check" size={20} className="ios-check" />
                )}
              </button>
            ))}
          </Group>
        )}
        {query.trim().length > 1 && !matches.length && (
          <p className="ios-row ios-row-empty">No matching town.</p>
        )}
      </div>
    </ModalSheet>
  );
}
/** Pushed place screen: both plans, then each area in the place. */
export function PlaceDetail({ place, zones, record, counts }) {
  return (
    <div className="place-detail">
      <div className="place-detail-hero">
        <PlanRows counts={counts} />
      </div>
      <p className="ios-section-footer area-disclaimer" data-area-disclaimer>
        Based on a modeled replay of the Christmas Eve 2022 storm. Not a prediction for your home.
      </p>
      {place.zone_ids.map((id) => {
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
              title="Electric heat"
              value={`${fmt(zone.share_electric_heat * 100)}%`}
            />
          </Group>
        );
      })}
    </div>
  );
}
