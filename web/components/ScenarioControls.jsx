import React from 'react';
import { fmt, targets } from '../model.js';
import { awarePlanLabel, objectiveExplanation } from '../presentation.js';
import { priorityName } from '../planning.js';
export function ScenarioControls({ data, state, record, update, reset }) {
  const grid = data.config.optimizer.alpha_grid,
    index = grid.indexOf(state.alpha);
  return (
    <>
      <div className="scenario-controls">
        <fieldset>
          <legend>Power shortage</legend>
          <div className="segments">
            {targets(data).map((target) => (
              <button
                key={target}
                className={state.target === target ? 'selected' : ''}
                aria-pressed={state.target === target}
                onClick={() =>
                  update({
                    target,
                  })
                }
              >
                {target === 'elliott' ? 'Elliott' : `${target}%`}
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
              onChange={(event) =>
                update({
                  alpha: grid[Number(event.target.value)],
                })
              }
            />
          </div>
          <div className="range-labels">
            <span>Business cost</span>
            <span>People at risk</span>
          </div>
          <details className="more-options">
            <summary>More options{state.cap ? ' · county cap on' : ''}</summary>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={state.cap}
                onChange={(event) =>
                  update({
                    cap: event.target.checked,
                  })
                }
              />
              <span>
                Limit county concentration
                <small>
                  At most {fmt(data.config.optimizer.county_cap.max_share * 100)}% of each plan’s
                  cut in one county
                </small>
              </span>
            </label>
          </details>
        </div>
        <div className="control-actions">
          <button className="button" onClick={reset}>
            Reset
          </button>
          <details className="how-to-help">
            <summary>How to use</summary>
            <ol>
              <li>Pick a cut size.</li>
              <li>Slide toward people at risk.</li>
              <li>Click a zone to see why.</li>
            </ol>
          </details>
        </div>
      </div>
      <p className="shared-target">
        Shared target {fmt(record.target_mw, 1)} MW · band {fmt(record.band_lo_mw, 1)}–
        {fmt(record.band_hi_mw, 1)} MW. Actual: megawatts only {fmt(record.baseline.mw_shed, 1)} MW;{' '}
        {awarePlanLabel(record).toLowerCase()} {fmt(record.weighted.mw_shed, 1)} MW.
      </p>
      {(record.alpha === 0 || record.alpha === 1) && (
        <p className="objective-note" role="status">
          {objectiveExplanation(record)}
        </p>
      )}
    </>
  );
}
