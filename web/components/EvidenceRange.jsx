import React from 'react';
import { StripChart } from '../Evidence.jsx';
import { fmt } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
import { comparisonLabel } from '../planning.js';
const MEASURES = [
  ['electric_heat_households', 'Electric-heat homes cut', 'Homes'],
  ['h_human', 'Vulnerability-weighted impact', 'Weighted households'],
  ['h_econ', 'Modeled interruption cost', '2013 dollars · 1 hour'],
  ['households', 'Total homes cut', 'Homes'],
];
export function EvidenceRange({ evidenceTab, n, record, distribution, selectZone, setMode }) {
  return (
    <div
      id="evidence-range"
      role="tabpanel"
      aria-labelledby="evidence-tab-range"
      hidden={evidenceTab !== 'range'}
    >
      <div className="distribution-section">
        <div className="section-head">
          <div>
            <h2>One result. {n} ways to compare it.</h2>
            <p>
              Each neutral dot is a megawatts-only plan. The large marker shows the{' '}
              {awarePlanLabel(record).toLowerCase()} result. A lower value means fewer modeled
              consequences on that measure.
            </p>
          </div>
        </div>
        <div className="legend">
          <span>
            <i className="swatch dot baseline" />
            Each megawatts-only plan
          </span>
          <span>
            <i className="swatch diamond" />
            Typical plan
          </span>
          <span>
            <i className="swatch dot aware" />
            {awarePlanLabel(record)}
          </span>
          <span>
            <i className="swatch cut" />
            Total-home trade-off
          </span>
        </div>
        <div className="distribution-rows">
          {MEASURES.map(([key, title, unit]) => (
            <div
              key={key}
              className={`distribution-row ${key === 'households' ? 'household-distribution' : ''}`}
            >
              <div className="distribution-label">
                <h3>{title}</h3>
                <span className="measure-unit">{unit}</span>
                <strong>
                  {key === 'h_econ' ? '$' : ''}
                  {fmt(record.weighted[key])}
                </strong>
                <p>{comparisonLabel(record.loadonly[key], n)}</p>
              </div>
              <StripChart
                metric={key}
                title={title}
                awareLabel={awarePlanLabel(record)}
                unit={unit}
                values={distribution.map((m) => m[key])}
                baseline={record.baseline[key]}
                weighted={record.weighted[key]}
                summary={record.loadonly[key]}
              />
            </div>
          ))}
        </div>

        <details className="details changed-zones">
          <summary>{record.zones_differ.length} zones differ between the displayed plans</summary>
          <div className="detail-body two-columns">
            {[
              [
                'Kept on instead',
                record.baseline.zone_ids.filter((id) => !record.weighted.zone_ids.includes(id)),
              ],
              [
                'Cut instead',
                record.weighted.zone_ids.filter((id) => !record.baseline.zone_ids.includes(id)),
              ],
            ].map(([label, ids]) => (
              <div key={label}>
                <h3>{label}</h3>
                <div className="zone-chips">
                  {ids.map((id) => {
                    function _handleClick() {
                      selectZone(id);
                      setMode('explore');
                    }
                    return (
                      <button key={id} className="button" onClick={_handleClick}>
                        Zone {id}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
