import { InterfaceIcon } from './InterfaceIcon.jsx';
import { Arrow } from './Arrow.jsx';
import { HOME_VIEW, fitPaths, zoomView } from '../mapGeometry.js';
import React from 'react';
export function MapControls({ setHover, onInteract, id, setView, county, paths }) {
  return (
    <div
      onClick={onInteract}
      className="map-controls"
      onMouseEnter={() => setHover(null)}
      aria-label={`${id} map controls`}
    >
      <button aria-label={`Zoom in ${id} map`} onClick={() => setView((v) => zoomView(v, 1.35))}>
        <InterfaceIcon name="plus" />
      </button>
      <button
        aria-label={`Zoom out ${id} map`}
        onClick={() => setView((v) => zoomView(v, 1 / 1.35))}
      >
        <InterfaceIcon name="minus" />
      </button>
      <button
        aria-label={`Reset ${id} map view`}
        onClick={() =>
          setView(county ? fitPaths(paths.zones.filter((z) => z.COUNTY === county)) : HOME_VIEW)
        }
      >
        <Arrow direction="reset" />
      </button>
    </div>
  );
}
