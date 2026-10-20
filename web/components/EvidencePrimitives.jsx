import React from 'react';
import { fmt } from '../model.js';
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="HEARTH home">
      HEARTH
    </a>
  );
}
export function Section({ id, title, description, children, aside, hidden = false }) {
  return (
    <section id={id} className="section" hidden={hidden}>
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function DataTable({ headings, children, label }) {
  return (
    <div className="table-scroll" tabIndex="0" role="region" aria-label={label}>
      <table>
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Status({ value }) {
  return (
    <span
      className={`status ${value === 'Cut' ? 'cut' : value === 'Protected' ? 'protected' : 'kept'}`}
    >
      {value}
    </span>
  );
}
export function StripChart({
  metric,
  title,
  unit,
  values,
  baseline,
  weighted,
  summary,
  awareLabel = 'Vulnerability-aware',
}) {
  const all = [...values, baseline, weighted],
    min = Math.min(...all),
    max = Math.max(...all),
    pad = (max - min) * 0.13 || 1;
  const lo = min - pad,
    hi = max + pad,
    x = (value) => 24 + ((value - lo) / (hi - lo)) * 552;
  return (
    <article className="chart-card">
      <div className="chart-heading">
        <h3>{title}</h3>
        <span>{unit}</span>
      </div>
      <svg
        viewBox="0 0 600 172"
        role="img"
        aria-label={[
          `${title}. Load-only range ${fmt(summary.min)} to ${fmt(summary.max)}.`,
          `${awareLabel} ${fmt(weighted)}.`,
        ].join(' ')}
      >
        {Array.from(
          {
            length: 5,
          },
          (_, i) => {
            const value = min + ((max - min) * i) / 4;
            return (
              <g key={i}>
                <line x1={x(value)} x2={x(value)} y1="20" y2="134" className="chart-grid" />
                <text x={x(value)} y="158" textAnchor="middle" className="axis-label">
                  {metric === 'h_econ' ? `$${fmt(value / 1000)}k` : fmt(value)}
                </text>
              </g>
            );
          },
        )}
        {values.map((value, i) => (
          <circle key={i} cx={x(value)} cy={35 + ((i * 67) % 89)} r="2.8" className="plan-dot">
            <title>
              Load-only plan {i + 1}: {fmt(value)}
            </title>
          </circle>
        ))}
        <path d={`M${x(baseline)} 68l6 7-6 7-6-7Z`} className="typical-dot">
          <title>Typical plan: {fmt(baseline)}</title>
        </path>
        <circle cx={x(weighted)} cy="75" r="7" className="weighted-dot">
          <title>
            {awareLabel}: {fmt(weighted)}
          </title>
        </circle>
      </svg>
      <p className="chart-caption">
        {summary.n_plans_more} of {values.length} load-only plans have a higher value.
      </p>
    </article>
  );
}
export { LineChart } from './LineChart.jsx';
