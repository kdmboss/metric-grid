import { locate } from './model.js';
/** Local county resource imports annotate planning context; they never enter the model. */
export const COUNTY_COLUMNS = [
  'tract_geoid',
  'resource_name',
  'resource_type',
  'capacity_people',
  'source',
  'updated_on',
  'notes',
];
/** Optional columns: where the place is. Coordinates are matched to an NC-08 tract by point-in-polygon. */
export const OPTIONAL_COLUMNS = ['address', 'latitude', 'longitude'];
export const RESOURCE_TYPES = [
  'warming_center',
  'backup_power',
  'outreach',
  'public_building',
  'other',
];
export const typeLabel = (type) => type.replaceAll('_', ' ');
export const MAX_COUNTY_BYTES = 1024 * 1024;
export const MAX_COUNTY_ROWS = 500;
export const countyTemplate = () => `${COUNTY_COLUMNS.join(',')}\r\n`;
/** The planner dashboard template also carries the optional location columns. */
export const dashboardTemplate = () => `${[...COUNTY_COLUMNS, ...OPTIONAL_COLUMNS].join(',')}\r\n`;

/** Parse quoted CSV, including escaped quotes and line breaks; reject malformed syntax. */
export function parseCountyCsv(text) {
  const rows = [];
  let row = [],
    cell = '',
    quoted = false,
    closed = false;
  const source = text.replace(/^\uFEFF/, '');
  const pushCell = () => {
    row.push(cell);
    cell = '';
    closed = false;
  };
  const pushRow = () => {
    pushCell();
    if (row.some((value) => value.trim())) rows.push(row);
    row = [];
  };
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else cell += char;
    } else if (char === ',') pushCell();
    else if (char === '\r' || char === '\n') {
      pushRow();
      if (char === '\r' && source[i + 1] === '\n') i++;
    } else if (char === '"') {
      if (cell || closed)
        throw new Error('Unexpected quote. Use the CSV template and standard quoted cells.');
      quoted = true;
    } else {
      if (closed) throw new Error('Unexpected text after a quoted cell.');
      cell += char;
    }
    if (rows.length > MAX_COUNTY_ROWS + 1)
      throw new Error(`Use at most ${MAX_COUNTY_ROWS} resource rows.`);
  }
  if (quoted) throw new Error('A quoted cell is missing its closing quote.');
  pushRow();
  return rows;
}

/**
 * Check every row and collect every problem, with its row number (file row: the header is row 1).
 * `features` (the NC-08 tract polygons) lets rows give latitude/longitude instead of a tract_geoid.
 * Returns { rows, errors }; errors is empty when the whole file is acceptable (import is all-or-nothing).
 */
export function inspectCountyData(text, zones, features = []) {
  if (new TextEncoder().encode(text).length > MAX_COUNTY_BYTES)
    throw new Error('Choose a CSV smaller than 1 MB.');
  const [header, ...rows] = parseCountyCsv(text);
  const allowed = new Set([...COUNTY_COLUMNS, ...OPTIONAL_COLUMNS]);
  if (
    !header ||
    new Set(header).size !== header.length ||
    COUNTY_COLUMNS.some((key) => !header.includes(key)) ||
    header.some((key) => !allowed.has(key))
  ) {
    throw new Error(`Use exactly these column headers: ${COUNTY_COLUMNS.join(', ')}.`);
  }
  if (!rows.length) throw new Error('Add at least one resource row below the template headers.');
  if (rows.length > MAX_COUNTY_ROWS)
    throw new Error(`Use at most ${MAX_COUNTY_ROWS} resource rows.`);
  const catalog = new Map(zones.map((zone) => [String(zone.GEOID), zone]));
  const byId = new Map(zones.map((zone) => [zone.zone_id, zone]));
  const seen = new Set();
  const errors = [];
  const good = [];
  rows.forEach((values, index) => {
    const problem = (message) => errors.push({ record: index + 1, row: index + 2, message });
    if (values.length !== header.length)
      return problem('the number of cells does not match the headers.');
    const row = Object.fromEntries(header.map((key, i) => [key, values[i].trim()]));
    for (const key of OPTIONAL_COLUMNS) row[key] ??= '';
    const start = errors.length;
    const hasLat = row.latitude !== '',
      hasLon = row.longitude !== '';
    let zone = null,
      pin = null;
    if (
      hasLat !== hasLon ||
      (hasLat &&
        (!Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude))))
    )
      problem('latitude and longitude must both be numbers.');
    else if (hasLat) {
      pin = { lat: Number(row.latitude), lon: Number(row.longitude) };
      const id = locate(features, [pin.lon, pin.lat]);
      zone = byId.get(id) ?? null;
      if (!zone) problem(`the location (${row.latitude}, ${row.longitude}) is outside NC-08.`);
      else if (row.tract_geoid && String(zone.GEOID) !== row.tract_geoid)
        problem(`the coordinates fall in tract ${zone.GEOID}, not ${row.tract_geoid}.`);
      else row.tract_geoid = String(zone.GEOID);
    } else if (!row.tract_geoid)
      problem('missing coordinates. Add latitude and longitude, or a tract_geoid.');
    else {
      zone = catalog.get(row.tract_geoid) ?? null;
      if (!/^\d{11}$/.test(row.tract_geoid) || !zone)
        problem('tract_geoid must match an NC-08 tract in Explore. Keep it as eleven digits.');
    }
    for (const key of ['resource_name', 'source'])
      if (!row[key] || row[key].length > 160) problem(`${key} needs between 1 and 160 characters.`);
    if (!RESOURCE_TYPES.includes(row.resource_type))
      problem(`resource_type must be ${RESOURCE_TYPES.join(', ')}.`);
    if (
      row.capacity_people &&
      (!/^\d+$/.test(row.capacity_people) || !Number.isSafeInteger(Number(row.capacity_people)))
    )
      problem('capacity_people must be blank or a nonnegative whole number.');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(row.updated_on) ||
      !Number.isFinite(Date.parse(row.updated_on)) ||
      new Date(row.updated_on).toISOString().slice(0, 10) !== row.updated_on
    )
      problem('updated_on must be a real date in YYYY-MM-DD format.');
    if (row.notes.length > 2000) problem('keep notes within 2,000 characters.');
    if (row.address.length > 200) problem('address needs at most 200 characters.');
    if (zone) {
      const key = JSON.stringify([
        row.tract_geoid,
        row.resource_name.toLowerCase(),
        row.resource_type,
      ]);
      if (seen.has(key)) problem('duplicate resource name and type in this tract.');
      seen.add(key);
    }
    if (errors.length === start && zone)
      good.push({
        ...row,
        capacity_people: row.capacity_people === '' ? null : Number(row.capacity_people),
        zone_id: zone.zone_id,
        county: zone.COUNTY,
        lat: pin ? pin.lat : null,
        lon: pin ? pin.lon : null,
      });
  });
  return { rows: good, errors };
}
/** Validate every row against the original tract catalog. Import is all-or-nothing; the first problem throws. */
export function validateCountyData(text, zones, features = []) {
  const { rows, errors } = inspectCountyData(text, zones, features);
  if (errors.length) throw new Error(`Record ${errors[0].record}: ${errors[0].message}`);
  return rows;
}
