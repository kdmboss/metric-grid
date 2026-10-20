import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fmt, status } from './model.js';
import { countyLabelAnchors, mapFrame } from './comparison.js';

export const LAYERS = {
  vulnerability: { name: 'Social vulnerability', field: 'RPL_THEMES', low: 'Lower vulnerability', high: 'Higher vulnerability' },
  heat: { name: 'Electric-heat homes', field: 'share_electric_heat', low: 'Lower share', high: 'Higher share' },
  load: { name: 'Estimated zone load', field: 'L_mw', low: 'Lower modeled MW', high: 'Higher modeled MW' },
};
export const HOME_VIEW = { scale: 1, x: 0, y: 0 };

/** Fit existing projected paths; no network maps or guessed geographic boundaries. */
export function fitPaths(paths) {
  const pairs = paths.flatMap(p => [...p.d.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m => [Number(m[1]), Number(m[2])]));
  if (!pairs.length) return HOME_VIEW;
  const xs = pairs.map(p => p[0]), ys = pairs.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const scale = Math.min(6, 400 / Math.max(1, x1 - x0), 300 / Math.max(1, y1 - y0));
  return { scale, x: 320 - (x0 + x1) / 2 * scale, y: 195 - (y0 + y1) / 2 * scale };
}

export function zoomView(view, factor) {
  const scale = Math.max(.8, Math.min(8, view.scale * factor));
  const ratio = scale / view.scale;
  return { scale, x: 320 - (320 - view.x) * ratio, y: 195 - (195 - view.y) * ratio };
}

