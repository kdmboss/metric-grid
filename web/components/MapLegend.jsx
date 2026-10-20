import React from 'react';
import { LAYERS } from '../MapCanvas.jsx';
export function MapLegend({ layer, compare, protectedVisible, boundaryVisible }) {
  return (
    <div className="workspace-legend">
      <div className="legend-ramp">
        <span>{LAYERS[layer].name}</span>
        <span>Lower</span>
        <div className="ramp" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className={`ramp-${i}`} />
          ))}
        </div>
        <span>Higher</span>
      </div>
      <div className="legend">
        {compare && (
          <span>
            <i className="swatch cut" />
            Cut
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
