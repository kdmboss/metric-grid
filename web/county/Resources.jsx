import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { Button } from '../ui/Button.jsx';
import { Status } from '../components/EvidencePrimitives.jsx';
import { download } from '../planning.js';
import {
  COUNTY_COLUMNS,
  dashboardTemplate,
  inspectCountyData,
  MAX_COUNTY_BYTES,
  OPTIONAL_COLUMNS,
  RESOURCE_TYPES,
  typeLabel,
} from '../countyData.js';
import { SPRING_SOFT } from '../ui/springs.js';

const MAX_SHOWN_ERRORS = 12;
/** Drop a CSV of places, see them in a table and as pins on the map. It stays in this browser. */
export function Resources({ zones, features, rows, onRows, hoverId, onHover }) {
  const [errors, setErrors] = useState([]),
    [fatal, setFatal] = useState(''),
    [dragging, setDragging] = useState(false),
    [filename, setFilename] = useState('');
  const input = useRef(null),
    version = useRef(0);
  async function importFile(files) {
    const current = ++version.current;
    setDragging(false);
    setErrors([]);
    setFatal('');
    if (files.length !== 1) return setFatal('Choose one CSV file at a time.');
    const file = files[0];
    if (!/\.csv$/i.test(file.name) || file.size > MAX_COUNTY_BYTES)
      return setFatal('Choose a .csv file smaller than 1 MB.');
    try {
      const result = inspectCountyData(await file.text(), zones, features);
      if (current !== version.current) return undefined;
      if (result.errors.length) {
        setErrors(result.errors);
        const n = result.errors.length;
        return setFatal(
          `Nothing was imported: ${n} ${n === 1 ? 'row has' : 'rows have'} a problem.`,
        );
      }
      setFilename(file.name);
      return onRows(result.rows);
    } catch (cause) {
      return current === version.current
        ? setFatal(`Nothing was imported. ${cause.message}`)
        : undefined;
    }
  }
  return (
    <section className="resources" aria-label="County resources">
      <div
        className={`drop-zone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          void importFile(event.dataTransfer.files);
        }}
      >
        <span className="drop-icon" aria-hidden="true">
          <Icon name="upload" size={26} />
        </span>
        <h3>Drop a CSV of warming centers, shelters, or generators</h3>
        <div className="drop-actions">
          <Button variant="secondary" onClick={() => input.current?.click()}>
            Choose file
          </Button>
          <button
            type="button"
            className="text-button"
            onClick={() => download(dashboardTemplate(), 'hearth-county-resources-template.csv')}
          >
            Download template
          </button>
        </div>
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="Choose a CSV file"
          onChange={(event) => {
            if (event.target.files.length) void importFile(event.target.files);
            event.target.value = '';
          }}
        />
        <p className="drop-privacy">Stays in this browser. Nothing is uploaded.</p>
      </div>

      <details className="columns-help" open={rows.length === 0}>
        <summary>Columns the import expects</summary>
        <p>
          <b>Required:</b>{' '}
          {COUNTY_COLUMNS.map((c) => (
            <code key={c}>{c}</code>
          ))}
        </p>
        <p>
          <b>Optional location:</b>{' '}
          {OPTIONAL_COLUMNS.map((c) => (
            <code key={c}>{c}</code>
          ))}
          . Give <code>latitude</code> and <code>longitude</code> (the tract is found for you) or an
          eleven-digit <code>tract_geoid</code>.
        </p>
        <p>
          <code>resource_type</code> is one of {RESOURCE_TYPES.map(typeLabel).join(', ')};{' '}
          <code>updated_on</code> is YYYY-MM-DD; up to 500 rows and 1 MB.
        </p>
      </details>

      {fatal && (
        <div className="import-errors" role="alert">
          <strong>{fatal}</strong>
          {errors.length > 0 && (
            <ul>
              {errors.slice(0, MAX_SHOWN_ERRORS).map((error) => (
                <li key={`${error.row}-${error.message}`}>
                  <b>Row {error.row}:</b> {error.message}
                </li>
              ))}
              {errors.length > MAX_SHOWN_ERRORS && (
                <li>…and {errors.length - MAX_SHOWN_ERRORS} more.</li>
              )}
            </ul>
          )}
        </div>
      )}
      {rows.length > 0 && (
        <>
          <div className="resources-head">
            <span role="status">
              {rows.length} {rows.length === 1 ? 'place' : 'places'} from {filename || 'your file'}
            </span>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                onRows([]);
                setFilename('');
              }}
            >
              Remove
            </button>
          </div>
          <div className="resources-scroll">
            <table className="resources-table">
              <caption className="sr-only">
                Imported places and their status under each plan
              </caption>
              <thead>
                <tr>
                  <th scope="col">Place</th>
                  <th scope="col">Area</th>
                  <th scope="col">MW-only</th>
                  <th scope="col">People-first</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      className={hoverId === row.id ? 'is-hover' : ''}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ ...SPRING_SOFT, delay: Math.min(index * 0.05, 0.5) }}
                      onPointerEnter={() => onHover(row.id)}
                      onPointerLeave={() => onHover(null)}
                    >
                      <td>
                        <strong>{row.resource_name}</strong>
                        <span className="cell-sub">
                          {typeLabel(row.resource_type)}
                          {row.address ? ` · ${row.address}` : ''}
                        </span>
                        {row.lat != null && (
                          <span className="cell-sub">
                            {row.lat.toFixed(5)}, {row.lon.toFixed(5)}
                          </span>
                        )}
                      </td>
                      <td>
                        {row.county.replace(' County', '')}
                        <span className="cell-sub">Zone {row.zone_id}</span>
                      </td>
                      <td>
                        <Status value={row.baseline} />
                      </td>
                      <td>
                        <Status value={row.weighted} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
