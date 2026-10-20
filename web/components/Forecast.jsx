import { Section, DataTable, LineChart } from './EvidencePrimitives.jsx';
import React from 'react';
import { fmt } from '../model.js';
export function Forecast({ section, panel }) {
  return (
    <Section
      hidden={section !== 'forecast'}
      id="forecast"
      title="Why forecasts aren’t enough"
      description={
        'A model can perform well on typical winter days and still miss the ' +
        'morning when it matters most.'
      }
    >
      <div className="forecast-grid">
        <article className="panel">
          <div className="legend">
            <span>
              <i className="swatch observed" />
              Observed demand · EIA-930
            </span>
            <span>
              <i className="swatch aware" />
              Modeled demand
            </span>
          </div>
          <p className="fine">Regional DUK + CPLE demand, MW · local hour ending</p>
          <LineChart
            series={[
              {
                name: 'Observed MW',
                className: 'observed',
                values: panel.series.map((row) => row.actual_mw),
              },
              {
                name: 'Modeled MW',
                className: 'h dashed',
                values: panel.series.map((row) => row.predicted_mw),
              },
            ]}
            labels={(v) => `${fmt(v / 1000)}k`}
            xLabels={(i, full) =>
              full
                ? panel.series[i].local_end.replace('T', ' ')
                : `${panel.series[i].local_end.slice(5, 10)} ${panel.series[i].local_end.slice(11, 13)}h`
            }
            referenceLabel={`Reference hour: modeled demand ${fmt(Math.abs(panel.elliott.gap_pct), 1)}% below observed`}
            referenceIndex={panel.series.findIndex(
              (row) => row.local_end === panel.elliott.local_end,
            )}
            ariaLabel={[
              'Observed and modeled regional demand around Winter Storm Elliott.',
              'At the reference hour the model underpredicts demand by ' +
                `${fmt(Math.abs(panel.elliott.gap_pct), 1)} percent.`,
            ].join(' ')}
          />
        </article>
        <article className="forecast-findings">
          <div className="forecast-number">
            {fmt(Math.abs(panel.elliott.gap_pct), 1)}%<small>underpredicted</small>
          </div>
          <p>
            At the hour ending 07:00 on December 24, the model estimated{' '}
            <strong>{fmt(panel.elliott.predicted_mw)} MW</strong>; observed demand was{' '}
            <strong>{fmt(panel.elliott.actual_mw)} MW</strong>.
          </p>
          <p className="fine">
            Trained on {panel.n_winters} winters, excluding the Elliott month. Cross-validated
            error: {fmt(panel.typical_mape_pct, 1)}%. Observed demand already excludes shed load.
          </p>
        </article>
      </div>
      <details className="details">
        <summary>See model error by temperature</summary>
        <DataTable
          label="Demand model training error by temperature"
          headings={['Temperature', 'Training hours', 'Mean error', 'Absolute percentage error']}
        >
          {panel.error_by_temperature.map((row) => (
            <tr key={row.temp_bin}>
              <td>{row.temp_bin}</td>
              <td>{fmt(row.hours)}</td>
              <td>{fmt(row.mean_pct_error, 1)}%</td>
              <td>{fmt(row.mape_pct, 1)}%</td>
            </tr>
          ))}
        </DataTable>
        <p className="panel-note">
          Model estimates are not utility forecasts and do not predict outages or available supply.
          The Elliott morning was about {fmt(panel.elliott.temp_f)}°F. Extreme cold is rare in the
          training data.
        </p>
      </details>
    </Section>
  );
}
