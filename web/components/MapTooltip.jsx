import React from 'react';
import { status } from '../model.js';
export function MapTooltip({ hover, changes, plan, cursor }) {
  return (
    <div className="map-hover" style={{ left: cursor.x, top: cursor.y }} aria-hidden="true">
      <strong>Zone {hover.zone_id}</strong>
      <span>{hover.COUNTY}</span>
      <span>
        {changes
          ? changes.byId[hover.zone_id].label
          : plan
            ? status(hover, plan)
            : 'Click for details'}
      </span>
    </div>
  );
}
