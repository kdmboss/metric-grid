import { Arrow } from './components/Arrow.jsx';
import { awarePlanLabel } from './presentation.js';
import React, { useRef, useState } from 'react';
import { Status } from './Evidence.jsx';
import { status } from './model.js';
import { download } from './planning.js';
import {
  countyTemplate,
  MAX_COUNTY_BYTES,
  RESOURCE_TYPES,
  validateCountyData,
} from './countyData.js';
export function CountyData({ zones, record }) {
  function _handleChange(event) {
    if (event.target.files.length) importFile(event.target.files);
    event.target.value = '';
  }
  function _handleDrop(event) {
    event.preventDefault();
    importFile(event.dataTransfer.files);
  }
  function _handleDragOver(event) {
    event.preventDefault();
    setDragging(true);
  }
  const [rows, setRows] = useState([]),
    [filename, setFilename] = useState('');
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [dragging, setDragging] = useState(false),
    [county, setCounty] = useState('');
  const version = useRef(0),
    input = useRef(null);
  const counties = [...new Set(rows.map((row) => row.county))].sort();
  const shown = rows.filter((row) => !county || row.county === county);
  const byZone = new Map(zones.map((zone) => [zone.zone_id, zone]));
  async function importFile(files) {
    const current = ++version.current;
    setDragging(false);
    setError('');
    if (files.length !== 1) {
      setBusy(false);
      setError('Choose one CSV file at a time.');
      return;
    }
    const file = files[0];
    if (!/\.csv$/i.test(file.name) || file.size > MAX_COUNTY_BYTES) {
      setBusy(false);
      setError('Choose a .csv file smaller than 1 MB.');
      return;
    }
    setBusy(true);
    try {
      const parsed = validateCountyData(await file.text(), zones);
      if (current !== version.current) return;
      setRows(parsed);
      setFilename(file.name);
      setCounty('');
    } catch (cause) {
      if (current === version.current) setError(`File not imported. ${cause.message}`);
    } finally {
      if (current === version.current) setBusy(false);
    }
  }
  function clear() {
    version.current++;
    setRows([]);
    setFilename('');
    setCounty('');
    setError('');
    setBusy(false);
    if (input.current) input.current.value = '';
  }
  return (
    <section className="county-data panel" aria-labelledby="county-data-title">
      <div className="section-head">
        <div>
          <span className="workspace-kicker">Bring local knowledge</span>
          <h2 id="county-data-title">County data</h2>
          <p>Add a county resource list to compare with the current tract scenarios.</p>
        </div>
        <button
          className="button"
          onClick={() => download(countyTemplate(), 'hearth-county-data-template.csv')}
        >
          Download CSV template <Arrow direction="down" />
        </button>
      </div>
      <div
        className={`county-drop${dragging ? ' is-dragging' : ''}`}
        onDragOver={_handleDragOver}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={_handleDrop}
      >
        <strong>Drop a county resource CSV here</strong>
        <p>
          Warming centers, backup power, outreach, or other local resources. One file, up to 500
          rows and 1 MB.
        </p>
        <label htmlFor="county-data-file">Or choose a CSV file</label>
        <input
          ref={input}
          id="county-data-file"
          type="file"
          accept=".csv,text/csv"
          onChange={_handleChange}
        />
      </div>

      <details className="county-schema">
        <summary>What should the file contain?</summary>
        <p>
          Use the template headers. Each resource needs an eleven-digit <code>tract_geoid</code>{' '}
          from Explore, a <code>resource_name</code>, a <code>resource_type</code> (
          {RESOURCE_TYPES.join(', ')}), a named <code>source</code>, and an <code>updated_on</code>{' '}
          date (YYYY-MM-DD). Optional: <code>capacity_people</code> (a whole number) and{' '}
          <code>notes</code>. County and zone are matched from the app’s existing tract catalog.
        </p>
      </details>
      <div role="status" aria-live="polite">
        {busy
          ? 'Checking the CSV…'
          : rows.length
            ? `${rows.length} county-supplied resource records loaded from ${filename}.`
            : ''}
      </div>
      {error && (
        <p className="county-data-error" role="alert">
          {error}
        </p>
      )}
      {rows.length > 0 && (
        <>
          <div className="county-data-toolbar">
            <div className="county-filter-field">
              <label htmlFor="county-resource-filter">Show county</label>
              <select
                id="county-resource-filter"
                value={county}
                onChange={(event) => setCounty(event.target.value)}
              >
                <option value="">All imported counties</option>
                {counties.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <button className="text-button" onClick={clear}>
              Remove imported data
            </button>
          </div>

          <div
            className="county-data-scroll"
            role="region"
            aria-label="Imported county resources"
            tabIndex="0"
          >
            <table>
              <caption className="sr-only">
                County-supplied resources and current modeled tract selections
              </caption>
              <thead>
                <tr>
                  {[
                    'Resource / source',
                    'County / tract',
                    'Capacity (people)',
                    'Megawatts only',
                    awarePlanLabel(record),
                    'Notes',
                  ].map((title) => (
                    <th key={title} scope="col">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{row.resource_name}</strong>
                      <span className="cell-sub">{row.resource_type.replaceAll('_', ' ')}</span>
                      <span className="cell-sub">
                        {row.source} · {row.updated_on}
                      </span>
                    </td>
                    <td>
                      {row.county}
                      <span className="cell-sub">
                        Zone {row.zone_id} · {row.tract_geoid}
                      </span>
                    </td>
                    <td>{row.capacity_people ?? 'Not supplied'}</td>
                    <td>
                      <Status value={status(byZone.get(row.zone_id), record.baseline)} />
                    </td>
                    <td>
                      <Status value={status(byZone.get(row.zone_id), record.weighted)} />
                    </td>
                    <td className="county-data-note">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