export function MapCanvas({ paths, zones, layer, county, protectedVisible, boundaryVisible, view, setView, selected, onSelect, plan, id, counts, n, changes, onZoomSelected, planLabel, active = true }) {
  const drag = useRef(null), canvas = useRef(null), [hover, setHover] = useState(null), [ratio, setRatio] = useState(640 / 390), [pixelWidth, setPixelWidth] = useState(640);
  const frame = useMemo(() => mapFrame(paths.zones, ratio), [paths, ratio]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => { if (entry.contentRect.width && entry.contentRect.height) { setRatio(entry.contentRect.width / entry.contentRect.height); setPixelWidth(entry.contentRect.width); } });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { setHover(null); }, [active, layer, plan, changes, county, view]);
  useEffect(() => { drag.current = null; }, [active]);
  const labels = useMemo(() => countyLabelAnchors(paths.zones), [paths]);
  const labelSize = 12 * frame.width / pixelWidth;
  const displayLabels = useMemo(() => {
    const occupied = [], unit = labelSize;
    return labels.filter(label => !county || label.county === county).map(label => {
      const ax = view.x + label.x * view.scale, ay = view.y + label.y * view.scale;
      if (ax < frame.x || ax > frame.x + frame.width || ay < frame.y || ay > frame.y + frame.height) return null;
      const width = label.label.length * unit * .57, height = unit * 1.3;
      const x = Math.max(frame.x + width / 2 + unit, Math.min(frame.x + frame.width - width / 2 - unit, ax));
      let y = ay;
      for (const shift of [0, -1.6, 1.6, -3.2, 3.2, -4.8, 4.8]) {
        const candidate = Math.max(frame.y + height, Math.min(frame.y + frame.height - height, ay + shift * unit));
        const box = { x0: x - width / 2, x1: x + width / 2, y0: candidate - height / 2, y1: candidate + height / 2 };
        if (!occupied.some(other => box.x0 < other.x1 + unit / 3 && box.x1 > other.x0 - unit / 3 && box.y0 < other.y1 && box.y1 > other.y0)) { y = candidate; occupied.push(box); break; }
      }
      return { ...label, x, y, ax, ay };
    }).filter(Boolean);
  }, [labels, county, view, frame, labelSize]);
  const selectedPath = paths.zones.find(z => z.zone_id === selected);
  const cut = new Set(plan?.zone_ids || []), definition = LAYERS[layer];
  const max = layer === 'load' ? Math.max(...zones.map(z => z.L_mw)) : 1;
  const point = event => {
    const svg = event.currentTarget;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };
  function pointerDown(event) {
    if (event.button !== 0) return;
    setHover(null);
    drag.current = { ...point(event), view, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event) {
    if (!drag.current) return;
    const p = point(event), dx = p.x - drag.current.x, dy = p.y - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
    if (drag.current.moved) setView({ ...drag.current.view, x: drag.current.view.x + dx, y: drag.current.view.y + dy });
  }
  function pointerUp(event) {
    if (drag.current && !drag.current.moved) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-zone]');
      if (target) onSelect(Number(target.dataset.zone));
    }
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <div className="map-canvas" ref={canvas} onMouseLeave={() => setHover(null)}>
    <svg className="interactive-map" data-map={id} viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`} role="img" aria-label={`${changes ? 'What changed between the two plans?' : plan ? `${planLabel || 'Megawatts only'} plan` : definition.name} map. Drag to pan. Use map controls to zoom, and the zone search to inspect any tract by keyboard.`}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { drag.current = null; }} onMouseLeave={() => setHover(null)}>
      <defs><pattern id={`protect-${id}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(40)"><rect width="6" height="6" className="hatch-background"/><path d="M0 0V6" className="hatch-line"/></pattern></defs>
      <g className="map-transform" transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
        {paths.zones.map(z => {
          const value = z[definition.field], missing = value == null || (layer === 'vulnerability' && z.svi_missing);
          const level = Math.min(4, Math.max(0, Math.floor(value / max * 5)));
          return <path key={z.zone_id} d={z.d} data-zone={z.zone_id} fillRule="evenodd" vectorEffect="non-scaling-stroke"
            className={`tract ${changes ? `difference-${changes.byId[z.zone_id].category}` : missing ? 'no-data' : `vulnerability-${level}`} ${!changes && !z.protected && cut.has(z.zone_id) ? 'is-cut' : ''} ${selected === z.zone_id ? 'selected' : ''} ${county && z.COUNTY !== county ? 'filtered-out' : ''} ${(protectedVisible || changes) && z.protected ? 'protected-tract' : ''}`}
            style={(protectedVisible || changes) && z.protected ? { fill: `url(#protect-${id})` } : undefined}
            onMouseEnter={() => setHover(z)} onMouseLeave={() => setHover(null)}><title>{`Zone ${z.zone_id} · ${z.COUNTY}\n${changes ? changes.byId[z.zone_id].label : plan ? status(z, plan) : z.protected ? 'Protected facility zone' : 'Census tract zone'}\n${fmt(z.occupied_units)} households · SVI ${fmt(z.RPL_THEMES, 2)}\nElectric heat ${z.share_electric_heat == null ? 'No data' : fmt(z.share_electric_heat * 100) + '%'} · ${fmt(z.L_mw, 2)} modeled MW`}</title></path>;
        })}
        {boundaryVisible && <path d={paths.district} className="district-boundary" fillRule="evenodd" vectorEffect="non-scaling-stroke"/>}
        {selectedPath && <g className="selection-outline" aria-hidden="true"><path d={selectedPath.d} className="selected-zone-halo" vectorEffect="non-scaling-stroke"/><path d={selectedPath.d} className="selected-zone-outline" vectorEffect="non-scaling-stroke"/></g>}
        </g><g className="county-labels" aria-hidden="true">{displayLabels.map(label => <g key={label.county}>{Math.hypot(label.x - label.ax, label.y - label.ay) > labelSize && <path className="county-label-leader" d={`M${label.ax},${label.ay}L${label.x},${label.y}`} vectorEffect="non-scaling-stroke"/>}<text x={label.x} y={label.y} fontSize={labelSize} textAnchor="middle" dominantBaseline="middle">{label.label}</text></g>)}</g>
      <text x={frame.x + 24} y={frame.y + 26} className="north">N ↑</text>
    </svg>
    <div className="map-controls" onMouseEnter={() => setHover(null)} aria-label={`${id} map controls`}><button aria-label={`Zoom in ${id} map`} onClick={() => setView(v => zoomView(v, 1.35))}>+</button><button aria-label={`Zoom out ${id} map`} onClick={() => setView(v => zoomView(v, 1 / 1.35))}>−</button><button aria-label={`Reset ${id} map view`} onClick={() => setView(county ? fitPaths(paths.zones.filter(z => z.COUNTY === county)) : HOME_VIEW)}>↺</button><button aria-label={`Zoom to selected zone on ${id} map`} title="Zoom to selected zone" disabled={!selectedPath} onClick={() => onZoomSelected ? onZoomSelected() : setView(fitPaths([selectedPath]))}>⌖</button></div>
    {active && hover && <div className="map-hover" aria-hidden="true"><strong>Zone {hover.zone_id}</strong><span>{hover.COUNTY}</span><span>{fmt(hover.occupied_units)} households · {fmt(hover.L_mw, 1)} modeled MW</span><span>SVI {fmt(hover.RPL_THEMES, 2)} · electric heat {hover.share_electric_heat == null ? 'No data' : `${fmt(hover.share_electric_heat * 100)}%`}</span><span>{changes ? changes.byId[hover.zone_id].label : plan ? status(hover, plan) : hover.protected ? 'Protected facility zone' : 'Select to inspect'} · {counts[hover.zone_id] || 0} / {n} load-only plans</span></div>}
    <span className="map-caption">{county || 'NC-08'} · census tract zones · drag to pan</span>
  </div>;
}

export function MapLegend({ layer, compare, data, protectedVisible, boundaryVisible }) {
  const definition = LAYERS[layer];
  const max = layer === 'load' ? Math.max(...data.zones.features.map(f => f.properties.L_mw)) : 1;
  return <div className="workspace-legend"><div><span>{definition.name}{layer === 'load' ? ' · modeled MW' : ''}</span><div className="ramp" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} className={`ramp-${i}`}/>)}</div><div className="ramp-labels"><span>{layer === 'load' ? '0 MW' : '0'}</span><span>{layer === 'load' ? `${fmt(max, 1)} MW` : layer === 'heat' ? '100%' : '1'}</span></div></div>
    <div className="legend">{compare && <span><i className="swatch cut"/>Cut in this plan</span>}{protectedVisible && <span><i className="swatch hatch"/>Protected</span>}<span><i className="swatch nodata"/>Missing data</span>{boundaryVisible && <span><i className="swatch boundary"/>NC-08 boundary</span>}</div></div>;
}
