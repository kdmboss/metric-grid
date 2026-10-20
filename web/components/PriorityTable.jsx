import React from 'react';
import { DataTable, Status } from '../Evidence.jsx';
import { fmt, status } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
export function PriorityTable({
  setShowAllPriority,
  showAllPriority,
  record,
  priority,
  selectZone,
  setMode,
  counts,
  n,
  plan,
  addZone,
}) {
  return (
    <section className="priority-section">
      <div className="section-head">
        <div>
          <h2>Which zones deserve a closer look?</h2>
          <p>
            These zones have high social vulnerability or electric-heat use and appear most often in
            the megawatts-only plans.
          </p>
        </div>
        <button className="button" onClick={() => setShowAllPriority(!showAllPriority)}>
          {showAllPriority ? 'Show fewer' : 'Show all zones'}
        </button>
      </div>
      <div className="panel">
        <DataTable
          label="Vulnerable zones most often cut when only megawatts count"
          headings={[
            'Zone / county',
            'SVI',
            'Electric heat',
            'Households',
            'Load-only cut frequency',
            awarePlanLabel(record),
            'Planning shortlist',
          ]}
        >
          {priority.slice(0, showAllPriority ? priority.length : 8).map((z) => {
            function _handleClick() {
              selectZone(z.zone_id);
              setMode('explore');
              document.getElementById('workspace').scrollIntoView();
            }
            return (
              <tr key={z.zone_id}>
                <td>
                  <button className="zone-link" onClick={_handleClick}>
                    Zone {z.zone_id}
                  </button>
                  <span className="cell-sub">{z.COUNTY.replace(' County', '')}</span>
                </td>
                <td>{fmt(z.RPL_THEMES, 2)}</td>
                <td>
                  {z.share_electric_heat == null
                    ? 'No data'
                    : `${fmt(z.share_electric_heat * 100)}%`}
                </td>
                <td>{fmt(z.occupied_units)}</td>
                <td>
                  {fmt(((counts[z.zone_id] || 0) / n) * 100)}%{' '}
                  <small>
                    ({counts[z.zone_id] || 0}/{n})
                  </small>
                </td>
                <td data-plan-label={awarePlanLabel(record)}>
                  <Status value={status(z, record.weighted)} />
                </td>
                <td>
                  <button
                    className="button"
                    disabled={plan.some((p) => p.zone === z.zone_id)}
                    onClick={() => addZone(z.zone_id)}
                  >
                    {plan.some((p) => p.zone === z.zone_id) ? 'Added' : 'Add zone +'}
                  </button>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </section>
  );
}
