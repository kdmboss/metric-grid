import React from 'react';
import { Badge } from '../Evidence.jsx';
import { fmt } from '../model.js';
export function Hero({ c, startTime, data }) {
  return (
    <div className="workspace-hero">
      <div className="reference-label story-eyebrow">
        <span>
          Christmas Eve {c.scenario.date.slice(0, 4)} · {startTime} · about{' '}
          {fmt(data.panel?.elliott.temp_f)} °F
        </span>
        <Badge>Modeled</Badge>
      </div>
      <h1>Same power cut. Different people in the dark.</h1>
      <p>
        When power has to be cut, HEARTH shows who ends up in the cold, and how a different plan
        changes that.
      </p>
    </div>
  );
}
