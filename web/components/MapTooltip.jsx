import React from 'react';
import { fmt, status } from '../model.js';
export function MapTooltip({ hover, changes, plan, counts, n }) {
  return (
    <div className="map-hover" aria-hidden="true">
      <strong>Zone {hover.zone_id}</strong>
      <span>{hover.COUNTY}</span>
      <span>
        {fmt(hover.occupied_units)} households · {fmt(hover.L_mw, 1)} modeled MW
      </span>
      <span>
        SVI {fmt(hover.RPL_THEMES, 2)} · electric heat{' '}
        {hover.share_electric_heat == null ? 'No data' : `${fmt(hover.share_electric_heat * 100)}%`}
      </span>
      <span>
        {changes
          ? changes.byId[hover.zone_id].label
          : plan
            ? status(hover, plan)
            : hover.protected
              ? 'Protected facility zone'
              : 'Select to inspect'}{' '}
        · {counts[hover.zone_id] || 0} / {n} load-only plans
      </span>
    </div>
  );
}
