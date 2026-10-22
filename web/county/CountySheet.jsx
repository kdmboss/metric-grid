import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { CountUp } from '../ui/CountUp.jsx';
import { Status } from '../components/EvidencePrimitives.jsx';
import { fmt } from '../model.js';
import { SPRING } from '../ui/springs.js';
import {
  ALL,
  areaName,
  facilityCounts,
  FACILITY_TYPES,
  planStatuses,
  reasonChips,
  sentenceParts,
} from './county.js';

export function CountyPeek({ summary, label }) {
  const parts = sentenceParts(summary);
  const pill = (name, t) =>
    t.areas
      ? `${name} · ${t.areas} ${t.areas === 1 ? 'area' : 'areas'} cut`
      : `${name} · all areas on`;
  return (
    <div className="county-peek">
      <h2>{label}</h2>
      <p className="county-sentence" aria-live="polite">
        {parts.map((part, i) =>
          typeof part === 'string' ? (
            <React.Fragment key={i}>{part}</React.Fragment>
          ) : (
            <b key={part.key}>
              <CountUp value={part.num} format={(v) => fmt(v)} />
            </b>
          ),
        )}
      </p>
      <div className="county-pills">
        <span className={`plan-pill ${summary.baseline.areas ? 'ink' : 'on'}`}>
          {pill('MW-only', summary.baseline)}
        </span>
        <span className={`plan-pill ${summary.weighted.areas ? 'tint' : 'on'}`}>
          {pill('People-first', summary.weighted)}
        </span>
      </div>
    </div>
  );
}
function Tile({ value, format, label }) {
  return (
    <div className="stat-tile">
      <strong>
        <CountUp value={value} format={format} />
      </strong>
      <span>{label}</span>
    </div>
  );
}
function Bar({ label, a, b }) {
  const max = Math.max(a, b, 1);
  return (
    <div className="bar-pair">
      <span className="bar-title">{label}</span>
      {[
        ['MW-only', a, 'ink'],
        ['People-first', b, 'tint'],
      ].map(([name, value, tone]) => (
        <div className="bar-row" key={name}>
          <span className="bar-name">{name}</span>
          <span className="bar-track">
            <motion.i
              className={`bar-fill ${tone}`}
              initial={false}
              animate={{ scaleX: value / max }}
              transition={SPRING}
            />
          </span>
          <b className="bar-value">
            <CountUp value={value} format={(v) => fmt(v)} />
          </b>
        </div>
      ))}
    </div>
  );
}
/** Medium and large detents of the county sheet. */
export function CountyBody({
  county,
  summary,
  zones,
  record,
  places,
  watch,
  facilities,
  onWatch,
  onFacility,
  onScenario,
}) {
  const list = county === ALL ? zones : zones.filter((z) => z.COUNTY === county);
  const heatDenominator = list.reduce((n, z) => n + z.heat_total_occupied, 0);
  const counts = facilityCounts(facilities);
  const district = county === ALL;
  return (
    <div className="county-body">
      <div className="stat-row">
        <Tile value={summary.homes} format={(v) => fmt(v)} label="Homes" />
        <Tile
          value={heatDenominator ? (100 * summary.heat) / heatDenominator : 0}
          format={(v) => `${fmt(v)}%`}
          label="Heat with electricity"
        />
        <Tile value={summary.highRisk} format={(v) => fmt(v)} label="High-risk areas" />
      </div>

      <Group title="Areas to watch">
        {watch.length ? (
          watch.map((zone) => {
            const st = planStatuses(zone, record);
            return (
              <button
                type="button"
                key={zone.zone_id}
                className="ios-row watch-row"
                onClick={() => onWatch(zone)}
              >
                <span className="ios-row-body">
                  <span className="ios-row-title">{areaName(zone, places)}</span>
                  <span className="reason-chips">
                    {reasonChips(zone).map((chip) => (
                      <i key={chip}>{chip}</i>
                    ))}
                  </span>
                  <span className="watch-status">
                    <span>
                      MW-only <Status value={st.baseline} />
                    </span>
                    <span>
                      People-first <Status value={st.weighted} />
                    </span>
                  </span>
                </span>
                <Icon name="chevron" size={18} className="ios-chevron" />
              </button>
            );
          })
        ) : (
          <p className="ios-row ios-row-empty">No high-risk areas here.</p>
        )}
      </Group>

      <section className="places-powered" aria-label="Places that stay powered">
        <h3 className="ios-section-title">Places that stay powered</h3>
        {counts.length ? (
          <>
            <p className="county-line">{counts.map((c) => c.label).join(' · ')}</p>
            <p className="ios-section-footer">
              Plans never cut areas with hospitals or nursing homes. Fire stations are shown for
              context. Mapped from OpenStreetMap, so it may be incomplete.
            </p>
            {!district &&
              FACILITY_TYPES.map(([type, one, many, icon]) => {
                const rows = facilities.filter((f) => f.type === type);
                if (!rows.length) return null;
                return (
                  <Group key={type} title={`${rows.length} ${rows.length === 1 ? one : many}`}>
                    {rows.map((f, i) => (
                      <Row
                        key={`${f.lon},${f.lat},${i}`}
                        icon={icon}
                        tone="ink"
                        title={f.name || `Unnamed ${one}`}
                        onClick={() =>
                          onFacility({
                            ...f,
                            key: `${f.lon},${f.lat}`,
                            label: f.name || `Unnamed ${one}`,
                          })
                        }
                      />
                    ))}
                  </Group>
                );
              })}
          </>
        ) : (
          <p className="county-line">No mapped sites here.</p>
        )}
      </section>

      <section className="compare-plans" aria-label="Compare the plans">
        <h3 className="ios-section-title">Compare the plans</h3>
        <div className="compare-card">
          <Bar label="Homes cut" a={summary.baseline.homes} b={summary.weighted.homes} />
          <Bar
            label="Electric-heat homes cut"
            a={summary.baseline.heat}
            b={summary.weighted.heat}
          />
        </div>
      </section>

      <Group>
        <Row icon="bolt" title="Change the storm" onClick={onScenario} />
      </Group>
    </div>
  );
}
