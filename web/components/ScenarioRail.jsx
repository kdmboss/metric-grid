import React, { useState } from 'react';
import { fmt } from '../model.js';
import { priorityName } from '../planning.js';
export function ScenarioRail({ record, children }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <aside
      className="scenario-rail"
      data-expanded={expanded}
      aria-label="Scenario and place controls"
    >
      <div className="rail-heading">
        <strong>Your scenario</strong>
        <span>Modeled · NC-08</span>
      </div>
      <button
        className="scenario-summary"
        aria-expanded={expanded}
        aria-controls="scenario-editor"
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          <small>NC-08 · Modeled scenario</small>
          <strong>
            {fmt(record.target_mw, 0)} MW · {priorityName(record.alpha)}
          </strong>
        </span>
        <span className="scenario-edit">{expanded ? 'Done' : 'Edit'}</span>
      </button>
      <div className="scenario-editor" id="scenario-editor">
        {children}
      </div>
    </aside>
  );
}
