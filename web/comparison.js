import { fmt } from './model.js';

export const CHANGE_CATEGORIES = [
  ['only-baseline', 'Cut only in megawatts-only plan'],
  ['only-aware', 'Cut only in vulnerability-aware plan'],
  ['both', 'Cut in both plans'],
  ['neither', 'Not cut in either plan'],
  ['protected', 'Protected'],
];

/** Mutually exclusive, exhaustive categories; protected zones stay explicitly separate. */
export function planChanges(zones, record) {
  const baseline = new Set(record.baseline.zone_ids), aware = new Set(record.weighted.zone_ids);
  const counts = Object.fromEntries(CHANGE_CATEGORIES.map(([key]) => [key, 0]));
  const labels = Object.fromEntries(CHANGE_CATEGORIES);
  const byId = {};
  for (const zone of zones) {
    const b = baseline.has(zone.zone_id), w = aware.has(zone.zone_id);
    const category = zone.protected ? 'protected' : b && w ? 'both' : b ? 'only-baseline' : w ? 'only-aware' : 'neither';
    byId[zone.zone_id] = { category, label: labels[category] };
    counts[category]++;
  }
  const removed = zones.filter(z => byId[z.zone_id].category === 'only-baseline');
  const added = zones.filter(z => byId[z.zone_id].category === 'only-aware');
  const mean = rows => rows.length && rows.every(z => Number.isFinite(z.RPL_THEMES) && !z.svi_missing)
    ? rows.reduce((sum, z) => sum + z.RPL_THEMES, 0) / rows.length : null;
  return { byId, counts, removedMeanSvi: mean(removed), addedMeanSvi: mean(added) };
}

/** Never imply an improvement at priority settings where SVI goes the other direction. */
export function swapSentence(changes) {
  const a = changes.counts['only-baseline'], b = changes.counts['only-aware'];
  if (!a && !b) return 'The two displayed plans select the same zones.';
  if (a && b && changes.removedMeanSvi != null && changes.addedMeanSvi != null) {
    const direction = changes.removedMeanSvi - changes.addedMeanSvi;
    if (Math.abs(direction) > 1e-9) return `The vulnerability-aware plan swaps out ${fmt(a)} zones with ${direction > 0 ? 'higher' : 'lower'} average social vulnerability for ${fmt(b)} zones with ${direction > 0 ? 'lower' : 'higher'} average social vulnerability.`;
  }
  return `The vulnerability-aware plan keeps on ${fmt(a)} zones cut only in the megawatts-only plan and cuts ${fmt(b)} other zones instead.`;
}

/** County heat share uses the ACS heating-fuel denominator, not a mean of tract percentages. */
export function countySummary(zones, record, county) {
  const selected = zones.filter(z => z.COUNTY === county);
  const sum = field => selected.every(z => Number.isFinite(z[field])) ? selected.reduce((n, z) => n + z[field], 0) : null;
  const denominator = sum('heat_total_occupied'), heatHomes = sum('heat_electricity');
  const metrics = plan => {
    const ids = new Set(plan.zone_ids), cut = selected.filter(z => ids.has(z.zone_id));
    const mw = cut.reduce((n, z) => n + z.L_mw, 0);
    return { mw, share: plan.mw_shed > 0 ? mw / plan.mw_shed : null,
      heatHomes: cut.reduce((n, z) => n + z.heat_electricity, 0),
      households: cut.reduce((n, z) => n + z.occupied_units, 0), zones: cut.length };
  };
  return { county, households: sum('occupied_units'), heatHomes,
    heatShare: denominator > 0 && heatHomes != null ? heatHomes / denominator : null,
    zones: selected.length, protectedZones: selected.filter(z => z.protected).length,
    baseline: metrics(record.baseline), weighted: metrics(record.weighted) };
}

/** Label anchors are computed from projected tract outlines, then moved inside a real tract. */
export function countyLabelAnchors(paths) {
  const rings = d => d.split('M').filter(Boolean).map(ring => [...ring.matchAll(/(?:^|L)([\d.-]+),([\d.-]+)/g)].map(m => [Number(m[1]), Number(m[2])]));
  const insideRing = ([x, y], points) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i], [xj, yj] = points[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const groups = {};
  for (const path of paths) (groups[path.COUNTY] ||= []).push({ ...path, rings: rings(path.d) });
  return Object.entries(groups).map(([county, tracts]) => {
    const all = tracts.flatMap(t => t.rings.flat()), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    let best = null, distance = Infinity;
    for (const tract of tracts) {
      const points = tract.rings.flat(), tx = points.map(p => p[0]), ty = points.map(p => p[1]);
      const minX = Math.min(...tx), maxX = Math.max(...tx), minY = Math.min(...ty), maxY = Math.max(...ty);
      for (let i = 1; i < 8; i++) for (let j = 1; j < 8; j++) {
        const point = [minX + (maxX - minX) * i / 8, minY + (maxY - minY) * j / 8];
        const d = (point[0] - cx) ** 2 + (point[1] - cy) ** 2;
        if (d < distance && tract.rings.reduce((value, ring) => value !== insideRing(point, ring), false)) { best = point; distance = d; }
      }
    }
    const [x, y] = best || all[0];
    return { county, label: county.replace(' County', ''), x, y };
  });
}
