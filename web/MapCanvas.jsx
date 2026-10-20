import { useMapHint } from './hooks/useMapHint.js';
import { useCountyLabels } from './hooks/useCountyLabels.js';
import { MapControls } from './components/MapControls.jsx';
import { MapTooltip } from './components/MapTooltip.jsx';
import { MapTracts } from './components/MapTracts.jsx';
import { viewportFrame, pathCentroid } from './mapGeometry.js';
import { useMapGestures } from './hooks/useMapGestures.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
export const LAYERS = {
  vulnerability: {
    name: 'Social vulnerability',
    field: 'RPL_THEMES',
    low: 'Lower vulnerability',
    high: 'Higher vulnerability',
  },
  heat: {
    name: 'Electric-heat homes',
    field: 'share_electric_heat',
    low: 'Lower share',
    high: 'Higher share',
  },
  load: {
    name: 'Estimated zone load',
    field: 'L_mw',
    low: 'Lower modeled MW',
    high: 'Higher modeled MW',
  },
};
export { HOME_VIEW, fitPaths, zoomView } from './mapGeometry.js';
export function MapCanvas({
  paths,
  zones,
  layer,
  county,
  protectedVisible,
  boundaryVisible,
  view,
  setView,
  selected,
  onSelect,
  plan,
  id,
  counts,
  n,
  changes,
  onZoomSelected,
  planLabel,
  active = true,
}) {
  const canvas = useRef(null),
    svgRef = useRef(null);
  const [hover, setHover] = useState(null),
    [size, setSize] = useState({
      width: 640,
      height: 390,
    });
  const { hint, dismissHint } = useMapHint();
  const frame = useMemo(() => viewportFrame(paths.zones, size.width, size.height), [paths, size]);
  const pixelWidth = size.width;
  function interact() {
    setHover(null);
    dismissHint();
  }
  const gestures = useMapGestures(svgRef, view, setView, onSelect, interact);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width && entry.contentRect.height)
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setHover(null);
  }, [active, layer, plan, changes, county, view]);
  const { displayLabels, labelSize } = useCountyLabels(paths, county, view, frame, pixelWidth);
  const selectedPath = paths.zones.find((z) => z.zone_id === selected);
  const changedCut = changes
    ? Object.entries(changes.byId)
        .filter(([, zone]) => ['only-baseline', 'only-aware', 'both'].includes(zone.category))
        .map(([id]) => Number(id))
    : [];
  const cut = new Set(plan?.zone_ids || changedCut),
    definition = LAYERS[layer];
  const max = layer === 'load' ? Math.max(...zones.map((z) => z.L_mw)) : 1;
  const mapTitle = changes
    ? 'What changed between the two plans?'
    : plan
      ? `${planLabel || 'Megawatts only'} plan`
      : definition.name;
  return (
    <div className="map-canvas" ref={canvas} onMouseLeave={() => setHover(null)}>
      <svg
        className="interactive-map"
        ref={svgRef}
        {...gestures}
        data-map={id}
        viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
        role="img"
        aria-label={`${mapTitle} map. Drag to pan and use controls to zoom.`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <pattern
            id={`protect-${id}`}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(40)"
          >
            <rect width="6" height="6" className="hatch-background" />
            <path d="M0 0V6" className="hatch-line" />
          </pattern>
        </defs>
        <MapTracts
          view={view}
          paths={paths}
          definition={definition}
          layer={layer}
          max={max}
          changes={changes}
          cut={cut}
          selected={selected}
          county={county}
          protectedVisible={protectedVisible}
          id={id}
          setHover={setHover}
          plan={plan}
          boundaryVisible={boundaryVisible}
          selectedPath={selectedPath}
        />
        <g className="county-labels" aria-hidden="true">
          {displayLabels.map((label) => (
            <g key={label.county}>
              {Math.hypot(label.x - label.ax, label.y - label.ay) > labelSize && (
                <path
                  className="county-label-leader"
                  d={`M${label.ax},${label.ay}L${label.x},${label.y}`}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <text
                x={label.x}
                y={label.y}
                fontSize={labelSize}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {label.label}
              </text>
            </g>
          ))}
        </g>
        {selectedPath && (
          <g
            className="zone-pin"
            aria-hidden="true"
            transform={
              '' +
              'translate(' +
              `${view.x + pathCentroid(selectedPath).x * view.scale}` +
              ' ' +
              `${view.y + pathCentroid(selectedPath).y * view.scale}` +
              ') scale(' +
              `${frame.width / pixelWidth}` +
              ')'
            }
          >
            <path d="M0 0v-18" />
            <rect x="-34" y="-46" width="68" height="28" rx="8" />
            <text x="0" y="-28" textAnchor="middle">
              Zone {selected}
            </text>
          </g>
        )}
      </svg>
      <MapControls
        onInteract={interact}
        setHover={setHover}
        id={id}
        setView={setView}
        county={county}
        paths={paths}
        selectedPath={selectedPath}
        onZoomSelected={onZoomSelected}
      />
      {active && hover && (
        <MapTooltip hover={hover} changes={changes} plan={plan} counts={counts} n={n} />
      )}
      {id !== 'aware' && (
        <span className="map-gesture-hint" data-dismissed={!hint} aria-hidden={!hint}>
          Drag to move · scroll or +/− to zoom
        </span>
      )}
    </div>
  );
}
export { MapLegend } from './components/MapLegend.jsx';
