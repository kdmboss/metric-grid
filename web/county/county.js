import { fmt, locate, status } from '../model.js';
import { pathBounds, pathCentroid } from '../mapGeometry.js';
import { riskLevel } from './risk.js';

export const ALL = 'All NC-08';
export const COUNTY_NAMES = [
  'Union County',
  'Mecklenburg County',
  'Cabarrus County',
  'Robeson County',
  'Stanly County',
  'Richmond County',
  'Montgomery County',
  'Anson County',
  'Scotland County',
];
export const shortName = (county) => (county ? county.replace(' County', '') : 'NC-08');
export const countyZones = (zones, county) =>
  county && county !== ALL ? zones.filter((z) => z.COUNTY === county) : zones;

/** Homes, electric-heat homes and areas cut by one plan, summed over the given tracts. */
export function planTotals(zones, plan) {
  const cut = new Set(plan.zone_ids);
  return zones.reduce(
    (t, z) =>
      cut.has(z.zone_id)
        ? {
            homes: t.homes + z.occupied_units,
            heat: t.heat + z.heat_electricity,
            areas: t.areas + 1,
          }
        : t,
    { homes: 0, heat: 0, areas: 0 },
  );
}
export function countySummary(zones, record, county) {
  const list = countyZones(zones, county);
  return {
    county: county && county !== ALL ? county : null,
    areas: list.length,
    homes: list.reduce((n, z) => n + z.occupied_units, 0),
    heat: list.reduce((n, z) => n + z.heat_electricity, 0),
    highRisk: list.filter((z) => riskLevel(z) === 'high').length,
    baseline: planTotals(list, record.baseline),
    weighted: planTotals(list, record.weighted),
  };
}
const n0 = (n) => fmt(n);
/** The one-glance answer as parts, so numbers can count while the words stay still. */
export function sentenceParts(summary) {
  const where = summary.county ? summary.county : 'NC-08';
  const here = summary.county ? 'here' : 'across the district';
  const a = summary.baseline,
    b = summary.weighted;
  const num = (value, key) => ({ num: value, key });
  const intro = 'In a storm like Christmas Eve 2022, ';
  const cuts = (name, t, keyPrefix, tail) => [
    `the ${name} plan cuts power to `,
    num(t.homes, `${keyPrefix}-homes`),
    ` homes ${tail}— `,
    num(t.heat, `${keyPrefix}-heat`),
    ' heat with electricity.',
  ];
  if (!a.homes && !b.homes) return [`${intro}both plans keep every area in ${where} on.`];
  const first = a.homes
    ? cuts('MW-only', a, 'a', `${here} `)
    : [`the MW-only plan keeps every area in ${where} on.`];
  const second = b.homes
    ? [
        ' The people-first plan cuts ',
        num(b.homes, 'b-homes'),
        ' — ',
        num(b.heat, 'b-heat'),
        ' heat with electricity.',
      ]
    : [` The people-first plan keeps every area in ${where} on.`];
  return [intro, ...first, ...second];
}
export const countySentence = (summary) =>
  sentenceParts(summary)
    .map((p) => (typeof p === 'string' ? p : n0(p.num)))
    .join('');

/** The town a tract belongs to: the smallest place (fewest tracts) containing it, else null. */
export function townFor(zone, places) {
  const matches = places.filter((p) => p.zone_ids.includes(zone.zone_id));
  if (!matches.length) return null;
  matches.sort((x, y) => x.zone_ids.length - y.zone_ids.length || x.name.localeCompare(y.name));
  return matches[0].name;
}
export const areaName = (zone, places) => townFor(zone, places) ?? `Area ${zone.zone_id}`;

const BIN_OLD = ['007', '008', '009', '010', '011']; // ACS year built: 1979 or earlier
export function builtBefore1980(zone) {
  const old = BIN_OLD.reduce((n, k) => n + (zone[`yearbuilt_${k}`] ?? 0), 0);
  return zone.housing_units ? old / zone.housing_units : null;
}
/** Two reason chips from real tract values: the two largest of heat, SVI, old homes, renters. */
export function reasonChips(zone) {
  const pct = (v) => Math.round(v * 100);
  // [value, label, elevated threshold]
  const candidates = [];
  if (zone.share_electric_heat != null)
    candidates.push([
      zone.share_electric_heat,
      `${pct(zone.share_electric_heat)}% electric heat`,
      0.5,
    ]);
  if (!zone.svi_missing && zone.RPL_THEMES != null) {
    const level = zone.RPL_THEMES >= 0.75 ? 'high' : zone.RPL_THEMES >= 0.5 ? 'medium' : 'low';
    candidates.push([zone.RPL_THEMES, `SVI ${zone.RPL_THEMES.toFixed(2)} (${level})`, 0.5]);
  }
  const old = builtBefore1980(zone);
  if (old != null) candidates.push([old, `${pct(old)}% homes built before 1980`, 0.5]);
  if (zone.occupied_units) {
    const renters = zone.renter_occupied / zone.occupied_units;
    candidates.push([renters, `${pct(renters)}% renters`, 0.4]);
  }
  // Elevated values first (largest first), then the strongest of the rest, so chips explain the risk.
  return candidates
    .map(([value, label, floor], order) => ({ value, label, order, rank: value >= floor ? 1 : 0 }))
    .sort((x, y) => y.rank - x.rank || y.value - x.value || x.order - y.order)
    .slice(0, 2)
    .map((c) => c.label);
}
/** Top high-risk tracts by vulnerability-weighted exposure (households x risk), ties by zone id. */
export function areasToWatch(zones, county, limit = 3) {
  return countyZones(zones, county)
    .filter((z) => riskLevel(z) === 'high')
    .sort((x, y) => (y.human ?? -1) - (x.human ?? -1) || x.zone_id - y.zone_id)
    .slice(0, limit);
}
export const planStatuses = (zone, record) => ({
  baseline: status(zone, record.baseline),
  weighted: status(zone, record.weighted),
});

