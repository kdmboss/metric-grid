import React from 'react';
import { change, fmt, signed } from '../model.js';
import { awarePlanLabel, comparisonDirection } from '../presentation.js';
import { Help } from './Help.jsx';
export function PeopleResults({ record: r }) {
  const b = r.baseline,
    w = r.weighted,
    human = change(b.h_human, w.h_human),
    homes = w.households - b.households;
  const direction = comparisonDirection(b.h_human, w.h_human),
    label = awarePlanLabel(r);
  return (
    <div className="people-results" aria-live="polite">
      <article>
        <div className="result-label">
          <span className="desktop-copy">Electric-heat homes cut</span>
          <span className="mobile-copy">Electric-heat cuts</span>{' '}
          <Help label="electric-heat homes">
            Homes heated mainly by electricity; the main number shows the {label.toLowerCase()}{' '}
            result.
          </Help>
        </div>
        <strong>{fmt(w.electric_heat_households)}</strong>
        <p>vs. {fmt(b.electric_heat_households)} · megawatts only</p>
      </article>
      <article>
        <div className="result-label">
          <span className="desktop-copy">Vulnerability-weighted impact</span>
          <span className="mobile-copy">Weighted impact</span>{' '}
          <Help label="vulnerability-weighted impact">
            A score that weights households by CDC social vulnerability and electric-heat share.
          </Help>
        </div>
        <strong>
          {direction === 'unchanged'
            ? '0%'
            : `${fmt(Math.abs(human), Math.abs(human) < 1 ? 1 : 0)}%`}
        </strong>
        <p>
          {direction === 'unchanged'
            ? 'Unchanged from'
            : `${direction[0].toUpperCase()}${direction.slice(1)} than`}{' '}
          the typical megawatts-only plan
        </p>
      </article>
      <article className="honest-result">
        <div className="result-label">
          <span className="desktop-copy">Total homes cut · the trade-off</span>
          <span className="mobile-copy">Total homes cut</span>
        </div>
        <strong>{homes === 0 ? '0' : signed(homes)}</strong>
        <p>
          {homes === 0 ? 'Same total' : `${homes > 0 ? 'More' : 'Fewer'} homes cut`} ·{' '}
          {fmt(w.households)} vs. {fmt(b.households)}
        </p>
      </article>
    </div>
  );
}
