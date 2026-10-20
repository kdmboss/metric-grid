// Kept on one line for the unchanged source-copy audit.
/* eslint-disable max-len -- the unchanged audit matches this exact source sentence. */
const DISTRICT_SCALING =
  'The Elliott regional event anchors this scenario. NC-08 load and required reduction are modeled district-scale estimates, not observed utility circuit values.';
/* eslint-enable max-len */
import { Forecast } from './components/Forecast.jsx';
import { Robustness } from './components/Robustness.jsx';
import {
  Brand,
  Section,
  Badge,
  DataTable,
  Status,
  StripChart,
  LineChart,
} from './components/EvidencePrimitives.jsx';
import { Arrow } from './components/Arrow.jsx';
import React from 'react';
import { fmt } from './model.js';
export function Evidence({ data, record: r, section = 'robust' }) {
  const { constants: c, config: cfg, sensitivity: sens, panel } = data;
  const plans = data.loadonly.sets[r.loadonly_key].plans;
  const solved = sens.rows.filter((row) => row.solved);
  return (
    <div className="evidence-content">
      <Robustness section={section} solved={solved} sens={sens} data={data} />

      {panel && <Forecast section={section} panel={panel} />}

      <div className="methods-disclosure" hidden={section !== 'methods'}>
        <Section
          id="methods"
          title="Methods & sources"
          description="The model is useful only when its assumptions travel with the results."
        >
          <div className="method-warning">
            <h3>What this can and can’t tell you</h3>
            <p>
              HEARTH compares possible cuts using public census-tract data and results computed by
              the Python model. It cannot predict a home’s power supply or guide utility switching.
              District load is estimated; whole tracts can extend beyond the district. The shortlist
              helps planners choose places to investigate for outreach, warming centers, and backup
              power; it does not measure the benefit of those steps. Plan frequencies describe the
              generated comparison set, which does not cover every possible plan. The vulnerability
              score does not count specific families or seniors protected. County imports add local
              context and stay in the browser session; shortlist notes stay in browser storage.
              Facility data can be incomplete; confirm county resource availability with the source.
            </p>
          </div>
          <p className="district-sentence">{DISTRICT_SCALING}</p>
          <div className="method-grid">
            <article>
              <h3>Same technical target</h3>
              <p>
                Both plans must reduce between {fmt(r.band_lo_mw, 1)} and {fmt(r.band_hi_mw, 1)} MW.
                The displayed band is target plus {r.delta_pct_used}%. The district’s{' '}
                {fmt(c.D_NC08_mw)} MW load is scaled from regional demand using housing units and
                jobs.
              </p>
            </article>
            <article>
              <h3>Explicit value judgments</h3>
              <p>
                Human harm = households × ({cfg.harm.w_svi} × SVI + {cfg.harm.w_eheat} ×
                electric-heat share). The priority slider blends human harm and interruption cost
                after each is normalized by its maximum across zones.
              </p>
            </article>
            <article>
              <h3>A reproducible comparison</h3>
              <p>
                {plans.length} load-only plans, generated with a fixed seed, meet the target with at
                most {data.loadonly.method.near_opt_pct}% overshoot. Some valid plans are more
                likely to be generated than others. The typical plan is closest to the median across
                four impact measures.
              </p>
            </article>
            <article>
              <h3>Costs and critical facilities</h3>
              <p>
                Costs use LBNL interruption estimates in 2013 dollars for a one-hour outage.{' '}
                {c.n_protected} entire tracts are excluded because of protected facilities;
                OpenStreetMap coverage is incomplete. Fire and police are not hard exclusions.
              </p>
            </article>
          </div>
          <details className="details">
            <summary>Public datasets and vintages</summary>
            <DataTable label="Public data sources" headings={['Dataset', 'Vintage', 'Source']}>
              {c.datasets.map((source) => (
                <tr key={source.name}>
                  <td>{source.name}</td>
                  <td>{source.vintage}</td>
                  <td>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      View source <Arrow direction="external" />
                    </a>
                  </td>
                </tr>
              ))}
            </DataTable>
          </details>
          <p className="panel-note">
            Historical opener:{' '}
            <a href={data.history.customers_source_url} target="_blank" rel="noreferrer">
              {data.history.customers_source_title}
            </a>{' '}
            reports approximately {fmt(data.history.approx_customers_interrupted)} customers
            interrupted. The start time comes from the SC ORS report in Data provenance. The
            temperature comes from KCLT at the reference hour.
          </p>
          <div className="document-links">
            <a href="/methods/ASSUMPTIONS.md" target="_blank" rel="noreferrer">
              Full assumptions <Arrow direction="external" />
            </a>
            <a href="/methods/DATA_SOURCES.md" target="_blank" rel="noreferrer">
              Data provenance <Arrow direction="external" />
            </a>
            <a href="/methods/AI_DISCLOSURE.md" target="_blank" rel="noreferrer">
              AI disclosure <Arrow direction="external" />
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}
export { Brand, Section, Badge, DataTable, Status, StripChart, LineChart };
