import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Segmented } from '../ui/Segmented.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { DetentSheet } from '../components/DetentSheet.jsx';
import { ScenarioControls } from '../components/ScenarioControls.jsx';
import { CountyMap } from '../county/CountyMap.jsx';
import { CountyBody, CountyPeek } from '../county/CountySheet.jsx';
import {
  ALL,
  areasToWatch,
  COUNTY_NAMES,
  countyFacilities,
  countySummary,
  placeCounty,
  shortName,
  townAnchors,
} from '../county/county.js';
import { mapProjection } from '../model.js';
import { pathBounds } from '../mapGeometry.js';

const PEEK = 200;
function Chips({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [value]);
  return (
    <div className="county-chips" role="tablist" aria-label="County" ref={ref}>
      {[ALL, ...COUNTY_NAMES].map((name) => (
        <button
          key={name}
          type="button"
          role="tab"
          className="chip"
          aria-selected={value === name}
          onClick={() => onChange(name)}
        >
          {name === ALL ? ALL : shortName(name)}
        </button>
      ))}
    </div>
  );
}
/** County-first map: "what does this mean for people in my county?" */
export function MapTab({ workspace: w, views, zoneOpen, homePlace }) {
  const data = w.data;
  const places = useMemo(() => data.places || [], [data.places]);
  const homeCounty = useMemo(
    () => (homePlace ? placeCounty(homePlace, w.zones) : null),
    [homePlace, w.zones],
  );
  const [county, setCounty] = useState(homeCounty || 'Union County');
  const [mode, setMode] = useState('risk');
  const [planKey, setPlanKey] = useState('typical');
  const [controls, setControls] = useState(false);
  const [point, setPoint] = useState(null);
  const [collapse, setCollapse] = useState(0);
  const [detent, setDetent] = useState('peek');
  const [inset, setInset] = useState({ top: 170, bottom: PEEK + 16 });
  const [focusKey, setFocusKey] = useState('init');
  const top = useRef(null),
    screen = useRef(null);
  const record = w.record;
  const project = useMemo(() => mapProjection(data.zones, data.district), [data]);
  const towns = useMemo(() => townAnchors(places, w.paths.zones, w.zones), [places, w]);
  const summary = useMemo(() => countySummary(w.zones, record, county), [w.zones, record, county]);
  const watch = useMemo(() => areasToWatch(w.zones, county), [w.zones, county]);
  const facilities = useMemo(
    () =>
      county === ALL ? [] : countyFacilities(data.facilities || [], data.zones.features, county),
    [data, county],
  );
  const allFacilities = useMemo(
    () =>
      county === ALL
        ? countyFacilities(data.facilities || [], data.zones.features, ALL)
        : facilities,
    [data, county, facilities],
  );
  useEffect(() => {
    const measure = () => {
      if (!top.current || !screen.current) return;
      const bottom =
        top.current.getBoundingClientRect().bottom - screen.current.getBoundingClientRect().top;
      setInset({ top: bottom + 8, bottom: PEEK + 16 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mode]);
  // Selecting an area flies the shared camera; return to the county when the area sheet closes.
  useEffect(() => {
    if (!zoneOpen) setFocusKey(`${county}|${Date.now()}`);
  }, [zoneOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  function pick(next) {
    setCounty(next);
    setPoint(null);
    setFocusKey(`${next}`);
    setCollapse((n) => n + 1);
  }
  function locate() {
    if (!homePlace) return;
    const next = placeCounty(homePlace, w.zones);
    setCounty(next);
    setPoint(null);
    const zones = w.paths.zones.filter((z) => homePlace.zone_ids.includes(z.zone_id));
    const b = pathBounds(zones);
    const centre = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    // Re-use the point flyer with the place centre expressed as lon/lat via the inverse of the projection.
    setPoint({ ...invert(project, centre), key: `home-${homePlace.geoid}`, label: homePlace.name });
    setFocusKey(`home-${homePlace.geoid}`);
    setCollapse((n) => n + 1);
  }
  const label = county === ALL ? 'All NC-08' : county;
  return (
    <div className="map-screen county-screen" data-detent={detent} ref={screen}>
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
        inset={inset}
        focusKey={focusKey}
        point={point}
        project={project}
        towns={towns}
        placeLocator={homePlace ? locate : null}
      />
      <div className="map-top" ref={top}>
        <Chips value={county} onChange={pick} />
        <div className="map-mode">
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
              className="ios-segmented-small"
              value={planKey}
              onChange={setPlanKey}
              items={[
                ['typical', 'MW-only'],
                ['aware', 'People-first'],
              ]}
            />
          )}
        </div>
      </div>
      <div
        className="map-legend-pill"
        data-hidden={detent !== 'peek'}
        aria-label="Legend"
        style={{ bottom: PEEK + 12 }}
      >
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
      </div>
      <AnimatePresence>
        {!zoneOpen && (
          <DetentSheet
            key="county"
            label="County details"
            peek={PEEK}
            collapseKey={collapse}
            onDetent={setDetent}
            header={<CountyPeek summary={summary} label={label} />}
          >
            <CountyBody
              county={county}
              summary={summary}
              zones={w.zones}
              record={record}
              places={places}
              watch={watch}
              facilities={allFacilities}
              onWatch={(zone) => w.selectZone(zone.zone_id)}
              onFacility={(f) => {
                setPoint(f);
                setFocusKey(`facility-${f.key}`);
                setCollapse((n) => n + 1);
              }}
              onScenario={() => setControls(true)}
            />
          </DetentSheet>
        )}
      </AnimatePresence>
      <ModalSheet
        open={controls}
        onClose={() => setControls(false)}
        title="Change the storm"
        className="scenario-sheet"
      >
        <div className="ios-sheet-list">
          <ScenarioControls {...views.ScenarioControls} />
        </div>
      </ModalSheet>
    </div>
  );
}
/** Inverse of mapProjection's linear map, found numerically from two probe points. */
function invert(project, target) {
  const a = project([0, 0]),
    b = project([1, 1]);
  const sx = b[0] - a[0],
    sy = b[1] - a[1];
  return { lon: (target.x - a[0]) / sx, lat: (target.y - a[1]) / sy };
}
