import React from 'react';
import { fmt, status } from '../model.js';
function tractClasses(z, props) {
  const { definition, layer, max, changes, cut, selected, county, protectedVisible } = props;
  const value = z[definition.field],
    missing = value == null || (layer === 'vulnerability' && z.svi_missing);
  const level = Math.min(4, Math.max(0, Math.floor((value / max) * 5)));
  return [
    'tract',
    changes
      ? `difference-${changes.byId[z.zone_id].category}`
      : missing
        ? 'no-data'
        : `vulnerability-${level}`,
    !changes && !z.protected && cut.has(z.zone_id) ? 'is-cut' : '',
    selected === z.zone_id ? 'selected' : selected && !cut.has(z.zone_id) ? 'selection-dimmed' : '',
    county && z.COUNTY !== county ? 'filtered-out' : '',
    (protectedVisible || changes) && z.protected ? 'protected-tract' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
function tractDescription(z, { changes, plan }) {
  const label = changes
    ? changes.byId[z.zone_id].label
    : plan
      ? status(z, plan)
      : z.protected
        ? 'Protected facility zone'
        : 'Census tract zone';
  const heat = z.share_electric_heat == null ? 'No data' : `${fmt(z.share_electric_heat * 100)}%`;
  return [
    `Zone ${z.zone_id} · ${z.COUNTY}`,
    label,
    `${fmt(z.occupied_units)} households · SVI ${fmt(z.RPL_THEMES, 2)}`,
    `Electric heat ${heat} · ${fmt(z.L_mw, 2)} modeled MW`,
  ].join('\n');
}
export function MapTracts(props) {
  const { view, paths, protectedVisible, changes, id, setHover, boundaryVisible, selectedPath } =
    props;
  return (
    <g className="map-transform" transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
      {paths.zones.map((z) => (
        <path
          key={z.zone_id}
          d={z.d}
          data-zone={z.zone_id}
          fillRule="evenodd"
          vectorEffect="non-scaling-stroke"
          className={tractClasses(z, props)}
          style={
            (protectedVisible || changes) && z.protected
              ? {
                  fill: `url(#protect-${id})`,
                }
              : undefined
          }
          onMouseEnter={() => setHover(z)}
          onMouseLeave={() => setHover(null)}
        >
          <title>{tractDescription(z, props)}</title>
        </path>
      ))}
      {boundaryVisible && (
        <path
          d={paths.district}
          className="district-boundary"
          fillRule="evenodd"
          vectorEffect="non-scaling-stroke"
        />
      )}
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
  );
}
