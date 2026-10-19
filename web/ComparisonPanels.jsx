import React from 'react';
import { fmt } from './model.js';
import { CHANGE_CATEGORIES, countySummary, swapSentence } from './comparison.js';
import { MapCanvas } from './MapCanvas.jsx';

export function DifferencePanel({ changes, visible, setVisible, mapProps }) {
  return <section className="difference-panel" aria-labelledby="difference-title"><div className="difference-heading"><div><h2 id="difference-title">What changed between the two plans?</h2><p className="swap-sentence" aria-live="polite">{swapSentence(changes)}</p></div><label className="difference-toggle"><input type="checkbox" checked={visible} onChange={event => setVisible(event.target.checked)}/>Show difference map</label></div>
    {visible && <MapCanvas {...mapProps} changes={changes} id="difference"/>}
    <div className="difference-legend" aria-label="District-wide category counts">{CHANGE_CATEGORIES.map(([key, label]) => <span key={key}><i className={`difference-swatch difference-${key}`} aria-hidden="true"/><span>{label}</span><strong data-category-count={key}>{fmt(changes.counts[key])}</strong></span>)}</div>
    <p className="small-note">Category counts cover the whole district; county filtering only dims the map. Protected zones remain hatched in this view. {changes.removedMeanSvi != null && changes.addedMeanSvi != null ? <>Average SVI of zones kept on instead: {fmt(changes.removedMeanSvi, 2)}; cut instead: {fmt(changes.addedMeanSvi, 2)}. These are equal-weight tract averages, not counts of people protected.</> : 'Missing SVI stays missing; no vulnerability improvement is inferred where the comparison is unavailable.'}</p>
  </section>;
}

export function CountySummary({ zones, record, counties, county, setCounty }) {
  const summary = countySummary(zones, record, county);
  return <section className="county-summary" aria-labelledby="county-summary-title"><div className="county-summary-heading"><div><h2 id="county-summary-title">What does this mean for a county?</h2><p>Whole-tract public data and the two displayed planning scenarios.</p></div><label htmlFor="summary-county">Summary county<select id="summary-county" value={county} onChange={event => setCounty(event.target.value)}>{counties.map(name => <option key={name}>{name}</option>)}</select></label></div>
    <h3>{county}</h3><dl className="county-facts"><div><dt>Households</dt><dd data-county-value="households">{fmt(summary.households)}</dd></div><div><dt>Electric-heat share</dt><dd data-county-value="heatShare">{summary.heatShare == null ? 'No data' : `${fmt(summary.heatShare * 100, 1)}%`}</dd></div><div><dt>Census tract zones</dt><dd data-county-value="zones">{fmt(summary.zones)}</dd></div><div><dt>Protected zones</dt><dd data-county-value="protectedZones">{fmt(summary.protectedZones)}</dd></div></dl>
    <div className="county-plan-grid">{[['baseline', 'Megawatts only'], ['weighted', 'Vulnerability-aware']].map(([key, label]) => <article key={key} className={`county-plan county-plan-${key}`}><h4>{label}</h4><strong data-county-plan={`${key}-mw`}>{fmt(summary[key].mw, 1)} <small>MW cut</small></strong><p data-county-plan={`${key}-share`}>{summary[key].share == null ? 'No data' : `${fmt(summary[key].share * 100, 1)}%`} of this plan’s total district cut</p><dl><div><dt>Electric-heat homes cut</dt><dd data-county-plan={`${key}-heat`}>{fmt(summary[key].heatHomes)}</dd></div><div><dt>Total homes cut</dt><dd>{fmt(summary[key].households)}</dd></div></dl></article>)}</div>
    <p className="small-note">Estimated MW are modeled district-scale allocations. Electric-heat share is summed electric-heating households divided by summed ACS heating-fuel occupied households. Whole tracts may extend outside the district. The summary selector does not filter the maps or change either plan.</p>
  </section>;
}
