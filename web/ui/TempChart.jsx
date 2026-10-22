import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { segments, smoothPath } from './charts.js';
import { clock, hourLabel, REFERENCE_F } from '../device/outage.js';

const PAD = { l: 8, r: 8, t: 12, b: 22 };
/**
 * Smooth temperature line with a dashed 64 °F reference. Drag across it to read a time and temperature.
 * Gaps where the device was unplugged are left open; `bridges` draws dashed connectors across them.
 */
export function TempChart({ readings, bridges = [], height = 200, label }) {
  const box = useRef(null);
  const [width, setWidth] = useState(320);
  const [scrub, setScrub] = useState(null);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width || 320));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  const model = useMemo(() => {
    const all = [...readings, ...bridges.flat()];
    if (all.length < 2) return null;
    const times = all.map((r) => Date.parse(r.t)),
      temps = all.map((r) => r.temp_f);
    const t0 = Math.min(...times),
      t1 = Math.max(...times);
    const lo = Math.min(...temps, REFERENCE_F) - 1,
      hi = Math.max(...temps, REFERENCE_F) + 1;
    const x = (t) => PAD.l + ((t - t0) / (t1 - t0 || 1)) * (width - PAD.l - PAD.r);
    const y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * (height - PAD.t - PAD.b);
    const point = (r) => [x(Date.parse(r.t)), y(r.temp_f)];
    return { t0, t1, x, y, point, lo, hi };
  }, [readings, bridges, width, height]);
  if (!model)
    return (
      <div ref={box} className="temp-chart" style={{ height }}>
        <p className="temp-chart-empty">Not enough readings yet.</p>
      </div>
    );
  const { x, y, point, t0, t1 } = model;
  const lines = segments(readings).filter((s) => s.length > 1);
  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const t = t0 + ((event.clientX - rect.left - PAD.l) / (rect.width - PAD.l - PAD.r)) * (t1 - t0);
    let best = readings[0];
    for (const r of readings)
      if (Math.abs(Date.parse(r.t) - t) < Math.abs(Date.parse(best.t) - t)) best = r;
    setScrub(best);
  }
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => t0 + f * (t1 - t0));
  return (
    <div ref={box} className="temp-chart" style={{ height }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={label}
        onPointerDown={move}
        onPointerMove={(event) => event.buttons && move(event)}
        onPointerUp={() => setScrub(null)}
        onPointerLeave={() => setScrub(null)}
      >
        <line
          className="chart-reference"
          x1={PAD.l}
          x2={width - PAD.r}
          y1={y(REFERENCE_F)}
          y2={y(REFERENCE_F)}
        />
        <text className="chart-ref-label" x={width - PAD.r} y={y(REFERENCE_F) - 5} textAnchor="end">
          64 °F
        </text>
        {ticks.map((t, i) => (
          <text
            key={i}
            className="chart-axis"
            x={Math.min(Math.max(x(t), 18), width - 18)}
            y={height - 5}
            textAnchor="middle"
          >
            {hourLabel(t)}
          </text>
        ))}
        {bridges.map((pair, i) => (
          <path
            key={i}
            className="chart-bridge"
            d={`M${point(pair[0]).join(',')}L${point(pair[1]).join(',')}`}
          />
        ))}
        {lines.map((s, i) => (
          <motion.path
            key={i}
            className="chart-line"
            d={smoothPath(s.map(point))}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        {scrub && (
          <g className="chart-scrub">
            <line
              x1={x(Date.parse(scrub.t))}
              x2={x(Date.parse(scrub.t))}
              y1={PAD.t}
              y2={height - PAD.b}
            />
            <circle cx={x(Date.parse(scrub.t))} cy={y(scrub.temp_f)} r="5" />
          </g>
        )}
      </svg>
      {scrub && (
        <div
          className="chart-bubble"
          style={{ left: Math.min(Math.max(x(Date.parse(scrub.t)), 56), width - 56) }}
        >
          <strong>{scrub.temp_f.toFixed(1)} °F</strong>
          <span>{clock(scrub.t)}</span>
        </div>
      )}
    </div>
  );
}
