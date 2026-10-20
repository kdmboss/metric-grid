/** Rank the existing vulnerable-zone list with the original tie breaks. */
export function priorityZones(zones, counts, config) {
  return zones
    .filter(
      (z) =>
        !z.protected &&
        (z.RPL_THEMES >= config.svi_min || z.share_electric_heat >= config.electric_heat_min),
    )
    .sort(
      (a, b) =>
        (counts[b.zone_id] || 0) - (counts[a.zone_id] || 0) ||
        (b.RPL_THEMES ?? -1) - (a.RPL_THEMES ?? -1) ||
        a.zone_id - b.zone_id,
    )
    .slice(0, config.max_rows);
}

/** Sum the displayed plan's existing MW allocations by county. */
export function countyConcentration(zones, record) {
  const counties = {};
  zones
    .filter((z) => record.weighted.zone_ids.includes(z.zone_id))
    .forEach((z) => {
      counties[z.COUNTY] = (counties[z.COUNTY] || 0) + z.L_mw;
    });
  return Object.entries(counties).sort((a, b) => b[1] - a[1]);
}
export function searchZones(zones, county, query) {
  return zones.filter(
    (z) =>
      (!county || z.COUNTY === county) &&
      (!query.trim() ||
        `${z.zone_id} ${z.GEOID} ${z.COUNTY} zone ${z.zone_id}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())),
  );
}
