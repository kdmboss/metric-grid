import React from 'react';
import { Badge, Status } from '../Evidence.jsx';
import { fmt, status } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
import { Help } from './Help.jsx';
export function ZoneDetail({
  zone,
  record: r,
  data,
  counts,
  n,
  onAdd,
  listed,
  id,
  zones,
  onSelect,
}) {
  const score =
    zone?.humanNorm == null
      ? 'No data'
      : fmt(r.alpha * zone.humanNorm + (1 - r.alpha) * zone.econNorm, 3);
  return (
    <aside className="selection-panel" key={zone?.zone_id || 0} data-selected={Boolean(zone)}>
      <div className="selection-heading">
        <span>Selected area</span>
        <Badge>{zone?.protected ? 'Protected' : 'Modeled data'}</Badge>
      </div>
      <label className="sr-only" htmlFor={id}>
        Select census tract zone
      </label>
      <select
        id={id}
        value={zone?.zone_id || 0}
        onChange={(event) => onSelect(Number(event.target.value))}
      >
        <option value="0">Choose a zone…</option>
        {zones.map((z) => (
          <option key={z.zone_id} value={z.zone_id}>
            Zone {z.zone_id} — {z.COUNTY.replace(' County', '')}
          </option>
        ))}
      </select>
      {zone ? (
        <>
          <div className="selected-place">
            <h2>Zone {zone.zone_id}</h2>
            <p>{zone.COUNTY}</p>
          </div>
          <div className="selected-statuses">
            <div>
              <strong>Megawatts only:</strong>
              <Status value={status(zone, r.baseline)} />
            </div>
            <div>
              <strong>{awarePlanLabel(r)}:</strong>
              <Status value={status(zone, r.weighted)} />
            </div>
          </div>
          <dl className="selected-facts">
            <div>
              <dt>Households</dt>
              <dd>{fmt(zone.occupied_units)}</dd>
            </div>
            <div>
              <dt>Electric-heat homes</dt>
              <dd>{fmt(zone.heat_electricity)}</dd>
            </div>
            <div>
              <dt>Electric-heat share</dt>
              <dd>
                {zone.share_electric_heat == null
                  ? 'No data'
                  : `${fmt(zone.share_electric_heat * 100)}%`}
              </dd>
            </div>
            <div>
              <dt>
                Social vulnerability{' '}
                <Help label="social vulnerability">
                  CDC/ATSDR Social Vulnerability Index (SVI): a relative measure from lower to
                  higher vulnerability. Missing values stay missing.
                </Help>
              </dt>
              <dd>
                {fmt(zone.RPL_THEMES, 2)}
                <small> / 1</small>
              </dd>
            </div>
            <div>
              <dt>Estimated zone load</dt>
              <dd>
                {fmt(zone.L_mw, 2)}
                <small> MW</small>
              </dd>
            </div>
            <div>
              <dt>Cut in MW-only plans</dt>
              <dd>
                {counts[zone.zone_id] || 0}
                <small> of {n}</small>
              </dd>
            </div>
          </dl>

          {zone.protected && (
            <p className="zone-note">
              Has a hospital, nursing home, or water-treatment site, so neither plan cuts it.
            </p>
          )}
          {zone.svi_missing && <p className="zone-note">No vulnerability data for this tract.</p>}
          <button
            className="primary-button add-zone"
            aria-label={listed ? 'Added to shortlist' : 'Add to shortlist'}
            disabled={listed}
            onClick={() => onAdd(zone.zone_id)}
          >
            {listed ? 'Added to shortlist' : 'Add to shortlist'}
            <span aria-hidden="true">{listed ? '✓' : '+'}</span>
          </button>

          <details className="arithmetic">
            <summary>How this zone’s score is calculated</summary>
            <p>Tract {zone.GEOID}</p>
            <pre>
              {[
                'Weighted households',
                `${fmt(zone.occupied_units)} × (${data.config.harm.w_svi} × ${fmt(zone.RPL_THEMES, 3)}`,
                `+ ${data.config.harm.w_eheat} × ${fmt(zone.share_electric_heat, 3)})`,
                `= ${fmt(zone.human, 1)}`,
                '',
                'Interruption cost',
                `$${fmt(zone.econ)} · 2013 dollars · ${data.config.harm.h_hours} hour`,
                '',
                'Blended score',
                `${r.alpha} × ${fmt(zone.humanNorm, 3)}`,
                `+ ${1 - r.alpha} × ${fmt(zone.econNorm, 3)}`,
                `= ${score}`,
              ].join('\n')}
            </pre>
          </details>
        </>
      ) : (
        <div className="empty-state">
          Select a zone on the map or use the zone selector to inspect its evidence.
        </div>
      )}
    </aside>
  );
}
