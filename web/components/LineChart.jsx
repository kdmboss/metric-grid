import React from 'react';
import { fmt } from '../model.js';
export function LineChart({
  series,
  labels,
  xLabels,
  domain,
  ariaLabel,
  referenceIndex,
  referenceLabel,
}) {
  const count = series[0].values.length;
  const all = series.flatMap((s) => s.values).filter(Number.isFinite);
  const [lo, hi] = domain || [
    Math.floor(Math.min(...all) / 1000) * 1000,
    Math.ceil(Math.max(...all) / 1000) * 1000,
  ];
  const x = (i) => 58 + (i / (count - 1)) * 518,
    y = (v) => 215 - ((v - lo) / (hi - lo)) * 185;
  return (
    <svg className="line-chart" viewBox="0 0 600 265" role="img" aria-label={ariaLabel}>
      {Array.from(
        {
          length: 5,
        },
        (_, i) => {
          const v = lo + ((hi - lo) * i) / 4;
          return (
            <g key={i}>
              <line x1="58" x2="576" y1={y(v)} y2={y(v)} className="chart-grid" />
              <text x="48" y={y(v) + 4} textAnchor="end" className="axis-label">
                {labels(v)}
              </text>
            </g>
          );
        },
      )}
      {lo < 0 && hi > 0 && <line x1="58" x2="576" y1={y(0)} y2={y(0)} className="zero-line" />}
      {referenceIndex != null && (
        <line
          x1={x(referenceIndex)}
          x2={x(referenceIndex)}
          y1="26"
          y2="215"
          className="reference-line"
        />
      )}
      {referenceLabel && (
        <text x="58" y="16" className="axis-label">
          {referenceLabel}
        </text>
      )}
      {series.map((s) => (
        <g key={s.name}>
          <path
            d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')}
            className={`series-line ${s.className}`}
          />
          {s.values.map((v, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(v)}
              r={count > 10 ? 5 : 4}
              className={`series-point ${s.className} ${count > 10 ? 'hidden-point' : ''}`}
            >
              <title>
                {s.name} · {xLabels(i, true)}: {fmt(v, count > 10 ? 0 : 1)}
              </title>
            </circle>
          ))}
        </g>
      ))}
      {Array.from(
        {
          length: Math.min(count, 5),
        },
        (_, i) => {
          const index = Math.round((i * (count - 1)) / (Math.min(count, 5) - 1));
          return (
            <text key={i} x={x(index)} y="245" textAnchor="middle" className="axis-label">
              {xLabels(index)}
            </text>
          );
        },
      )}
    </svg>
  );
}
