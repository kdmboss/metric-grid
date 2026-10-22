import { Segmented } from '../ui/Segmented.jsx';
import { StopSlider } from '../ui/Slider.jsx';
import { Group } from '../ui/Group.jsx';
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
          <Segmented
            label="Power shortage"
            value={state.target}
            onChange={(value) => update({ target: value })}
            items={targets(data).map((value) => [
              value,
              value === 'elliott' ? 'Elliott' : `${value}%`,
            ])}
          />
        </fieldset>
        <div className="priority-control">
          <label htmlFor="alpha">Planning priority</label>
          <StopSlider
            id="alpha"
            label="Planning priority"
            stops={grid.length}
            index={index}
            valueText={priorityName(state.alpha)}
            onIndex={(next) => {
              if (grid[next] !== state.alpha) void lightImpact();
              update({ alpha: grid[next] });
            }}
          />
          <div className="range-labels">
            <span>Business cost</span>
            <span>People at risk</span>
          </div>
        </div>
        <Group className="scenario-options" footer={`Both plans cut about ${target} MW.`}>
          <label className="ios-row ios-switch-row">
            <span className="ios-row-body">
              <span className="ios-row-title">Limit county concentration</span>
              <span className="ios-row-detail">
                At most {fmt(data.config.optimizer.county_cap.max_share * 100)}% of each plan’s cut
                in one county
              </span>
            </span>
            <input
              type="checkbox"
              className="ios-switch"
              role="switch"
              checked={state.cap}
              onChange={(event) => update({ cap: event.target.checked })}
            />
          </label>
          <button type="button" className="ios-row ios-row-action" onClick={reset}>
            <span className="ios-row-title">Reset scenario</span>
          </button>
        </Group>
      </div>
      {(record.alpha === 0 || record.alpha === 1) && (
        <p className="objective-note" role="status">
          {objectiveExplanation(record)}
        </p>
      )}
    </>
  );
}
