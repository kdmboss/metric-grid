export const fmt = (n, digits = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      })
    : 'No data';
export const signed = (n) => `${n >= 0 ? '+' : '−'}${fmt(Math.abs(n))}`;
export const change = (before, after) => (before ? 100 * (after / before - 1) : 0);
export const targets = (data) => ['elliott', ...data.config.optimizer.target_pcts.map(String)];
export const defaults = (data) => ({
  alpha: data.config.harm.alpha_default,
  target: 'elliott',
  cap: false,
  zone: data.sensitivity.priority_list[0]?.zone_id || 0,
});
export function readState(data, search = '') {
  const state = defaults(data),
    query = new URLSearchParams(search);
  const snap = (v, options) =>
    options.reduce((best, x) => (Math.abs(x - v) < Math.abs(best - v) ? x : best));
  if (
    query.has('alpha') &&
    query.get('alpha').trim() &&
    Number.isFinite(Number(query.get('alpha')))
  )
    state.alpha = snap(Number(query.get('alpha')), data.config.optimizer.alpha_grid);
  if (query.has('pct') && query.get('pct').trim() && Number.isFinite(Number(query.get('pct')))) {
    const elliott = (data.constants.T_NC08_mw / data.constants.D_NC08_mw) * 100;
    const pct = snap(Number(query.get('pct')), [elliott, ...data.config.optimizer.target_pcts]);
    state.target = pct === elliott ? 'elliott' : String(pct);
  }
  state.cap = query.get('cap') === '1';
  const zone = Number(query.get('zone'));
  if (
    query.has('zone') &&
    (zone === 0 || data.zones.features.some((f) => f.properties.zone_id === zone))
  )
    state.zone = zone;
  return state;
}
export function getView(data, state) {
  const exact = data.records.find(
    (r) => r.target_key === state.target && r.alpha === state.alpha && r.cap === state.cap,
  );
  if (exact?.solved)
    return {
      record: exact,
      note: null,
    };
  const target =
    state.target === 'elliott'
      ? data.constants.T_NC08_mw
      : (data.constants.D_NC08_mw * Number(state.target)) / 100;
  const sameCap = data.records.filter((r) => r.solved && r.cap === state.cap);
  const choices = sameCap.length ? sameCap : data.records.filter((r) => r.solved);
  const distance = (r) =>
    Math.abs(r.alpha - state.alpha) +
    (Math.abs(r.target_mw - target) / data.constants.D_NC08_mw) * 10;
  const record = choices.reduce((a, b) => (distance(a) <= distance(b) ? a : b));
  return {
    record,
    note:
      (exact && !exact.solved
        ? `This target cannot be met: ${exact.reason}. `
        : 'This setting is not precomputed. ') +
      `Showing the nearest available scenario: α ${record.alpha}, ` +
      `${fmt(record.target_mw, 1)} MW, county cap ${record.cap ? 'on' : 'off'}.`,
  };
}
export function enrichZones(data) {
  const { harm } = data.config;
  const ice = harm.ice;
  const jobCost =
    data.constants.kw_per_job *
    (ice.commercial_class === 'small'
      ? ice.small_ci_per_avg_kw_1h
      : ice.medium_large_ci_per_avg_kw_1h);
  const zones = data.zones.features.map((f) => {
    const z = f.properties;
    const human =
      z.occupied_units === 0
        ? 0
        : z.RPL_THEMES == null || z.share_electric_heat == null
          ? null
          : z.occupied_units * (harm.w_svi * z.RPL_THEMES + harm.w_eheat * z.share_electric_heat);
    return {
      ...z,
      human,
      econ:
        z.occupied_units * ice.residential_per_household_1h * harm.h_hours +
        z.jobs_total * jobCost * harm.h_hours,
    };
  });
  const maxHuman = Math.max(...zones.map((z) => z.human ?? 0)),
    maxEcon = Math.max(...zones.map((z) => z.econ));
  return zones.map((z) => ({
    ...z,
    humanNorm: z.human == null ? null : z.human / maxHuman,
    econNorm: z.econ / maxEcon,
  }));
}
export function planMetrics(zones, ids) {
  const selected = new Set(ids);
  return zones
    .filter((z) => selected.has(z.zone_id))
    .reduce(
      (totals, z) => ({
        households: totals.households + z.occupied_units,
        electric_heat_households: totals.electric_heat_households + z.heat_electricity,
        h_human: totals.h_human + z.human,
        h_econ: totals.h_econ + z.econ,
        mw_shed: totals.mw_shed + z.L_mw,
      }),
      {
        households: 0,
        electric_heat_households: 0,
        h_human: 0,
        h_econ: 0,
        mw_shed: 0,
      },
    );
}
export function cutCounts(plans) {
  const counts = {};
  plans.forEach((plan) =>
    plan.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    }),
  );
  return counts;
}
export function status(zone, plan) {
  return plan.zone_ids.includes(zone.zone_id) ? 'Cut' : zone.protected ? 'Protected' : 'Kept on';
}
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i],
      [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function locate(features, point) {
  return features.find((f) =>
    (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).some(
      (polygon) =>
        inRing(point, polygon[0]) && !polygon.slice(1).some((hole) => inRing(point, hole)),
    ),
  )?.properties.zone_id;
}
/** The shared lon/lat to map-space projection used by every tract path. */
export function mapProjection(zones, district) {
  const all = [...zones.features, ...district.features];
  const points = all.flatMap((f) =>
    f.geometry.coordinates.flat(f.geometry.type === 'MultiPolygon' ? 2 : 1),
  );
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const aspect = Math.cos((((minY + maxY) / 2) * Math.PI) / 180);
  const scale = Math.min(590 / ((maxX - minX) * aspect), 340 / (maxY - minY));
  const offsetX = (640 - (maxX - minX) * aspect * scale) / 2,
    offsetY = (390 - (maxY - minY) * scale) / 2;
  return ([x, y]) => [(x - minX) * aspect * scale + offsetX, (maxY - y) * scale + offsetY];
}
export function mapPaths(zones, district) {
  const project = mapProjection(zones, district);
  const path = (geometry) =>
    (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates)
      .map((polygon) =>
        polygon
          .map(
            (ring) =>
              ring
                .map((point, i) => {
                  const [px, py] = project(point);
                  return `${i ? 'L' : 'M'}${px.toFixed(2)},${py.toFixed(2)}`;
                })
                .join('') + 'Z',
          )
          .join(''),
      )
      .join('');
  return {
    zones: zones.features.map((f) => ({
      ...f.properties,
      d: path(f.geometry),
    })),
    district: district.features.map((f) => path(f.geometry)).join(''),
  };
}
