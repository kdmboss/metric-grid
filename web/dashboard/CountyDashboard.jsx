import React, { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { Segmented } from '../ui/Segmented.jsx';
import { StopSlider } from '../ui/Slider.jsx';
import { CountUp } from '../ui/CountUp.jsx';
import { Group } from '../ui/Group.jsx';
import { LogoMark } from '../components/LogoMark.jsx';
import { ZoneDetail } from '../components/ZoneDetail.jsx';
import { Status } from '../components/EvidencePrimitives.jsx';
import { CountyMap } from '../county/CountyMap.jsx';
import { CountyBody, CountyPeek } from '../county/CountySheet.jsx';
import { Resources } from '../county/Resources.jsx';
import { resourcePins, withStatuses } from '../county/resources.js';
import {
  ALL,
  areaName,
  areasToWatch,
  countyFacilities,
  countySentence,
  countySummary,
  COUNTY_NAMES,
  planStatuses,
  reasonChips,
  shiftSentence,
  shortName,
  townAnchors,
} from '../county/county.js';
import { fmt, mapProjection, targets } from '../model.js';
import { priorityName } from '../planning.js';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { Brief, scenarioLine } from './Brief.jsx';

export const isPresent = (search) => new URLSearchParams(search).get('present') === '1';
export const usesDashboard = (search, wide) => {
  const view = new URLSearchParams(search).get('view');
  return view === 'county' || (view === null && wide);
};
const SHORTFALL = (v) => (v === 'elliott' ? 'Elliott' : `${v}%`);
export function Rail({ data, w, county, onCounty }) {
  const grid = data.config.optimizer.alpha_grid,
    index = grid.indexOf(w.state.alpha);
  return (
    <aside className="dash-rail" aria-label="Counties and scenario">
      <h2 className="rail-title">Counties</h2>
      <ul className="county-list">
        {[ALL, ...COUNTY_NAMES].map((name) => {
          const s = countySummary(w.zones, w.record, name);
          return (
            <li key={name}>
              <button
                type="button"
                className="county-item"
                aria-current={county === name}
                onClick={() => onCounty(name)}
              >
                <span className="county-item-name">{name === ALL ? ALL : shortName(name)}</span>
                <span
                  className="county-item-nums"
                  aria-label="Homes cut: MW-only, then people-first"
                >
                  <span>
                    <CountUp value={s.baseline.homes} format={(v) => fmt(v)} />
                  </span>
                  <i aria-hidden="true">vs</i>
                  <b>
                    <CountUp value={s.weighted.homes} format={(v) => fmt(v)} />
                  </b>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="rail-legend">
        Homes cut: MW-only vs <b>people-first</b>
      </p>
      <h2 className="rail-title">Storm</h2>
      <div className="rail-controls">
        <div className="rail-field">
          <span className="rail-label">Power shortage</span>
          <Segmented
            label="Power shortage"
            value={w.state.target}
            onChange={(value) => w.update({ target: value })}
            items={targets(data).map((value) => [value, SHORTFALL(value)])}
          />
        </div>
        <div className="rail-field">
          <label className="rail-label" htmlFor="rail-alpha">
            Planning priority
          </label>
          <StopSlider
            id="rail-alpha"
            label="Planning priority"
            stops={grid.length}
            index={index}
            valueText={priorityName(w.state.alpha)}
            onIndex={(next) => w.update({ alpha: grid[next] })}
          />
          <div className="range-labels">
            <span>Business cost</span>
            <span>People at risk</span>
          </div>
        </div>
        <Group>
          <label className="ios-row ios-switch-row cap-row">
            <span className="ios-row-body">
              <span className="ios-row-title">Limit how much any one county takes</span>
              <span className="ios-row-detail">
                At most {fmt(data.config.optimizer.county_cap.max_share * 100)}% of each plan’s cut
              </span>
            </span>
            <input
              type="checkbox"
              className="ios-switch"
              role="switch"
              checked={w.state.cap}
              onChange={(event) => w.update({ cap: event.target.checked })}
            />
          </label>
        </Group>
      </div>
    </aside>
  );
}
/** Desktop county planner: counties and storm controls | map | county panel. Same data as the phone app. */
export function CountyDashboard({ data }) {
  const w = useWorkspace(data);
  const present = isPresent(location.search);
  const places = useMemo(() => data.places || [], [data.places]);
  const features = data.zones.features;
  const project = useMemo(() => mapProjection(data.zones, data.district), [data]);
  const towns = useMemo(() => townAnchors(places, w.paths.zones, w.zones), [places, w]);
  const [county, setCounty] = useState('Union County');
  const [mode, setMode] = useState('risk');
  const [planKey, setPlanKey] = useState('typical');
  const [panel, setPanel] = useState('county'); // 'county' | 'resources' | 'shortlist'
  const [rows, setRows] = useState([]);
  const [hoverId, setHoverId] = useState(null);
  const [point, setPoint] = useState(null);
  const [focusKey, setFocusKey] = useState('init');
  const [brief, setBrief] = useState(false);
  const record = w.record;
  const zones = w.zones;
  const summary = useMemo(() => countySummary(zones, record, county), [zones, record, county]);
  const district = useMemo(() => countySummary(zones, record, ALL), [zones, record]);
  const shift = useMemo(
    () => shiftSentence(summary, district, zones, county),
    [summary, district, zones, county],
  );
  const watch = useMemo(() => areasToWatch(zones, county), [zones, county]);
  const facilities = useMemo(
    () => countyFacilities(data.facilities || [], features, county === ALL ? ALL : county),
    [data, features, county],
  );
  const resources = useMemo(() => withStatuses(rows, zones, record), [rows, zones, record]);
  const pins = useMemo(
    () => resourcePins(resources, w.paths, project, planKey),
    [resources, w.paths, project, planKey],
  );
  const shortlistIds = useMemo(() => new Set(w.plan.map((p) => p.zone)), [w.plan]);
  const label = county === ALL ? 'All NC-08' : county;
  const zone = w.state.zone ? zones.find((z) => z.zone_id === w.state.zone) : null;
  const chooseCounty = (name) => {
    setCounty(name);
    setPoint(null);
    setFocusKey(name);
    setPanel('county');
    w.selectZone(0);
  };
  const briefItems = w.plan
    .map((item) => ({ item, zone: zones.find((z) => z.zone_id === item.zone) }))
    .filter(({ zone: z }) => z && (county === ALL || z.COUNTY === county))
    .map(({ item, zone: z }) => ({ zone: { ...z, ...planStatuses(z, record) }, note: item.note }));
  const briefResources = resources.filter((r) => county === ALL || r.county === county);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="dashboard"
      data-present={present}
      data-panel={panel === 'resources' ? 'wide' : 'normal'}
    >
      <header className="dash-top">
        <span className="dash-brand hearth-wordmark">
          <LogoMark />
          HEARTH
        </span>
        <span className="dash-district">NC-08 county planner</span>
        {!present && (
          <nav className="dash-actions" aria-label="Planner tools">
            <button type="button" className="text-button" onClick={() => setPanel('resources')}>
              <Icon name="upload" size={16} /> County resources
            </button>
            <button type="button" className="text-button" onClick={() => setPanel('shortlist')}>
              <Icon name="list" size={16} /> Shortlist ({w.plan.length})
            </button>
            <button
              type="button"
              className="ios-btn ios-btn-secondary dash-export"
              onClick={() => setBrief(true)}
            >
              Export brief
            </button>
          </nav>
        )}
      </header>
      <Rail data={data} w={w} county={county} onCounty={chooseCounty} />
      <main className="dash-map" aria-label="Map">
        <CountyMap
          paths={w.paths}
          county={county}
          mode={mode}
          planKey={planKey}
          record={record}
          view={w.view}
          setView={w.setView}
          selected={w.state.zone}
          onSelect={w.selectZone}
          inset={{ top: 84, bottom: 56 }}
          focusKey={focusKey}
          point={point}
          project={project}
          towns={towns}
          placeLocator={null}
          resources={pins}
          hoverId={hoverId}
          onHover={setHoverId}
        />
        <div className="dash-map-top">
          <Segmented
            label="Map mode"
            value={mode}
            onChange={setMode}
            items={[
              ['risk', 'Who’s at risk'],
              ['plan', 'Plan result'],
            ]}
          />
          {mode === 'plan' && (
            <Segmented
              label="Plan"
              value={planKey}
              onChange={setPlanKey}
              items={[
                ['typical', 'MW-only'],
                ['aware', 'People-first'],
              ]}
            />
          )}
        </div>
        <div className="map-legend-pill dash-legend" aria-label="Legend">
          {mode === 'risk' ? (
            <>
              <span>
                <i className="sw risk-low" />
                Low
              </span>
              <span>
                <i className="sw risk-medium" />
                Medium
              </span>
              <span>
                <i className="sw risk-high" />
                High
              </span>
              <span>
                <i className="sw risk-unknown" />
                No data
              </span>
            </>
          ) : (
            <>
              <span>
                <i className="sw plan-cut" />
                Cut
              </span>
              <span>
                <i className="sw plan-kept" />
                On
              </span>
              <span>
                <i className="sw plan-protected" />
                Protected
              </span>
            </>
          )}
          {pins.length > 0 && (
            <span className="legend-pins">
              <i className="sw pin-sw" />
              Pins follow {planKey === 'aware' ? 'people-first' : 'MW-only'}
            </span>
          )}
        </div>
      </main>
      <aside className="dash-panel" aria-label={`${label} details`}>
        {zone ? (
          <div className="panel-area">
            <button type="button" className="panel-back" onClick={() => w.selectZone(0)}>
              <Icon name="back" size={20} /> {label}
            </button>
            <ZoneDetail {...w.detailProps} id="dash-zone" />
          </div>
        ) : panel === 'resources' ? (
          <div className="panel-resources">
            <button type="button" className="panel-back" onClick={() => setPanel('county')}>
              <Icon name="back" size={20} /> {label}
            </button>
            <h2>County resources</h2>
            <Resources
              zones={zones}
              features={features}
              rows={resources}
              onRows={setRows}
              hoverId={hoverId}
              onHover={setHoverId}
            />
          </div>
        ) : panel === 'shortlist' ? (
          <div className="panel-shortlist">
            <button type="button" className="panel-back" onClick={() => setPanel('county')}>
              <Icon name="back" size={20} /> {label}
            </button>
            <h2>Shortlist</h2>
            {w.plan.length ? (
              <Group>
                {w.plan.map((item) => {
                  const z = zones.find((q) => q.zone_id === item.zone);
                  const st = planStatuses(z, record);
                  return (
                    <div className="ios-row watch-row" key={item.zone}>
                      <span className="ios-row-body">
                        <span className="ios-row-title">
                          {areaName(z, places)} · Zone {z.zone_id}
                        </span>
                        <span className="reason-chips">
                          {reasonChips(z).map((chip) => (
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
                      <button
                        type="button"
                        className="add-shortlist"
                        onClick={() => w.setPlan(w.plan.filter((p) => p.zone !== item.zone))}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </Group>
            ) : (
              <p className="ios-section-footer">Add areas from “Areas to watch”.</p>
            )}
            <button
              type="button"
              className="ios-btn ios-btn-primary panel-export"
              disabled={!w.plan.length}
              onClick={() => setBrief(true)}
            >
              Export brief
            </button>
          </div>
        ) : (
          <div className="panel-county">
            <CountyPeek summary={summary} label={label} />
            <CountyBody
              county={county}
              summary={summary}
              zones={zones}
              record={record}
              places={places}
              watch={watch}
              facilities={facilities}
              shift={shift}
              flat
              shortlist={{ ids: shortlistIds, onAdd: w.addZone }}
              onResources={present ? null : () => setPanel('resources')}
              onWatch={(z) => w.selectZone(z.zone_id)}
              onFacility={(f) => {
                setPoint(f);
                setFocusKey(`facility-${f.key}`);
              }}
            />
          </div>
        )}
      </aside>
      {brief && (
        <Brief
          county={county}
          scenario={scenarioLine(record, priorityName(w.state.alpha), w.state.cap, w.state.target)}
          sentence={countySentence(summary)}
          shift={shift}
          items={briefItems}
          places={places}
          resources={briefResources}
          today={today}
          onClose={() => setBrief(false)}
        />
      )}
    </div>
  );
}
