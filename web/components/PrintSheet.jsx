import React from 'react';
import { fmt } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
import { priorityName } from '../planning.js';
export function PrintSheet({ setPrintMode, data, record, rows }) {
  return (
    <div className="print-sheet">
      <div className="print-actions">
        <button className="primary-button" onClick={() => window.print()}>
          Print / save PDF
        </button>
        <button className="button" onClick={() => setPrintMode(false)}>
          Close print view
        </button>
      </div>
      <h2>HEARTH · Planning shortlist</h2>
      <p>
        Reference: {data.constants.scenario.date} · Data built:{' '}
        {data.constants.built_utc.slice(0, 10)}
      </p>
      <p>
        {priorityName(record.alpha)} · Target {fmt(record.target_mw, 1)} MW · County cap{' '}
        {record.cap ? 'on' : 'off'} · Band {fmt(record.band_lo_mw, 1)}–{fmt(record.band_hi_mw, 1)}{' '}
        MW
      </p>
      <p>
        Actual cut: megawatts only {fmt(record.baseline.mw_shed, 1)} MW;{' '}
        {awarePlanLabel(record).toLowerCase()} {fmt(record.weighted.mw_shed, 1)} MW.
      </p>
      {rows.map((row) => (
        <article className="print-zone" key={row.zone_id}>
          <h3>
            Zone {row.zone_id} · {row.county} · {row.tract_geoid}
          </h3>
          <p>
            {fmt(row.households)} households · Electric heat{' '}
            {row.electric_heat_share == null ? 'No data' : `${fmt(row.electric_heat_share * 100)}%`}{' '}
            · SVI {fmt(row.social_vulnerability_index, 2)} · Estimated zone load{' '}
            {fmt(row.estimated_zone_load_mw, 2)} modeled MW
          </p>
          <p>
            Protected: {row.protected ? 'yes' : 'no'} · SVI missing:{' '}
            {row.svi_missing ? 'yes' : 'no'} · Weighted households:{' '}
            {fmt(row.vulnerability_weighted_households, 1)} · Cost: $
            {fmt(row.interruption_cost_2013_usd_1h)} (2013 dollars, 1 hour)
          </p>
          <p>
            Megawatts only: {row.loadonly_status}; {awarePlanLabel(record).toLowerCase()}:{' '}
            {row.aware_status}; load-only selection frequency: {row.loadonly_cut_count} /{' '}
            {row.loadonly_plan_count}.
          </p>
          <p>
            <strong>{row.followup}</strong>
          </p>
          <p className="user-note">{row.note || 'No note entered.'}</p>
        </article>
      ))}
      <p className="print-limitations">
        {'Planning scenarios use public census tracts; confirm local conditions ' +
          'before choosing sites.'}
      </p>
    </div>
  );
}
