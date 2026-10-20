import React from 'react';
import { Evidence } from '../Evidence.jsx';
import { fmt } from '../model.js';
import { CountySummary } from '../ComparisonPanels.jsx';
import { awarePlanLabel } from '../presentation.js';
import { ViewTabs } from './ViewTabs.jsx';
import { EvidenceRange } from './EvidenceRange.jsx';
const EVIDENCE_VIEWS = [
  ['counties', 'County summary'],
  ['range', 'Plan range'],
  ['robust', 'Robustness'],
  ['forecast', 'Forecast'],
  ['methods', 'Methods & sources'],
];
export function EvidenceView({
  mode,
  data,
  evidenceTab,
  setEvidenceTab,
  record,
  zones,
  counties,
  summaryCounty,
  setSummaryCounty,
  concentration,
  n,
  distribution,
  selectZone,
  setMode,
}) {
  return (
    <section
      id="panel-evidence"
      role="tabpanel"
      aria-labelledby="tab-evidence"
      hidden={mode !== 'evidence'}
    >
      <ViewTabs
        items={EVIDENCE_VIEWS.filter(([id]) => id !== 'forecast' || data.panel)}
        value={evidenceTab}
        onChange={setEvidenceTab}
        label="Evidence views"
        prefix="evidence"
      />
      {!['counties', 'range'].includes(evidenceTab) && (
        <div
          id={`evidence-${evidenceTab}`}
          role="tabpanel"
          aria-labelledby={`evidence-tab-${evidenceTab}`}
        >
          <Evidence data={data} record={record} section={evidenceTab} />
        </div>
      )}
      <div
        id="evidence-counties"
        role="tabpanel"
        aria-labelledby="evidence-tab-counties"
        hidden={evidenceTab !== 'counties'}
      >
        <CountySummary
          zones={zones}
          record={record}
          counties={counties}
          county={summaryCounty}
          setCounty={setSummaryCounty}
        />
        <div className="concentration-strip">
          <div>
            <span>Where does the burden land?</span>
            <strong>
              {fmt((concentration[0][1] / record.weighted.mw_shed) * 100)}%{' '}
              <small>
                of the {awarePlanLabel(record).toLowerCase()} reduction falls in{' '}
                {concentration[0][0]}.
              </small>
            </strong>
          </div>
          <p>
            {record.cap
              ? '' +
                'The ' +
                `${fmt(data.config.optimizer.county_cap.max_share * 100)}` +
                '% county cap is applied to both plans. It limits concentration by ' +
                'county; it does not resolve every fairness concern.'
              : '' +
                'Try the county cap to limit each county to ' +
                `${fmt(data.config.optimizer.county_cap.max_share * 100)}` +
                '% of the MW cut in both plans.'}
          </p>
        </div>
      </div>
      <EvidenceRange
        evidenceTab={evidenceTab}
        n={n}
        record={record}
        distribution={distribution}
        selectZone={selectZone}
        setMode={setMode}
      />{' '}
      {data.content?.quotes?.length > 0 && (
        <section className="community-section">
          <h2>What people in NC-08 said</h2>
          {data.content.quotes.map((quote, i) => (
            <figure key={i}>
              <blockquote>{quote.quote}</blockquote>
              <figcaption>
                {quote.name} · {quote.role}
              </figcaption>
            </figure>
          ))}
        </section>
      )}
      {data.content?.story && (
        <section className="author-story">
          <h2>Why I built this</h2>
          {data.content.story.split(/\n\s*\n/).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </section>
      )}
    </section>
  );
}
