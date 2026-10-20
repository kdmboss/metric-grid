import React from 'react';
import { fmt } from '../model.js';
export function CoolingCard({ cooling }) {
  if (!cooling?.readings?.length) return null;
  const readings = cooling.readings,
    rate = cooling.cooling_rate_f_per_hour;
  const times = readings.map((r) => Date.parse(r.time));
  const lo = Math.min(64, ...readings.map((r) => r.temp_f)) - 1;
  const hi = Math.max(64, ...readings.map((r) => r.temp_f)) + 1;
  const x = (t) => 44 + (510 * (t - times[0])) / (times.at(-1) - times[0]);
  const y = (t) => 180 - (145 * (t - lo)) / (hi - lo);
  return (
    <section className="cooling-card" aria-label="Home cooling test">
      {cooling.is_demo && (
        <p className="fixture-label">TEST FIXTURE · invented readings for testing only</p>
      )}
      <h2>{cooling.is_demo ? 'Cooling test · test fixture' : 'Measured in one NC-08 home'}</h2>
      <p className="fine">{cooling.date} · heat off, power on, one room, one home</p>
      <svg
        viewBox="0 0 600 225"
        role="img"
        aria-label="Indoor temperature over time, with a dashed 64 degree Fahrenheit reference"
      >
        <line x1="44" x2="554" y1={y(64)} y2={y(64)} className="cooling-reference" />
        <text x="560" y={y(64) + 4}>
          64°F
        </text>
        <text x="8" y="20">
          °F
        </text>
        <polyline
          points={readings.map((r, i) => `${x(times[i])},${y(r.temp_f)}`).join(' ')}
          className="cooling-line"
        />
        {readings.map((r, i) => (
          <circle key={i} cx={x(times[i])} cy={y(r.temp_f)} r="3" className="cooling-point">
            <title>
              {r.time}: {r.temp_f}°F
            </title>
          </circle>
        ))}
        <text x="44" y="210">
          {readings[0].time.slice(11, 16)}
        </text>
        <text x="554" y="210" textAnchor="end">
          {readings.at(-1).time.slice(11, 16)}
        </text>
      </svg>
      {rate > 0 ? (
        <p>
          This room lost <strong>{fmt(rate, 1)}°F per hour</strong> with the heat off. At that rate
          it would reach the 64°F test reference in about{' '}
          <strong>{fmt(cooling.hours_to_64f, 1)} hours</strong> from the first reading.
        </p>
      ) : (
        <p>This test did not show a falling temperature. No time to 64°F is estimated.</p>
      )}
      <p className="fine">
        A straight-line extrapolation, not a prediction. WHO's cold-season reference is 18°C
        (64.4°F); some people need warmer conditions.{' '}
        <a
          href="https://www.who.int/publications/i/item/9789241550376"
          target="_blank"
          rel="noreferrer"
        >
          WHO guidance
        </a>
        .
      </p>
      <p className="fine">
        Start {fmt(cooling.start_temp_f, 1)}°F · fit R² {fmt(cooling.r_squared, 2)}. One home, one
        test. Not used in the planning model.
      </p>
    </section>
  );
}
