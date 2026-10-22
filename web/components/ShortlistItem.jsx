import React from 'react';
import { PickerRow } from '../ui/ActionSheet.jsx';
import { Badge, Status } from '../Evidence.jsx';
import { fmt, status } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
import { FOLLOWUPS } from '../planning.js';
export function ShortlistItem({ item, z, setPlan, plan, counts, data, record }) {
  return (
    <article className="shortlist-item" key={item.zone}>
      <div className="shortlist-item-heading">
        <div>
          <h3>
            Zone {z.zone_id} <span>{z.COUNTY}</span>
          </h3>
          <p>Tract {z.GEOID}</p>
        </div>
        <button
          className="text-button"
          onClick={() => setPlan(plan.filter((p) => p.zone !== item.zone))}
          aria-label={`Remove zone ${z.zone_id}`}
        >
          Remove
        </button>
      </div>
      <div className="shortlist-evidence">
        <span>{fmt(z.occupied_units)} households</span>
        <span>
          Electric heat{' '}
          {z.share_electric_heat == null ? 'No data' : `${fmt(z.share_electric_heat * 100)}%`}
        </span>
        <span>SVI {fmt(z.RPL_THEMES, 2)}</span>
        <span>{fmt(z.L_mw, 1)} modeled MW</span>
        <span>
          {counts[z.zone_id] || 0} / {data.loadonly.sets[record.loadonly_key].plans.length}{' '}
          load-only selections
        </span>
      </div>
      <div className="shortlist-status">
        <span>
          Megawatts only <Status value={status(z, record.baseline)} />
        </span>
        <span>
          {awarePlanLabel(record)} <Status value={status(z, record.weighted)} />
        </span>
        {z.protected && <Badge>Protected</Badge>}
      </div>
      <div className="note-fields">
        <div className="ios-group">
          <PickerRow
            label="Follow-up"
            title={`Follow-up for zone ${z.zone_id}`}
            value={item.followup}
            onChange={(value) =>
              setPlan(plan.map((p) => (p.zone === item.zone ? { ...p, followup: value } : p)))
            }
            options={FOLLOWUPS.map((f) => ({ value: f, label: f }))}
          />
        </div>
        <label>
          Planning note for zone {z.zone_id}
          <textarea
            aria-label={`Planning note for zone ${z.zone_id}`}
            rows="3"
            maxLength="4000"
            placeholder="What would you want to investigate or discuss?"
            value={item.note}
            onChange={(event) =>
              setPlan(
                plan.map((p) =>
                  p.zone === item.zone
                    ? {
                        ...p,
                        note: event.target.value,
                      }
                    : p,
                ),
              )
            }
          />
        </label>
      </div>
    </article>
  );
}
