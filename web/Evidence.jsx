import React from 'react';
import { fmt, signed } from './model.js';

export function Brand() {
  return <a className="brand" href="#overview" aria-label="Metric Grid home"><span className="brand-grid" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} className={i % 4 === 0 ? 'lit' : ''} />)}</span><span>Metric<span className="brand-light">Grid</span></span></a>;
}
export function Section({ id, title, description, children, aside }) {
  return <section id={id} className="section"><div className="section-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{aside}</div>{children}</section>;
}
export function Badge({ children, tone = '' }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function DataTable({ headings, children, label }) {
  return <div className="table-scroll" tabIndex="0" role="region" aria-label={label}><table><thead><tr>{headings.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
export function Status({ value }) { return <span className={`status ${value === 'Cut' ? 'cut' : value === 'Protected' ? 'protected' : 'kept'}`}>{value}</span>; }

export function StripChart({ metric, title, unit, values, baseline, weighted, summary }) {
  const all = [...values, baseline, weighted], min = Math.min(...all), max = Math.max(...all), pad = (max - min) * .13 || 1;
  const lo = min - pad, hi = max + pad, x = value => 24 + (value - lo) / (hi - lo) * 552;
  return <article className="chart-card"><div className="chart-heading"><h3>{title}</h3><span>{unit}</span></div>
    <svg viewBox="0 0 600 172" role="img" aria-label={`${title}. Load-only range ${fmt(summary.min)} to ${fmt(summary.max)}. Vulnerability-aware ${fmt(weighted)}.`}>
      {Array.from({ length: 5 }, (_, i) => { const value = min + (max - min) * i / 4; return <g key={i}><line x1={x(value)} x2={x(value)} y1="20" y2="134" className="chart-grid"/><text x={x(value)} y="158" textAnchor="middle" className="axis-label">{metric === 'h_econ' ? `$${fmt(value / 1000)}k` : fmt(value)}</text></g>; })}
      {values.map((value, i) => <circle key={i} cx={x(value)} cy={35 + ((i * 67) % 89)} r="2.8" className="plan-dot"><title>Load-only plan {i + 1}: {fmt(value)}</title></circle>)}
      <path d={`M${x(baseline)} 68l6 7-6 7-6-7Z`} className="typical-dot"><title>Typical plan: {fmt(baseline)}</title></path>
      <circle cx={x(weighted)} cy="75" r="7" className="weighted-dot"><title>Vulnerability-aware: {fmt(weighted)}</title></circle>
    </svg><p className="chart-caption">{summary.n_plans_more} of {values.length} load-only plans have a higher value.</p></article>;
}

export function LineChart({ series, labels, xLabels, domain, ariaLabel, referenceIndex, referenceLabel }) {
  const count = series[0].values.length;
  const all = series.flatMap(s => s.values).filter(Number.isFinite);
  const [lo, hi] = domain || [Math.floor(Math.min(...all) / 1000) * 1000, Math.ceil(Math.max(...all) / 1000) * 1000];
  const x = i => 58 + i / (count - 1) * 518, y = v => 215 - (v - lo) / (hi - lo) * 185;
  return <svg className="line-chart" viewBox="0 0 600 265" role="img" aria-label={ariaLabel}>
    {Array.from({ length: 5 }, (_, i) => { const v = lo + (hi - lo) * i / 4; return <g key={i}><line x1="58" x2="576" y1={y(v)} y2={y(v)} className="chart-grid"/><text x="48" y={y(v) + 4} textAnchor="end" className="axis-label">{labels(v)}</text></g>; })}
    {lo < 0 && hi > 0 && <line x1="58" x2="576" y1={y(0)} y2={y(0)} className="zero-line"/>}
    {referenceIndex != null && <line x1={x(referenceIndex)} x2={x(referenceIndex)} y1="26" y2="215" className="reference-line"/>}
    {referenceLabel && <text x="58" y="16" className="axis-label">{referenceLabel}</text>}
    {series.map(s => <g key={s.name}><path d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')} className={`series-line ${s.className}`}/>{s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={count > 10 ? 5 : 4} className={`series-point ${s.className} ${count > 10 ? 'hidden-point' : ''}`}><title>{s.name} · {xLabels(i, true)}: {fmt(v, count > 10 ? 0 : 1)}</title></circle>)}</g>)}
    {Array.from({ length: Math.min(count, 5) }, (_, i) => { const index = Math.round(i * (count - 1) / (Math.min(count, 5) - 1)); return <text key={i} x={x(index)} y="245" textAnchor="middle" className="axis-label">{xLabels(index)}</text>; })}
  </svg>;
}

export function Evidence({ data, record: r }) {
  const { constants: c, config: cfg, sensitivity: sens, panel } = data;
  const plans = data.loadonly.sets[r.loadonly_key].plans;
  const solved = sens.rows.filter(row => row.solved);
  return <div className="evidence-content">
    <Section id="robust" title="How much do the assumptions matter?" description={`A sensitivity analysis across ${solved.length} solved settings. These results use their own targets and assumptions, independent of the controls above.`}>
      <div className="two-columns"><article className="panel robustness"><div className="robust-stat"><strong>{solved.filter(row => row.human_change_pct < 0).length}<span> / {solved.length}</span></strong><p>settings reduce vulnerability-weighted harm<br/>vs. their typical load-only plan</p></div><p>At α = 0, the objective weighs business cost only. Lower interruption cost can come with higher human harm.</p><p>In <strong>{solved.filter(row => row.households_change > 0).length} of {solved.length}</strong> settings, the vulnerability-aware plan cuts more households overall. It reduces modeled interruption cost in <strong>{solved.filter(row => row.econ_change_pct < 0).length} of {solved.length}</strong>.</p><p className="fine">Across the tested settings: {sens.classes.always.length} zones always cut, {sens.classes.sometimes.length} sometimes cut, {sens.classes.never.length} never cut, and {sens.classes.protected.length} protected.</p></article>
      <article className="panel"><h3>The priority trade-off</h3><p className="fine">Elliott target · county cap off · change vs. typical plan</p><div className="legend"><span><i className="swatch dot aware"/>Vulnerability-weighted households</span><span><i className="swatch dot cost"/>Cost</span><span><i className="swatch dot cut"/>Households</span></div><LineChart series={[['h', 'human_change_pct', 'Vulnerability-weighted households'], ['c', 'econ_change_pct', 'Interruption cost'], ['hh', 'households_change_pct', 'Households']].map(([className, key, name]) => ({ className, name, values: data.sweep.filter(row => row.solved).map(row => row[key]) }))} domain={[-100, 100]} labels={v => `${v > 0 ? '+' : ''}${fmt(v)}%`} xLabels={i => ['Cost', 'α .25', 'α .50', 'α .75', 'People'][i]} ariaLabel="Sensitivity of human harm, cost, and total households to the planning priority. Below zero means lower than the typical load-only plan."/><p className="fine">Below zero = less. The chart reports the frozen alpha sweep.</p></article></div>
      <details className="details"><summary>Review all sensitivity settings</summary><DataTable label="Sensitivity settings" headings={['Setting', 'Alpha', 'SVI weight', 'Human harm change', 'Cost change', 'Households change']}>{solved.map((row, i) => <tr key={i}><td>{row.setting}</td><td>{row.alpha}</td><td>{row.w_svi}</td><td>{fmt(row.human_change_pct, 1)}%</td><td>{fmt(row.econ_change_pct, 1)}%</td><td>{signed(row.households_change)}</td></tr>)}</DataTable></details>
    </Section>

    {panel && <Section id="forecast" title="Why forecasts aren’t enough" description="A model can perform well on typical winter days and still miss the morning when it matters most.">
      <div className="forecast-grid"><article className="panel"><div className="legend"><span><i className="swatch observed"/>Observed demand · EIA-930</span><span><i className="swatch aware"/>Modeled demand</span></div><p className="fine">Regional DUK + CPLE demand, MW · local hour ending</p><LineChart series={[{ name: 'Observed MW', className: 'observed', values: panel.series.map(row => row.actual_mw) }, { name: 'Modeled MW', className: 'h dashed', values: panel.series.map(row => row.predicted_mw) }]} labels={v => `${fmt(v / 1000)}k`} xLabels={(i, full) => full ? panel.series[i].local_end.replace('T', ' ') : `${panel.series[i].local_end.slice(5, 10)} ${panel.series[i].local_end.slice(11, 13)}h`} referenceLabel={`Reference hour: modeled demand ${fmt(Math.abs(panel.elliott.gap_pct), 1)}% below observed`} referenceIndex={panel.series.findIndex(row => row.local_end === panel.elliott.local_end)} ariaLabel={`Observed and modeled regional demand around Winter Storm Elliott. At the reference hour the model underpredicts demand by ${fmt(Math.abs(panel.elliott.gap_pct), 1)} percent.`}/></article>
        <article className="forecast-findings"><div className="forecast-number">{fmt(Math.abs(panel.elliott.gap_pct), 1)}%<small>underpredicted</small></div><p>At the hour ending 07:00 on December 24, the model estimated <strong>{fmt(panel.elliott.predicted_mw)} MW</strong>; observed demand was <strong>{fmt(panel.elliott.actual_mw)} MW</strong>.</p><p className="fine">Trained on {panel.n_winters} winters, excluding the Elliott month. Cross-validated error: {fmt(panel.typical_mape_pct, 1)}%. Observed demand already excludes shed load.</p></article></div>
      <details className="details"><summary>See model error by temperature</summary><DataTable label="Demand model training error by temperature" headings={['Temperature', 'Training hours', 'Mean error', 'Absolute percentage error']}>{panel.error_by_temperature.map(row => <tr key={row.temp_bin}><td>{row.temp_bin}</td><td>{fmt(row.hours)}</td><td>{fmt(row.mean_pct_error, 1)}%</td><td>{fmt(row.mape_pct, 1)}%</td></tr>)}</DataTable><p className="panel-note">Model estimates are not utility forecasts and do not predict outages or available supply. The Elliott morning was about {fmt(panel.elliott.temp_f)}°F. Extreme cold is rare in the training data.</p></details>
    </Section>}

    <details className="methods-disclosure"><summary>Methods & sources</summary><Section id="methods" title="Methods & sources" description="The model is useful only when its assumptions travel with the results.">
      <div className="method-warning"><strong>A public-data planning simulator.</strong><p>This is not Duke’s method, an operational switching tool, or a prediction of actual outages. District load and reductions are modeled estimates. Census tracts are shown whole, including portions outside the district.</p></div>
      <p className="district-sentence">The Elliott regional event anchors this scenario. NC-08 load and required reduction are modeled district-scale estimates, not observed utility circuit values.</p><div className="method-grid"><article><h3>Same technical target</h3><p>Both plans must reduce between {fmt(r.band_lo_mw, 1)} and {fmt(r.band_hi_mw, 1)} MW. The displayed band is target plus {r.delta_pct_used}%. The district’s {fmt(c.D_NC08_mw)} MW load is scaled from regional demand using housing units and jobs.</p></article><article><h3>Explicit value judgments</h3><p>Human harm = households × ({cfg.harm.w_svi} × SVI + {cfg.harm.w_eheat} × electric-heat share). The priority slider blends human harm and interruption cost after each is normalized by its maximum across zones.</p></article><article><h3>A reproducible comparison</h3><p>{plans.length} load-only plans, generated with a fixed seed, meet the target with at most {data.loadonly.method.near_opt_pct}% overshoot. They are not a uniform sample. The typical plan is closest to the median across four impact measures.</p></article><article><h3>Costs and critical facilities</h3><p>Costs use LBNL interruption estimates in 2013 dollars for a one-hour outage. {c.n_protected} entire tracts are excluded because of protected facilities; OpenStreetMap coverage is incomplete. Fire and police are not hard exclusions.</p></article></div>
      <details className="details"><summary>Public datasets and vintages</summary><DataTable label="Public data sources" headings={['Dataset', 'Vintage', 'Source']}>{c.datasets.map(source => <tr key={source.name}><td>{source.name}</td><td>{source.vintage}</td><td><a href={source.url} target="_blank" rel="noreferrer">View source ↗</a></td></tr>)}</DataTable></details>
      <div className="document-links"><a href="/methods/ASSUMPTIONS.md" target="_blank" rel="noreferrer">Full assumptions ↗</a><a href="/methods/DATA_SOURCES.md" target="_blank" rel="noreferrer">Data provenance ↗</a><a href="/methods/AI_DISCLOSURE.md" target="_blank" rel="noreferrer">AI disclosure ↗</a></div>
    </Section></details>
  </div>;
}
