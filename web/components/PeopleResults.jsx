import React from 'react';
import { CountUp } from '../ui/CountUp.jsx';
import { Pop } from '../ui/Pop.jsx';
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
          <span className="mobile-copy">Electric-heat homes</span>{' '}
          <Help label="electric-heat homes">
            Homes heated mainly by electricity; the main number shows the {label.toLowerCase()}{' '}
            result.
          </Help>
        </div>
        <strong>
          <CountUp value={w.electric_heat_households} format={(v) => fmt(v)} />
        </strong>
        <p>
          <span className="desktop-copy">
            vs. {fmt(b.electric_heat_households)} · megawatts only
          </span>
          <span className="mobile-copy">vs {fmt(b.electric_heat_households)} MW-only</span>
        </p>
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
          {direction === 'unchanged' ? (
            '0%'
          ) : (
            <>
              <CountUp
                value={Math.abs(human)}
                format={(v) => fmt(v, Math.abs(human) < 1 ? 1 : 0)}
              />
              %
            </>
          )}
        </strong>
        <p>
          <span className="desktop-copy">
            {direction === 'unchanged'
              ? 'Unchanged from'
              : `${direction[0].toUpperCase()}${direction.slice(1)} than`}{' '}
            the typical MW-only plan
          </span>
          <span className="mobile-copy">
            {direction === 'unchanged'
              ? 'Same as'
              : direction === 'lower'
                ? 'Lower than'
                : 'Higher than'}{' '}
            MW-only
          </span>
        </p>
      </article>
      <article className="honest-result">
        <div className="result-label">
          <span className="desktop-copy">Total homes cut · the trade-off</span>
          <span className="mobile-copy">
            {homes > 0 ? 'More homes cut' : homes < 0 ? 'Fewer homes cut' : 'Total homes cut'}
          </span>
        </div>
        <strong>
          <Pop trigger={homes} className="delta-pop">
            <CountUp
              value={homes}
              format={(v) => (Math.round(v) === 0 ? '0' : signed(Math.round(v)))}
            />
          </Pop>
        </strong>
        <p>
          <span className="desktop-copy">
            {homes === 0 ? 'Same total' : `${homes > 0 ? 'More' : 'Fewer'} homes cut`} ·{' '}
            {fmt(w.households)} vs. {fmt(b.households)}
          </span>
          <span className="mobile-copy">
            {fmt(w.households)} vs {fmt(b.households)}
          </span>
        </p>
      </article>
    </div>
  );
}
