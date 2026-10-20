import { useAppShell } from './useAppShell.js';
import { useMapAnimation } from './useMapAnimation.js';
import { useEffect, useRef, useState } from 'react';
import { defaults } from '../model.js';
import { HOME_VIEW, fitPaths } from '../mapGeometry.js';
import { LIMITATION, download } from '../planning.js';
import { useScenario } from './useScenario.js';
import { useMapUI } from './useMapUI.js';
import { useNavigation } from './useNavigation.js';
import { useShortlist } from './useShortlist.js';
import { useMobileSheet } from './useMobileSheet.js';

function useWorkspaceKeys(setState, printMode, setPrintMode) {
  useEffect(() => {
    function clear(event) {
      if (event.key === 'Escape') setState((current) => ({ ...current, zone: 0 }));
    }
    window.addEventListener('keydown', clear);
    return () => window.removeEventListener('keydown', clear);
  }, [setState]);
  useEffect(() => {
    if (!printMode) return;
    function close() {
      setPrintMode(false);
    }
    window.addEventListener('afterprint', close);
    return () => window.removeEventListener('afterprint', close);
  }, [printMode, setPrintMode]);
}
function scenarioExport(data, state, scenario) {
  download(
    JSON.stringify(
      {
        app_name: 'HEARTH',
        limitations: LIMITATION,
        requested: state,
        displayed: scenario.record,
        note: scenario.viewResult.note,
        data_built: data.constants.built_utc,
        reference_date: data.constants.scenario.date,
      },
      null,
      2,
    ),
    'hearth-scenario.json',
    'application/json',
  );
}

export function useWorkspace(data) {
  const navigation = useNavigation(data),
    map = useMapUI(),
    shortlist = useShortlist(data);
  const filtersRef = useRef(null),
    searchRef = useRef(null);
  const sheet = useMobileSheet(navigation.mode, navigation.compareTab, filtersRef);
  const [printMode, setPrintMode] = useState(false);
  const [summaryCounty, setSummaryCounty] = useState('Union County');
  const [showAllPriority, setShowAllPriority] = useState(false);
  const shell = useAppShell();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const animateView = useMapAnimation(map.setView);
  const scenario = useScenario(data, navigation.state, map, shortlist.plan);
  const { state, setState, setMode, setEvidenceTab } = navigation;
  useWorkspaceKeys(setState, printMode, setPrintMode);
  const update = (patch) => setState((current) => ({ ...current, ...patch }));
  function selectZone(id) {
    update({ zone: id });
    setSelectedPlace(null);
    if (shell.present && id) {
      const path = scenario.paths.zones.find((z) => z.zone_id === id);
      if (path) animateView(fitPaths([path]));
    }
    map.setQuery('');
    if (filtersRef.current) filtersRef.current.open = false;
    if (id) sheet.setSheetOpen(true);
  }
  function selectPlace(place) {
    setSelectedPlace(place);
    update({ zone: 0 });
    sheet.setSheetOpen(false);
    map.setCounty('');
    const paths = scenario.paths.zones.filter((z) => place.zone_ids.includes(z.zone_id));
    const fitted = fitPaths(paths);
    animateView({
      scale: fitted.scale / 1.25,
      x: 320 - (320 - fitted.x) / 1.25,
      y: 195 - (195 - fitted.y) / 1.25,
    });
  }
  function clearPlace() {
    setSelectedPlace(null);
    map.setView(HOME_VIEW);
  }
  function closeDetails() {
    update({ zone: 0 });
    sheet.setSheetOpen(false);
  }
  function selectCounty(value) {
    map.setCounty(value);
    map.setQuery('');
    map.setView(
      value ? fitPaths(scenario.paths.zones.filter((z) => z.COUNTY === value)) : HOME_VIEW,
    );
  }
  function zoomSelected() {
    const path = scenario.paths.zones.find((z) => z.zone_id === state.zone);
    if (path) {
      map.setCounty('');
      map.setView(fitPaths([path]));
    }
  }
  function showEvidence(target = 'robust') {
    setMode('evidence');
    setEvidenceTab(target);
  }
  function reset() {
    setState({ ...defaults(data), zone: 0 });
    setSelectedPlace(null);
    map.setView(HOME_VIEW);
    map.setCounty('');
    map.setQuery('');
  }
  const c = data.constants,
    hour = Number(c.scenario.shed_start_local.slice(0, 2));
  const startTime = `${hour % 12 || 12}:${c.scenario.shed_start_local.slice(3)} ${hour < 12 ? 'a.m.' : 'p.m.'}`;
  const detailProps = {
    zone: scenario.zone,
    record: scenario.record,
    data,
    counts: scenario.counts,
    n: scenario.n,
    onAdd: shortlist.addZone,
    listed: shortlist.plan.some((p) => p.zone === state.zone),
    zones: scenario.zones,
    onSelect: selectZone,
  };
  return {
    ...navigation,
    ...shell,
    selectedPlace,
    selectPlace,
    clearPlace,
    closeDetails,
    ...map,
    ...shortlist,
    ...scenario,
    ...sheet,
    data,
    c,
    startTime,
    filtersRef,
    searchRef,
    printMode,
    setPrintMode,
    summaryCounty,
    setSummaryCounty,
    showAllPriority,
    setShowAllPriority,
    update,
    selectZone,
    selectCounty,
    zoomSelected,
    showEvidence,
    reset,
    detailProps,
    exportScenario: () => scenarioExport(data, state, scenario),
  };
}
