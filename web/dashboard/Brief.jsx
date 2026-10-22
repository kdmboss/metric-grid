import React from 'react';
import { createPortal } from 'react-dom';
import { Status } from '../components/EvidencePrimitives.jsx';
import { fmt } from '../model.js';
import { typeLabel } from '../countyData.js';
import { areaName, reasonChips } from '../county/county.js';

export const BRIEF_LINE =
  'Modeled planning scenario built on public data and a replay of the Christmas Eve 2022 storm. ' +
  'It is not Duke Energy’s method, not a prediction for any home, and not an operational tool.';
export const briefTitle = (county) =>
  `${county && county !== 'All NC-08' ? county : 'NC-08'} outage planning brief`;
export const scenarioLine = (record, priority, cap, target) =>
  `${target === 'elliott' ? 'Elliott storm' : `${target}% shortage`} · ${fmt(record.target_mw, 0)} MW cut · ` +
  `${priority} priority · county cap ${cap ? 'on' : 'off'}`;
/** One-page brief for a county: scenario, sentence, shortlisted areas with reasons, uploaded resources. */
export function BriefPage({
  county,
  scenario,
  sentence,
  shift,
  items,
  places,
  resources,
  onClose,
  today,
}) {
  return (
    <div className="brief-root">
      <div className="brief-bar">
        <button type="button" className="ios-btn ios-btn-primary" onClick={() => window.print()}>
          Print or save as PDF
        </button>
        <button type="button" className="ios-btn ios-btn-plain" onClick={onClose}>
          Close
        </button>
      </div>
      <article className="brief" aria-label={briefTitle(county)}>
        <header>
          <p className="brief-kicker">HEARTH · NC-08</p>
          <h1>{briefTitle(county)}</h1>
          <p className="brief-scenario">{scenario}</p>
        </header>
        <section>
          <h2>What the model shows</h2>
          <p>{sentence}</p>
          {shift && <p>{shift}</p>}
        </section>
        <section>
          <h2>Areas to investigate</h2>
          {items.length ? (
            <ol className="brief-areas">
              {items.map(({ zone, note }) => (
                <li key={zone.zone_id}>
                  <b>
                    {areaName(zone, places)} · Zone {zone.zone_id}
                  </b>
                  <span>{reasonChips(zone).join(' · ')}</span>
                  <span>
                    MW-only <Status value={zone.baseline} /> · People-first{' '}
                    <Status value={zone.weighted} />
                  </span>
                  {note && <em>{note}</em>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="brief-empty">No areas shortlisted yet.</p>
          )}
        </section>
        <section>
          <h2>Local resources (uploaded)</h2>
          {resources.length ? (
            <table>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Area</th>
                  <th>MW-only</th>
                  <th>People-first</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <b>{row.resource_name}</b>
                      <br />
                      {typeLabel(row.resource_type)}
                      {row.address ? ` · ${row.address}` : ''}
                    </td>
                    <td>Zone {row.zone_id}</td>
                    <td>
                      <Status value={row.baseline} />
                    </td>
                    <td>
                      <Status value={row.weighted} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="brief-empty">No resources uploaded.</p>
          )}
        </section>
        <footer>
          <p>{BRIEF_LINE}</p>
          <p>Prepared {today} from HEARTH’s frozen results. Data stays on this computer.</p>
        </footer>
      </article>
    </div>
  );
}
/** The brief as a full-window overlay that prints as one page. */
export function Brief(props) {
  return createPortal(<BriefPage {...props} />, document.body);
}
