import React from 'react';
import { fmt } from '../model.js';
import { LAYERS } from '../MapCanvas.jsx';
export function MapLegend({ layer, compare, data, protectedVisible, boundaryVisible }) {
  const definition = LAYERS[layer];
  const max = layer === 'load' ? Math.max(...data.zones.features.map((f) => f.properties.L_mw)) : 1;
  return (
    <div className="workspace-legend">
      <div>
        <span>
          {definition.name}
          {layer === 'load' ? ' · modeled MW' : ''}
        </span>
        <div className="ramp" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className={`ramp-${i}`} />
          ))}
        </div>
        <div className="ramp-labels">
          <span>{layer === 'load' ? '0 MW' : '0'}</span>
          <span>{layer === 'load' ? `${fmt(max, 1)} MW` : layer === 'heat' ? '100%' : '1'}</span>
        </div>
      </div>
      <div className="legend">
        {compare && (
          <span>
            <i className="swatch cut" />
            Cut in this plan
          </span>
        )}
        {protectedVisible && (
          <span>
            <i className="swatch hatch" />
            Protected
          </span>
        )}
        <span>
          <i className="swatch nodata" />
          Missing data
        </span>
        {boundaryVisible && (
          <span>
            <i className="swatch boundary" />
            NC-08 boundary
          </span>
        )}
      </div>
    </div>
  );
}
