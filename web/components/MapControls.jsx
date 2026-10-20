import { Arrow } from './Arrow.jsx';
import { HOME_VIEW, fitPaths, zoomView } from '../mapGeometry.js';
import React from 'react';
export function MapControls({
  setHover,
  onInteract,
  id,
  setView,
  county,
  paths,
  selectedPath,
  onZoomSelected,
}) {
  return (
    <div
      onClick={onInteract}
      className="map-controls"
      onMouseEnter={() => setHover(null)}
      aria-label={`${id} map controls`}
    >
      <button aria-label={`Zoom in ${id} map`} onClick={() => setView((v) => zoomView(v, 1.35))}>
        +
      </button>
      <button
        aria-label={`Zoom out ${id} map`}
        onClick={() => setView((v) => zoomView(v, 1 / 1.35))}
      >
        −
      </button>
      <button
        aria-label={`Reset ${id} map view`}
        onClick={() =>
          setView(county ? fitPaths(paths.zones.filter((z) => z.COUNTY === county)) : HOME_VIEW)
        }
      >
        <Arrow direction="reset" />
      </button>
      <button
        aria-label={`Zoom to selected zone on ${id} map`}
        title="Zoom to selected zone"
        disabled={!selectedPath}
        onClick={() => (onZoomSelected ? onZoomSelected() : setView(fitPaths([selectedPath])))}
      >
        ⌖
      </button>
    </div>
  );
}
