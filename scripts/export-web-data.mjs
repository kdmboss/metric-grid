import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { parse } from 'yaml';
import { approvedContent } from '../web/content.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const frozen = resolve(root, 'data/frozen');
// Python's JSON encoder emits NaN. Convert non-finite tokens outside strings to null.
async function readFrozen(name) {
  const source = await readFile(resolve(frozen, name), 'utf8');
  return JSON.parse(source.replace(/"(?:[^"\\]|\\.)*"|NaN|-?Infinity/g, token => token.startsWith('"') ? token : 'null'));
}
const names = {
  constants: 'constants.json', records: 'presolved.json', loadonly: 'loadonly_plans.json',
  sensitivity: 'sensitivity.json', sweep: 'alpha_sweep.json',
  zones: 'zones.geojson', district: 'district.geojson',
};
const data = Object.fromEntries(await Promise.all(Object.entries(names).map(async ([key, name]) => [key, await readFrozen(name)])));
try { data.panel = await readFrozen('demand_panel.json'); }
catch (error) { if (error.code !== 'ENOENT') throw error; data.panel = null; }
try { data.places = await readFrozen('places.json'); }
catch (error) { if (error.code !== 'ENOENT') throw error; data.places = []; }
try {
  const cooling = await readFrozen('node_cooling.json');
  if (cooling.is_demo !== false) throw new Error('Refusing to bundle an unverified/demo cooling fixture');
  if (!Array.isArray(cooling.readings) || cooling.readings.length < 2 ||
      !cooling.readings.every(r => Number.isFinite(r.temp_f) && Number.isFinite(Date.parse(r.time))) ||
      Date.parse(cooling.readings[0]?.time) >= Date.parse(cooling.readings.at(-1)?.time) ||
      ![cooling.start_temp_f, cooling.cooling_rate_f_per_hour, cooling.r_squared].every(Number.isFinite)) {
    throw new Error('Invalid cooling test data');
  }
  data.node_cooling = cooling;
} catch (error) { if (error.code !== 'ENOENT') throw error; }
try {
  const facilities = await readFrozen('facilities.geojson');
  data.facilities = facilities.features.map(f => ({
    type: f.properties.facility_type, name: f.properties.name,
    lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1],
  }));
} catch (error) { if (error.code !== 'ENOENT') throw error; data.facilities = []; }
// Real HEARTH Home logs (written by scripts/device_export.py). Absent files mean the app shows labelled sample data.
try {
  const events = await readFrozen('device_events.json');
  const readings = await readFrozen('device_readings.json');
  const okReading = r => typeof r.t === 'string' && Number.isFinite(Date.parse(r.t)) && Number.isFinite(r.temp_f);
  const okEvent = e => Number.isFinite(Date.parse(e.start)) && Number.isFinite(Date.parse(e.end)) &&
    Date.parse(e.end) > Date.parse(e.start) && Number.isFinite(e.temp_start_f) && Number.isFinite(e.temp_end_f);
  if (!Array.isArray(readings.readings) || !readings.readings.every(okReading) ||
      !Array.isArray(events.events) || !events.events.every(okEvent)) throw new Error('Invalid device export files');
  data.device = { device: readings.device || events.device || null, events: events.events, readings: readings.readings };
} catch (error) { if (error.code !== 'ENOENT') throw error; data.device = null; }
// Match PyYAML's last-key-wins behavior for the retained source configuration.
const config = parse(await readFile(resolve(root, 'config.yaml'), 'utf8'), { uniqueKeys: false });
data.config = { harm: config.harm, optimizer: config.optimizer, priority_list: config.priority_list, example_locations: config.example_locations };
data.history = parse(await readFile(resolve(root, 'docs/historical_context.yaml'), 'utf8'));
data.content = approvedContent(
  parse(await readFile(resolve(root, 'docs/quotes.yaml'), 'utf8')),
  await readFile(resolve(root, 'docs/author_story.md'), 'utf8'),
);
await mkdir(resolve(root, 'public/data'), { recursive: true });
await writeFile(resolve(root, 'public/data/app.json'), JSON.stringify(data));
await mkdir(resolve(root, 'public/fonts'), { recursive: true });
await cp(resolve(root, 'src/metric_grid/app/assets/fonts'), resolve(root, 'public/fonts'), { recursive: true });
await mkdir(resolve(root, 'public/methods'), { recursive: true });
for (const name of ['ASSUMPTIONS.md', 'DATA_SOURCES.md', 'AI_DISCLOSURE.md']) {
  await cp(resolve(root, 'docs', name), resolve(root, 'public/methods', name));
}
console.log(`Exported ${data.zones.features.length} zones and ${data.records.length} scenarios for the web app.`);
