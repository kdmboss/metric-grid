import { Section, DataTable, LineChart } from './EvidencePrimitives.jsx';
import React from 'react';
import { fmt, signed } from '../model.js';
export function Robustness({ section, solved, sens, data }) {
  return (
    <Section
      hidden={section !== 'robust'}
      id="robust"
      title="How much do the assumptions matter?"
      description={[
        `A sensitivity analysis across ${solved.length} solved settings.`,
        'These results use their own targets and assumptions, independent of the controls above.',
      ].join(' ')}
    >
      <div className="two-columns">
        <article className="panel robustness">
          <div className="robust-stat">
            <strong>
              {solved.filter((row) => row.human_change_pct < 0).length}
              <span> / {solved.length}</span>
            </strong>
            <p>
              settings reduce vulnerability-weighted harm
              <br />
              vs. their typical load-only plan
            </p>
          </div>
          <p>
            At α = 0, the objective weighs business cost only. Lower interruption cost can come with
            higher human harm.
          </p>
          <p>
            In{' '}
            <strong>
              {solved.filter((row) => row.households_change > 0).length} of {solved.length}
            </strong>{' '}
            settings, the vulnerability-aware plan cuts more households overall. It reduces modeled
            interruption cost in{' '}
            <strong>
              {solved.filter((row) => row.econ_change_pct < 0).length} of {solved.length}
            </strong>
            .
          </p>
          <p className="fine">
            Across the tested settings: {sens.classes.always.length} zones always cut,{' '}
            {sens.classes.sometimes.length} sometimes cut, {sens.classes.never.length} never cut,
            and {sens.classes.protected.length} protected.
          </p>
        </article>
        <article className="panel">
          <h3>The priority trade-off</h3>
          <p className="fine">Elliott target · county cap off · change vs. typical plan</p>
          <div className="legend">
            <span>
              <i className="swatch dot aware" />
              Vulnerability-weighted households
            </span>
            <span>
              <i className="swatch dot cost" />
              Cost
            </span>
            <span>
              <i className="swatch dot cut" />
              Households
            </span>
          </div>
          <LineChart
            series={[
              ['h', 'human_change_pct', 'Vulnerability-weighted households'],
              ['c', 'econ_change_pct', 'Interruption cost'],
              ['hh', 'households_change_pct', 'Households'],
            ].map(([className, key, name]) => ({
              className,
              name,
              values: data.sweep.filter((row) => row.solved).map((row) => row[key]),
            }))}
            domain={[-100, 100]}
            labels={(v) => `${v > 0 ? '+' : ''}${fmt(v)}%`}
            xLabels={(i) => ['Cost', 'α .25', 'α .50', 'α .75', 'People'][i]}
            ariaLabel={
              'Sensitivity of human harm, cost, and total households to the planning ' +
              'priority. Below zero means lower than the typical load-only plan.'
            }
          />
          <p className="fine">Below zero = less. The chart reports the frozen alpha sweep.</p>
        </article>
      </div>
      <details className="details">
        <summary>Review all sensitivity settings</summary>
        <DataTable
          label="Sensitivity settings"
          headings={[
            'Setting',
            'Alpha',
            'SVI weight',
            'Human harm change',
            'Cost change',
            'Households change',
          ]}
        >
          {solved.map((row, i) => (
            <tr key={i}>
              <td>{row.setting}</td>
              <td>{row.alpha}</td>
              <td>{row.w_svi}</td>
              <td>{fmt(row.human_change_pct, 1)}%</td>
              <td>{fmt(row.econ_change_pct, 1)}%</td>
              <td>{signed(row.households_change)}</td>
            </tr>
          ))}
        </DataTable>
      </details>
    </Section>
  );
}
