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
export const RESOURCE_TYPES = ['warming_center', 'backup_power', 'outreach', 'other'];
export const MAX_COUNTY_BYTES = 1024 * 1024;
export const MAX_COUNTY_ROWS = 500;
export const countyTemplate = () => `${COUNTY_COLUMNS.join(',')}\r\n`;

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

/** Validate every row against the original tract catalog. Import is all-or-nothing. */
export function validateCountyData(text, zones) {
  if (new TextEncoder().encode(text).length > MAX_COUNTY_BYTES)
    throw new Error('Choose a CSV smaller than 1 MB.');
  const [header, ...rows] = parseCountyCsv(text);
  if (
    !header ||
    header.length !== COUNTY_COLUMNS.length ||
    new Set(header).size !== header.length ||
    COUNTY_COLUMNS.some((key) => !header.includes(key))
  ) {
    throw new Error(`Use exactly these column headers: ${COUNTY_COLUMNS.join(', ')}.`);
  }
  if (!rows.length) throw new Error('Add at least one resource row below the template headers.');
  if (rows.length > MAX_COUNTY_ROWS)
    throw new Error(`Use at most ${MAX_COUNTY_ROWS} resource rows.`);
  const catalog = new Map(zones.map((zone) => [String(zone.GEOID), zone]));
  const seen = new Set();
  return rows.map((values, index) => {
    const fail = (message) => {
      throw new Error(`Record ${index + 1}: ${message}`);
    };
    if (values.length !== header.length) fail('the number of cells does not match the headers.');
    const row = Object.fromEntries(header.map((key, i) => [key, values[i].trim()]));
    const zone = catalog.get(row.tract_geoid);
    if (!/^\d{11}$/.test(row.tract_geoid) || !zone)
      fail('tract_geoid must match an NC-08 tract in Explore. Keep it as eleven digits.');
    for (const key of ['resource_name', 'source'])
      if (!row[key] || row[key].length > 160) fail(`${key} needs between 1 and 160 characters.`);
    if (!RESOURCE_TYPES.includes(row.resource_type))
      fail(`resource_type must be ${RESOURCE_TYPES.join(', ')}.`);
    if (
      row.capacity_people &&
      (!/^\d+$/.test(row.capacity_people) || !Number.isSafeInteger(Number(row.capacity_people)))
    )
      fail('capacity_people must be blank or a nonnegative whole number.');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(row.updated_on) ||
      !Number.isFinite(Date.parse(row.updated_on)) ||
      new Date(row.updated_on).toISOString().slice(0, 10) !== row.updated_on
    )
      fail('updated_on must be a real date in YYYY-MM-DD format.');
    if (row.notes.length > 2000) fail('keep notes within 2,000 characters.');
    const key = JSON.stringify([
      row.tract_geoid,
      row.resource_name.toLowerCase(),
      row.resource_type,
    ]);
    if (seen.has(key)) fail('duplicate resource name and type in this tract.');
    seen.add(key);
    return {
      ...row,
      capacity_people: row.capacity_people === '' ? null : Number(row.capacity_people),
      zone_id: zone.zone_id,
      county: zone.COUNTY,
    };
  });
}
