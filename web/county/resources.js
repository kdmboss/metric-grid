import { status } from '../model.js';
import { pathCentroid } from '../mapGeometry.js';

/** Pin class for a status (literal class names so the stylesheet check can see them). */
export const statusTone = (s) =>
  s === 'Cut' ? 'pin-cut' : s === 'Protected' ? 'pin-protected' : 'pin-kept';
/** Add an id and the two plan statuses to each imported resource row. */
export function withStatuses(rows, zones, record) {
  const byId = new Map(zones.map((z) => [z.zone_id, z]));
  return rows.map((row, index) => {
    const zone = byId.get(row.zone_id);
    return {
      ...row,
      id: `${index}-${row.zone_id}`,
      baseline: status(zone, record.baseline),
      weighted: status(zone, record.weighted),
    };
  });
}
/** Map pins in map space: the point if the row has coordinates, else the tract centre. */
export function resourcePins(rows, paths, project, planKey) {
  const byId = new Map(paths.zones.map((z) => [z.zone_id, z]));
  return rows.map((row) => {
    let x, y;
    if (row.lat != null && row.lon != null) [x, y] = project([row.lon, row.lat]);
    else ({ x, y } = pathCentroid(byId.get(row.zone_id)));
    return {
      id: row.id,
      name: row.resource_name,
      x,
      y,
      tone: statusTone(planKey === 'aware' ? row.weighted : row.baseline),
    };
  });
}
