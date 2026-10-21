import { isNative, shareFile } from './platform.js';
import { fmt, status } from './model.js';
export const STORAGE_KEY = 'metric-grid.planning.v1';
export const FOLLOWUPS = ['Outreach', 'Warming-center assessment', 'Backup-power investigation'];
export const LIMITATION =
  'Modeled planning scenario, not Duke Energy\u2019s method, not an operational ' +
  'switching tool. Census tracts are not utility boundaries. Shortlist ' +
  'entries are places to investigate, not validated siting recommendations ' +
  'or avoided-harm estimates. Load-only frequencies are indicative, not a ' +
  'uniform sample. Facility coverage may be incomplete.';

/** Validate persisted browser data and discard stale/unknown zone identifiers. */
export function sanitizePlan(value, validIds) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .filter(
      (row) =>
        row &&
        Number.isInteger(row.zone) &&
        validIds.has(row.zone) &&
        !seen.has(row.zone) &&
        seen.add(row.zone),
    )
    .map((row) => ({
      zone: row.zone,
      note: typeof row.note === 'string' ? row.note.slice(0, 4000) : '',
      followup: FOLLOWUPS.includes(row.followup) ? row.followup : FOLLOWUPS[0],
    }));
}

/** Guard CSV cells against spreadsheet formulas while preserving quotes/newlines. */
export function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function exportRows(data, record, zones, shortlist) {
  return shortlist.map((item) => {
    const z = zones.find((z) => z.zone_id === item.zone);
    return {
      app_name: 'HEARTH',
      reference_date: data.constants.scenario.date,
      data_built: data.constants.built_utc,
      displayed_alpha: record.alpha,
      displayed_target_mw: record.target_mw,
      county_cap: record.cap,
      shared_band_min_mw: record.band_lo_mw,
      shared_band_max_mw: record.band_hi_mw,
      loadonly_actual_cut_mw: record.baseline.mw_shed,
      aware_actual_cut_mw: record.weighted.mw_shed,
      zone_id: z.zone_id,
      tract_geoid: z.GEOID,
      county: z.COUNTY,
      households: z.occupied_units,
      electric_heat_households: z.heat_electricity,
      electric_heat_share: z.share_electric_heat,
      social_vulnerability_index: z.RPL_THEMES,
      estimated_zone_load_mw: z.L_mw,
      load_source: 'Modeled district estimate',
      protected: z.protected,
      svi_missing: z.svi_missing,
      vulnerability_weighted_households: z.human,
      interruption_cost_2013_usd_1h: z.econ,
      loadonly_status: status(z, record.baseline),
      aware_status: status(z, record.weighted),
      loadonly_cut_count: data.loadonly.sets[record.loadonly_key].plans.filter((ids) =>
        ids.includes(z.zone_id),
      ).length,
      loadonly_plan_count: data.loadonly.sets[record.loadonly_key].plans.length,
      followup: item.followup,
      note: item.note,
      limitations: LIMITATION,
    };
  });
}
export function shortlistCsv(rows) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  return (
    '\uFEFF' +
    [
      keys.map(csvCell).join(','),
      ...rows.map((row) => keys.map((k) => csvCell(row[k])).join(',')),
    ].join('\r\n')
  );
}
export function download(text, name, type = 'text/csv;charset=utf-8') {
  if (isNative()) {
    void shareFile(text, name).catch(() =>
      window.alert('The file could not be shared. Please try again.'),
    );
    return;
  }
  const url = URL.createObjectURL(
    new Blob([text], {
      type,
    }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function priorityName(alpha) {
  return alpha === 0
    ? 'Business cost only'
    : alpha < 0.5
      ? 'Mostly business cost'
      : alpha === 0.5
        ? 'Balanced'
        : alpha < 1
          ? 'Mostly people at risk'
          : 'People at risk only';
}
export function comparisonLabel(summary, n) {
  if (summary.n_plans_more === n) return `Lower than all ${fmt(n)} plans`;
  if (summary.n_plans_fewer === n) return `Higher than all ${fmt(n)} plans`;
  return `Lower than ${fmt(summary.n_plans_more)} of ${fmt(n)} plans`;
}
