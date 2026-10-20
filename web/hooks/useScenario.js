import { useMemo } from 'react';
import { cutCounts, enrichZones, getView, mapPaths, planMetrics } from '../model.js';
import { planChanges } from '../comparison.js';
import { exportRows } from '../planning.js';
import { priorityZones, countyConcentration, searchZones } from './scenarioSelectors.js';

/** Derive presentation data without changing the frozen results. */
export function useScenario(data, state, map, plan) {
  const zones = useMemo(() => enrichZones(data), [data]);
  const paths = useMemo(() => mapPaths(data.zones, data.district), [data]);
  const viewResult = getView(data, state);
  const record = viewResult.record;
  const plans = data.loadonly.sets[record.loadonly_key].plans;
  const counts = useMemo(() => cutCounts(plans), [plans]);
  const changes = useMemo(() => planChanges(zones, record), [zones, record]);
  const priority = useMemo(
    () => priorityZones(zones, counts, data.config.priority_list),
    [zones, counts, data],
  );
  const concentration = useMemo(() => countyConcentration(zones, record), [zones, record]);
  const distribution = useMemo(() => plans.map((ids) => planMetrics(zones, ids)), [plans, zones]);
  const results = useMemo(
    () => searchZones(zones, map.county, map.query),
    [zones, map.county, map.query],
  );
  const rows = useMemo(() => exportRows(data, record, zones, plan), [data, record, zones, plan]);
  const counties = useMemo(() => [...new Set(zones.map((z) => z.COUNTY))].sort(), [zones]);
  return {
    zones,
    paths,
    viewResult,
    record,
    counts,
    changes,
    priority,
    concentration,
    distribution,
    results,
    rows,
    counties,
    n: plans.length,
    zone: zones.find((z) => z.zone_id === state.zone),
  };
}