export const FACILITY_TYPES = [
  ['hospital', 'hospital', 'hospitals', 'hospital'],
  ['nursing_home', 'nursing home', 'nursing homes', 'bed'],
  ['fire_station', 'fire station', 'fire stations', 'siren'],
];
/** Facilities inside a county, by point-in-polygon against that county's tracts. */
export function countyFacilities(facilities, zoneFeatures, county) {
  const tracts = zoneFeatures.filter(
    (f) => !county || county === ALL || f.properties.COUNTY === county,
  );
  const wanted = new Set(FACILITY_TYPES.map((t) => t[0]));
  return facilities
    .filter((f) => wanted.has(f.type) && locate(tracts, [f.lon, f.lat]) !== undefined)
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '') || a.lon - b.lon);
}
export function facilityCounts(list) {
  return FACILITY_TYPES.map(([type, one, many]) => {
    const n = list.filter((f) => f.type === type).length;
    return { type, n, label: `${n} ${n === 1 ? one : many}` };
  }).filter((c) => c.n);
}
/** Largest towns per county, positioned at the household-weighted centre of their tracts. */
export function townAnchors(places, pathsZones, zones, perCounty = 8) {
  const byId = new Map(zones.map((z) => [z.zone_id, z]));
  const pathById = new Map(pathsZones.map((p) => [p.zone_id, p]));
  const all = places
    .map((place) => {
      const members = place.zone_ids.map((id) => byId.get(id)).filter(Boolean);
      if (!members.length) return null;
      const tally = {};
      members.forEach((z) => (tally[z.COUNTY] = (tally[z.COUNTY] || 0) + z.occupied_units));
      const county = Object.entries(tally).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      )[0][0];
      const weight = members.reduce((n, z) => n + z.occupied_units, 0) || 1;
      let x = 0,
        y = 0;
      for (const z of members) {
        const c = pathCentroid(pathById.get(z.zone_id));
        x += (c.x * z.occupied_units) / weight;
        y += (c.y * z.occupied_units) / weight;
      }
      return { name: place.name, county, x, y, homes: weight };
    })
    .filter(Boolean)
    .sort((a, b) => b.homes - a.homes || a.name.localeCompare(b.name));
  const taken = {};
  return all.filter((t) => (taken[t.county] = (taken[t.county] || 0) + 1) <= perCounty);
}
export const placeCounty = (place, zones) => {
  const tally = {};
  place.zone_ids.forEach((id) => {
    const z = zones.find((q) => q.zone_id === id);
    if (z) tally[z.COUNTY] = (tally[z.COUNTY] || 0) + z.occupied_units;
  });
  return (
    Object.entries(tally).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null
  );
};
export const boundsOf = (pathsZones) => pathBounds(pathsZones);

const meanSvi = (list) => {
  const scored = list.filter((z) => !z.svi_missing && z.RPL_THEMES != null && z.occupied_units > 0);
  const homes = scored.reduce((n, z) => n + z.occupied_units, 0);
  return homes ? scored.reduce((n, z) => n + z.RPL_THEMES * z.occupied_units, 0) / homes : null;
};
/**
 * Second sentence for a county where the people-first plan cuts MORE homes than MW-only. It says so only
 * with data: the "lower vulnerability" reason appears only when the county's household-weighted SVI really
 * is below the district's, and the district-wide benefit only when the plan leaves fewer electric-heat
 * homes cut. Returns null when there is nothing true to add.
 */
export function shiftSentence(summary, districtSummary, zones, county) {
  if (!summary.county || summary.weighted.homes <= summary.baseline.homes) return null;
  const here = meanSvi(countyZones(zones, county)),
    everywhere = meanSvi(zones);
  const lower = here != null && everywhere != null && here < everywhere;
  const fewer = districtSummary.baseline.heat - districtSummary.weighted.heat;
  const why =
    ' because these neighborhoods score lower on vulnerability than other parts of the district';
  const parts = [`The people-first plan shifts more of the cut here${lower ? why : ''}.`];
  if (fewer > 0)
    parts.push(
      `District-wide, it leaves about ${fmt(fewer)} fewer electric-heat homes in the dark.`,
    );
  return parts.join(' ');
}
/** The largest towns by occupied homes in their tracts, computed from places.json (no hard-coded names). */
export function popularTowns(places, zones, limit = 8) {
  const byId = new Map(zones.map((z) => [z.zone_id, z]));
  return places
    .map((place) => ({
      place,
      homes: place.zone_ids.reduce((n, id) => n + (byId.get(id)?.occupied_units ?? 0), 0),
    }))
    .sort((a, b) => b.homes - a.homes || a.place.name.localeCompare(b.place.name))
    .slice(0, limit)
    .map((entry) => entry.place);
}
