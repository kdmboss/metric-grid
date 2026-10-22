import { useMapHint } from './hooks/useMapHint.js';
import { useCountyLabels } from './hooks/useCountyLabels.js';
import { MapControls } from './components/MapControls.jsx';
import { MapTooltip } from './components/MapTooltip.jsx';
import { MapTracts } from './components/MapTracts.jsx';
import { viewportFrame, pathCentroid, pathBounds } from './mapGeometry.js';
import { useMapGestures } from './hooks/useMapGestures.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SPRING_POP } from './ui/springs.js';
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
  selectionIds = [],
  selectionLabel = '',
  present = false,
}) {
  const canvas = useRef(null),
    svgRef = useRef(null);
  const [hover, setHover] = useState(null),
    [size, setSize] = useState({
      width: 640,
      height: 390,
    });
  const { hint, dismissHint } = useMapHint();
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  function hoverAt(event) {
    const bounds = canvas.current.getBoundingClientRect();
    setCursor({
      x: Math.min(bounds.width - 210, event.clientX - bounds.left + 12),
      y: Math.min(bounds.height - 90, event.clientY - bounds.top + 12),
    });
  }
  function clicked(event) {
    if (event.type === 'pointerup') setHover(null);
  }

  const districtBounds = useMemo(() => pathBounds(paths.zones), [paths]);
  const frame = useMemo(() => {
    const bounds = districtBounds;
    const fitted = viewportFrame(paths.zones, size.width, size.height, bounds);
    const span = Math.max(fitted.width, bounds.width / 0.85);
    const height = (span * size.height) / size.width;
    return {
      x: bounds.x + bounds.width / 2 - span / 2,
      y: bounds.y + bounds.height / 2 - height / 2,
      width: span,
      height,
    };
  }, [paths, size, districtBounds]);
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
  const selectionSet = new Set(selected ? [selected] : selectionIds);
  const selectedPaths = paths.zones.filter((z) => selectionSet.has(z.zone_id));
  const townBounds = pathBounds(selectedPaths);
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
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
    <div
      className="map-canvas"
      ref={canvas}
      onMouseMove={hoverAt}
      onPointerUp={clicked}
      onMouseLeave={() => setHover(null)}
    >
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
          selectedPaths={selectedPaths}
          selectionSet={selectionSet}
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
        {selectionLabel && selectedPaths.length > 0 && (
          <g
            className="town-map-label"
            aria-hidden="true"
            transform={`translate(${
              view.x + (townBounds.x + townBounds.width / 2) * view.scale
            } ${view.y + townBounds.y * view.scale}) scale(${frame.width / pixelWidth})`}
          >
            <rect
              x={-selectionLabel.length * 3.8 - 10}
              y="-30"
              width={selectionLabel.length * 7.6 + 20}
              height="24"
              rx="8"
            />
            <text y="-14" textAnchor="middle">
              {selectionLabel}
            </text>
          </g>
        )}
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
            <motion.g
              key={selected}
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_POP}
            >
              <path d="M0 0v-18" />
              <rect x="-34" y="-46" width="68" height="28" rx="8" />
              <text x="0" y="-28" textAnchor="middle">
                Zone {selected}
              </text>
            </motion.g>
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
      {active && hover && !selected && !selectionIds.length && !present && (
        <MapTooltip
          cursor={cursor}
          hover={hover}
          changes={changes}
          plan={plan}
          counts={counts}
          n={n}
        />
      )}
      {id !== 'aware' && (
        <span className="map-gesture-hint" data-dismissed={!hint} aria-hidden={!hint}>
          {touch ? 'Pinch to zoom · drag to move' : 'Drag to move · scroll or +/− to zoom'}
        </span>
      )}
    </div>
  );
}
export { MapLegend } from './components/MapLegend.jsx';
