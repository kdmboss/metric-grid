import React from 'react';
import { motion } from 'motion/react';
import { smoothPath } from './charts.js';

/** Tiny trend line that draws itself in on first view. */
export function Sparkline({ readings, width = 96, height = 32, label }) {
  if (readings.length < 2) return null;
  const times = readings.map((r) => Date.parse(r.t)),
    temps = readings.map((r) => r.temp_f);
  const t0 = Math.min(...times),
    t1 = Math.max(...times);
  const lo = Math.min(...temps),
    hi = Math.max(...temps, lo + 0.6);
  const pts = readings.map((r) => [
    3 + ((Date.parse(r.t) - t0) / (t1 - t0 || 1)) * (width - 6),
    height - 4 - ((r.temp_f - lo) / (hi - lo)) * (height - 8),
  ]);
  const last = pts.at(-1);
  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <motion.path
        d={smoothPath(pts)}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx={last[0]}
        cy={last[1]}
        r="3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.2 }}
      />
    </svg>
  );
}
