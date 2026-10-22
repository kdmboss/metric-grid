import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { pathBounds } from '../mapGeometry.js';
import { riskLevel } from './risk.js';

/**
 * A small, non-interactive render of the NC-08 district from the frozen tract geometry, coloured by the
 * same who's-at-risk levels as the Map. With `reveal`, tracts fade in one after another over ~600 ms.
 */
export function DistrictThumb({ paths, reveal = false, className = '' }) {
  const box = useMemo(() => pathBounds(paths.zones), [paths]);
  const pad = 6;
  const n = paths.zones.length;
  return (
    <svg
      className={`district-thumb ${className}`}
      viewBox={`${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`}
      role="img"
      aria-label="Map of North Carolina's 8th Congressional District, colored by who is at risk"
      focusable="false"
    >
      {paths.zones.map((z, i) =>
        reveal ? (
          <motion.path
            key={z.zone_id}
            d={z.d}
            className={`thumb-tract risk-${riskLevel(z)}`}
            fillRule="evenodd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (i / n) * 0.45, duration: 0.15 }}
          />
        ) : (
          <path
            key={z.zone_id}
            d={z.d}
            className={`thumb-tract risk-${riskLevel(z)}`}
            fillRule="evenodd"
          />
        ),
      )}
      <path d={paths.district} className="thumb-boundary" fillRule="evenodd" />
    </svg>
  );
}
