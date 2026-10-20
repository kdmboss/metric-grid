import React from 'react';
import { Badge } from '../Evidence.jsx';
import { fmt } from '../model.js';
export function Hero({ c, startTime, data, mode }) {
  return (
    <div className="workspace-hero">
      <div className="reference-label story-eyebrow">
        <span>
          Christmas Eve {c.scenario.date.slice(0, 4)} · {startTime} · about{' '}
          {fmt(data.panel?.elliott.temp_f)} °F
        </span>
        <Badge>Modeled</Badge>
      </div>
      <h1>
        {mode === 'explore'
          ? 'Find an area. Understand its risks.'
          : 'Same power cut. Different people in the dark.'}
      </h1>
      <p>
        {mode === 'explore'
          ? 'Search a place or select a tract to inspect its community profile and add it to your shortlist.'
          : 'Compare the trade-offs, then select an area to build your preparation shortlist.'}
      </p>
    </div>
  );
}
