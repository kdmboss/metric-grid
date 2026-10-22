import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { SPRING_POP } from '../ui/springs.js';
import { useMapGestures } from '../hooks/useMapGestures.js';
import { useMapAnimation } from '../hooks/useMapAnimation.js';
import { useCountyLabels } from '../hooks/useCountyLabels.js';
import { pathBounds, pathCentroid, viewportFrame, zoomView } from '../mapGeometry.js';
import { status } from '../model.js';
import { riskLevel } from './risk.js';
import { ALL } from './county.js';

const LAYERS = ['risk', 'typical', 'aware'];
/** Where a set of map-space bounds should sit so it is centred in the band between the overlays. */
export function fitInBand(bounds, frame, size, inset) {
  const bandH = Math.max(size.height - inset.top - inset.bottom, 160);
  const unit = frame.width / size.width;
  const scale = Math.min(
    (frame.width * 0.86) / bounds.width,
    (bandH * unit * 0.86) / bounds.height,
    8,
  );
  const cx = frame.x + frame.width / 2,
    cy = frame.y + ((inset.top + bandH / 2) / size.height) * frame.height;
  return {
    scale,
    x: cx - (bounds.x + bounds.width / 2) * scale,
    y: cy - (bounds.y + bounds.height / 2) * scale,
  };
}
function Tracts({ kind, list, active, record, selectedOnly }) {
  const plan = kind === 'aware' ? record.weighted : record.baseline;
  return list.map((z) => {
    const cls =
      kind === 'risk'
        ? `tract risk-${riskLevel(z)}`
        : `tract plan-${status(z, plan) === 'Cut' ? 'cut' : z.protected ? 'protected' : 'kept'}`;
    return (
      <path
        key={z.zone_id}
        d={z.d}
        data-zone={active ? z.zone_id : undefined}
        className={cls}
        fillRule="evenodd"
        vectorEffect="non-scaling-stroke"
        aria-hidden={!selectedOnly && !active ? true : undefined}
      />
    );
  });
}
/** County-first map: flies to a county, dims the rest, outlines it in ember, two colouring modes. */
export function CountyMap({
  paths,
  county,
  mode,
  planKey,
  record,
  view,
  setView,
  selected,
  onSelect,
  inset,
  focusKey,
  point,
  project,
  towns,
  placeLocator,
}) {
  const canvas = useRef(null),
    svgRef = useRef(null);
  const [size, setSize] = useState({ width: 390, height: 640 });
  const fly = useMapAnimation(setView);
  const frame = useMemo(() => {
    const bounds = pathBounds(paths.zones);
    const fitted = viewportFrame(paths.zones, size.width, size.height, bounds);
    const span = Math.max(fitted.width, bounds.width / 0.85);
    const height = (span * size.height) / size.width;
    return {
      x: bounds.x + bounds.width / 2 - span / 2,
      y: bounds.y + bounds.height / 2 - height / 2,
      width: span,
      height,
    };
  }, [paths, size]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width && entry.contentRect.height)
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  const inCounty = useMemo(
    () =>
      county === ALL || !county ? paths.zones : paths.zones.filter((z) => z.COUNTY === county),
    [paths, county],
  );
  const others = useMemo(
    () => (county === ALL || !county ? [] : paths.zones.filter((z) => z.COUNTY !== county)),
    [paths, county],
  );
  // Fly whenever the county, an explicit point, or the overlay insets change.
  const flown = useRef('');
  useEffect(() => {
    const dims = [size.width, size.height, inset.top, inset.bottom].map(Math.round).join('x');
    const signature = `${focusKey}|${dims}`;
    if (flown.current === signature) return;
    flown.current = signature;
    if (point && project) {
      const [x, y] = project([point.lon, point.lat]);
      const base = fitInBand(pathBounds(inCounty), frame, size, inset);
      const scale = Math.max(base.scale * 1.8, 3);
      const band = Math.max(size.height - inset.top - inset.bottom, 160);
      const cx = frame.x + frame.width / 2,
        cy = frame.y + ((inset.top + band / 2) / size.height) * frame.height;
      fly({ scale, x: cx - x * scale, y: cy - y * scale });
      return;
    }
    fly(fitInBand(pathBounds(inCounty), frame, size, inset));
  }, [focusKey, size, inset, frame, inCounty, point, project, fly]);

  const gestures = useMapGestures(svgRef, view, setView, onSelect, () => {});
  const pixelWidth = size.width;
  const { displayLabels, labelSize } = useCountyLabels(paths, '', view, frame, pixelWidth);
  const townLabels = useMemo(() => {
    if (!county || county === ALL) return [];
    const unit = labelSize * 0.9,
      taken = [],
      out = [];
    for (const t of towns.filter((x) => x.county === county)) {
      const x = view.x + t.x * view.scale,
        y = view.y + t.y * view.scale;
      if (
        x < frame.x + unit ||
        x > frame.x + frame.width - unit ||
        y < frame.y + unit ||
        y > frame.y + frame.height - unit
      )
        continue;
      const w = t.name.length * unit * 0.58 + unit,
        h = unit * 1.5;
      const box = { x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 };
      if (taken.some((o) => box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0))
        continue;
      taken.push(box);
      out.push({ ...t, sx: x, sy: y });
      if (out.length === 8) break;
    }
    return { list: out, unit };
  }, [towns, county, view, frame, labelSize]);
  const selectedPath = paths.zones.find((z) => z.zone_id === selected);
  const pinAt = (x, y) =>
    `translate(${view.x + x * view.scale} ${view.y + y * view.scale}) scale(${frame.width / size.width})`;
  const selectedCentre = selectedPath ? pathCentroid(selectedPath) : null;
  const pointXY = point && project ? project([point.lon, point.lat]) : null;
  const showLayer = (id) => (mode === 'risk' ? id === 'risk' : id === planKey);

  return (
    <div className="map-canvas county-map" ref={canvas}>
      <svg
        className="interactive-map"
        ref={svgRef}
        {...gestures}
        viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
        role="img"
        aria-label={`${county && county !== ALL ? county : 'NC-08'} map. Drag to pan, pinch to zoom, tap an area.`}
      >
        <defs>
          <pattern
            id="county-hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(40)"
          >
            <rect width="6" height="6" className="hatch-background" />
            <path d="M0 0V6" className="hatch-line" />
          </pattern>
        </defs>
        <g
          className="map-transform"
          transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}
        >
          <motion.g
            initial={false}
            animate={{ opacity: others.length ? 0.35 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {LAYERS.map((id) => (
              <motion.g
                key={id}
                initial={false}
                animate={{ opacity: showLayer(id) ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: showLayer(id) ? 'auto' : 'none' }}
              >
                <Tracts kind={id} list={others} active={showLayer(id)} record={record} />
              </motion.g>
            ))}
          </motion.g>
          {others.length > 0 && (
            <g className="county-halo" aria-hidden="true">
              {inCounty.map((z) => (
                <path key={z.zone_id} d={z.d} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          )}
          {LAYERS.map((id) => (
            <motion.g
              key={id}
              initial={false}
              animate={{ opacity: showLayer(id) ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ pointerEvents: showLayer(id) ? 'auto' : 'none' }}
            >
              <Tracts kind={id} list={inCounty} active={showLayer(id)} record={record} />
            </motion.g>
          ))}
          <path
            d={paths.district}
            className="district-boundary"
            fillRule="evenodd"
            vectorEffect="non-scaling-stroke"
          />
          {selectedPath && (
            <g className="selection-outline" aria-hidden="true">
              <path
                d={selectedPath.d}
                className="selected-zone-halo"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={selectedPath.d}
                className="selected-zone-outline"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}
        </g>
        {(!county || county === ALL) && (
          <g className="county-labels" aria-hidden="true">
            {displayLabels.map((label) => (
              <text
                key={label.county}
                x={label.x}
                y={label.y}
                fontSize={labelSize}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {label.label}
              </text>
            ))}
          </g>
        )}
        {townLabels.list && (
          <g className="town-labels" aria-hidden="true">
            {townLabels.list.map((t) => (
              <text
                key={t.name}
                x={t.sx}
                y={t.sy}
                fontSize={townLabels.unit}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {t.name}
              </text>
            ))}
          </g>
        )}
        {selectedPath && (
          <g
            className="zone-pin"
            aria-hidden="true"
            transform={pinAt(selectedCentre.x, selectedCentre.y)}
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
        {point && project && (
          <g
            className="zone-pin facility-pin"
            aria-hidden="true"
            transform={pinAt(pointXY[0], pointXY[1])}
          >
            <motion.g
              key={point.key}
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_POP}
            >
              <path d="M0 0v-18" />
              <rect
                x={-point.label.length * 3.4 - 10}
                y="-46"
                width={point.label.length * 6.8 + 20}
                height="28"
                rx="8"
              />
              <text x="0" y="-28" textAnchor="middle">
                {point.label}
              </text>
            </motion.g>
          </g>
        )}
      </svg>
      <div className="map-controls county-controls">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setView((v) => zoomView(v, 1.35))}
        >
          <Icon name="plus" size={22} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setView((v) => zoomView(v, 1 / 1.35))}
        >
          <Icon name="minus" size={22} />
        </button>
        {placeLocator && (
          <button type="button" aria-label="Locate my place" onClick={placeLocator}>
            <Icon name="locate" size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
