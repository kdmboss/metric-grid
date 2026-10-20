import { status } from './model.js';
export function residentRecord(data) {
  const record = data.records.find(
    (r) => r.target_key === 'elliott' && r.alpha === 0.5 && !r.cap && r.solved,
  );
  if (!record) throw new Error('The resident Elliott/Balanced scenario is unavailable');
  return record;
}
export function residentCounts(place, zones, record) {
  const selected = zones.filter((z) => place.zone_ids.includes(z.zone_id));
  return {
    total: selected.length,
    baseline: selected.filter((z) => status(z, record.baseline) === 'Cut').length,
    aware: selected.filter((z) => status(z, record.weighted) === 'Cut').length,
  };
}
