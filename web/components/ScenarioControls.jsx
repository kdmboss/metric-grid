import { lightImpact } from '../platform.js';
import React from 'react';
import { fmt, targets } from '../model.js';
import { objectiveExplanation } from '../presentation.js';
import { priorityName } from '../planning.js';
export function ScenarioControls({ data, state, record, update, reset }) {
  const grid = data.config.optimizer.alpha_grid,
    index = grid.indexOf(state.alpha);
  const target = fmt(record.target_mw, 0);
  return (
    <>
      <div className="scenario-controls">
        <fieldset>
          <legend>Power shortage</legend>
          <div className="segments">
            {targets(data).map((value) => (
              <button
                key={value}
                className={state.target === value ? 'selected' : ''}
                aria-pressed={state.target === value}
                onClick={() => update({ target: value })}
              >
                {value === 'elliott' ? 'Elliott' : `${value}%`}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="priority-control">
          <label htmlFor="alpha">Planning priority</label>
          <div className="priority-slider">
            <output
              htmlFor="alpha"
              style={{
                left: `calc(${(index / (grid.length - 1)) * 100}% + ${22 - (index / (grid.length - 1)) * 44}px)`,
              }}
            >
              {priorityName(state.alpha)}
            </output>
            <input
              id="alpha"
              type="range"
              min="0"
              max={grid.length - 1}
              step="1"
              value={index}
              aria-valuetext={priorityName(state.alpha)}
              onChange={(event) => {
                const next = grid[Number(event.target.value)];
                if (next !== state.alpha) void lightImpact();
                update({ alpha: next });
              }}
            />
          </div>
          <div className="range-labels">
            <span>Business cost</span>
            <span>People at risk</span>
          </div>
        </div>
        <div className="control-actions">
          <button className="button" onClick={reset}>
            Reset
          </button>
          <details className="scenario-menu">
            <summary aria-label="Scenario options">⋯</summary>
            <div className="menu-content">
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={state.cap}
                  onChange={(event) => update({ cap: event.target.checked })}
                />
                <span>
                  Limit county concentration
                  <small>
                    At most {fmt(data.config.optimizer.county_cap.max_share * 100)}% of each plan’s
                    cut in one county
                  </small>
                </span>
              </label>
              <div className="menu-how-to">
                <strong>How to use</strong>
                <ol>
                  <li>Pick a cut size.</li>
                  <li>Slide toward people at risk.</li>
                  <li>Click an area to see why.</li>
                </ol>
              </div>
            </div>
          </details>
        </div>
      </div>
      <p className="shared-target">Both plans cut about {target} MW.</p>
      {(record.alpha === 0 || record.alpha === 1) && (
        <p className="objective-note" role="status">
          {objectiveExplanation(record)}
        </p>
      )}
    </>
  );
}
