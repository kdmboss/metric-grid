import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { workspaceProps } from '../hooks/workspaceProps.js';
import { residentCounts, residentRecord } from '../resident.js';
import { PushScreen } from '../ui/PushScreen.jsx';
import { ZoneSheet } from '../components/ZoneSheet.jsx';
import { ZoneDetail } from '../components/ZoneDetail.jsx';
import { ExploreView } from '../components/ExploreView.jsx';
import { MapFilters } from '../components/MapFilters.jsx';
import { Preparation } from '../components/Preparation.jsx';
import { EvidenceView } from '../components/EvidenceView.jsx';
import { Evidence } from '../Evidence.jsx';
import { shareText } from '../platform.js';
import { resolveDevices } from '../device/deviceData.js';
import { Home } from './Home.jsx';
import { MapTab } from './MapTab.jsx';
import { AddDeviceSheet, CoolingTestSheet, DevicePushes, DevicesTab } from './Devices.jsx';
import { ReadyTab, SetupSheet } from './Ready.jsx';
import {
  About,
  DataSources,
  HowItWorks,
  MoreTab,
  MyPlaces,
  PlannerTools,
  ResetSheet,
} from './More.jsx';
import { PlaceDetail, PlacePicker, planStatus } from './placeKit.jsx';
import { TabBar, TABS } from './TabBar.jsx';
import { KEYS, resetAppData, useStored } from './store.js';
import { readyProgress } from './ready.js';

const TOOL_MODE = { explore: 'explore', shortlist: 'prepare', evidence: 'evidence' };
function initialTab() {
  const tab = new URLSearchParams(location.search).get('tab');
  return TABS.some(([id]) => id === tab) ? tab : 'home';
}
/** Five-tab app: Home, Map, Devices, Ready, More. The planner simulator lives in Map and More. */
export function AppShell({ data }) {
  const workspace = useWorkspace(data);
  const views = workspaceProps(workspace);
  const [tab, setTab] = useState(initialTab);
  const [saved, setSaved] = useStored(KEYS.places, []);
  const [checked, setChecked] = useStored(KEYS.ready, []);
  const [setup, setSetup] = useStored(KEYS.setup, { done: false });
  const [people, setPeople] = useStored(KEYS.check, []);
  const [homeFlags, setHomeFlags] = useStored(KEYS.deviceHome, {});
  const devices = useMemo(() => resolveDevices(data.device, Date.now()), [data.device]);
  const homeRecord = useMemo(() => residentRecord(data), [data]);
  const places = data.places || [];
  const [sheet, setSheet] = useState(null); // 'place' | 'device' | 'cooling' | 'setup' | 'reset'
  const [placeOpen, setPlaceOpen] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [outage, setOutage] = useState(null);
  const [moreScreen, setMoreScreen] = useState(null);
  const [tool, setTool] = useState(null);
  const [toast, setToast] = useState('');
  const content = useRef(null),
    first = useRef(true),
    reduced = useReducedMotion();

  const mainPlace = places.find((p) => p.geoid === saved[0]) || null;
  const counts = mainPlace ? residentCounts(mainPlace, workspace.zones, homeRecord) : null;
  const progress = readyProgress(setup, checked);
  const homeDevice = devices.find((d) => homeFlags[d.id] ?? !d.sample) || null;
  const openDevice = devices.find((d) => d.id === deviceId) || null;

  useEffect(() => {
    workspace.setMode('compare');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    animate(content.current, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [6, 0] }, {
      duration: 0.15,
      ease: [0.16, 1, 0.3, 1],
    });
  }, [tab, reduced]);
  useEffect(() => {
    if (tab === 'ready' && !setup.done && setup.asked !== true) {
      setSetup((s) => ({ ...s, asked: true }));
      setSheet('setup');
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  function addPlace(place) {
    setSaved((cur) => (cur.includes(place.geoid) ? cur : [...cur, place.geoid]));
  }
  function openTool(next) {
    if (next === 'methods') {
      workspace.setMethodsOpen(true);
      return;
    }
    setTool(next);
    workspace.setMode(TOOL_MODE[next]);
  }
  function closeTool() {
    setTool(null);
    workspace.setMode('compare');
  }
  async function sharePlan() {
    const lines = [];
    if (mainPlace) {
      const a = planStatus(counts.baseline, counts.total),
        b = planStatus(counts.aware, counts.total);
      lines.push(
        `${mainPlace.name}: MW-only plan, ${a.text.toLowerCase()}. People-first plan, ${b.text.toLowerCase()}.`,
      );
    }
    lines.push(`Winter outage readiness: ${progress.done} of ${progress.total} done.`);
    lines.push(
      'Based on a modeled replay of the Christmas Eve 2022 storm. Not a prediction for your home.',
    );
    try {
      const result = await shareText('My HEARTH plan', lines.join('\n'));
      if (result === 'copied') setToast('Plan copied');
    } catch {
      setToast('Could not share');
    }
  }
  function finishSetup(answers, completed) {
    setSetup({ ...answers, done: completed, asked: true });
    setSheet(null);
  }
  const zoneSheetShown =
    (tab === 'map' || tool === 'explore') && workspace.sheetOpen && workspace.zone;
  const moreTitle = {
    places: 'My places',
    tools: 'Planner tools',
    how: 'How HEARTH works',
    sources: 'Data sources',
    about: 'About HEARTH',
  };
  const toolTitle = { explore: 'Explore areas', shortlist: 'Shortlist', evidence: 'Evidence' };

  return (
    <div className="planning-app is-standalone app-shell" data-tab={tab}>
      <div ref={content} className="tab-content">
        {tab === 'home' && (
          <Home
            place={mainPlace}
            counts={counts}
            device={homeDevice}
            progress={progress}
            onAddPlace={() => setSheet('place')}
            onOpenPlace={() => setPlaceOpen(true)}
            onOpenDevice={() => {
              setDeviceId(homeDevice.id);
            }}
            onOpenReady={() => setTab('ready')}
            onCooling={() => setSheet('cooling')}
            onShare={sharePlan}
          />
        )}
        {tab === 'map' && (
          <MapTab
            workspace={workspace}
            views={views}
            zoneOpen={Boolean(zoneSheetShown)}
            hidePill={Boolean(tool)}
          />
        )}
        {tab === 'devices' && (
          <DevicesTab
            devices={devices}
            onOpen={(d) => setDeviceId(d.id)}
            onAdd={() => setSheet('device')}
          />
        )}
        {tab === 'ready' && (
          <ReadyTab
            answers={setup}
            checked={checked}
            setChecked={setChecked}
            people={people}
            setPeople={setPeople}
            onSetup={() => setSheet('setup')}
            onShare={sharePlan}
          />
        )}
        {tab === 'more' && <MoreTab onOpen={setMoreScreen} />}
      </div>
      <TabBar value={tab} onChange={setTab} />

      {zoneSheetShown && (
        <ZoneSheet
          open
          close={workspace.closeDetails}
          zone={workspace.zone}
          record={workspace.record}
        >
          <ZoneDetail {...workspace.detailProps} id="sheet-zone" />
        </ZoneSheet>
      )}

      <PlacePicker
        open={sheet === 'place'}
        onClose={() => setSheet(null)}
        places={places}
        saved={saved}
        onAdd={addPlace}
      />
      <AddDeviceSheet open={sheet === 'device'} onClose={() => setSheet(null)} />
      <CoolingTestSheet open={sheet === 'cooling'} onClose={() => setSheet(null)} />
      <SetupSheet
        open={sheet === 'setup'}
        onClose={() => finishSetup(setup, setup.done)}
        answers={setup}
        onDone={finishSetup}
      />
      <ResetSheet
        open={moreScreen === 'reset'}
        onClose={() => setMoreScreen(null)}
        onReset={() => {
          resetAppData();
          location.reload();
        }}
      />

      <PushScreen
        open={placeOpen && Boolean(mainPlace)}
        title={mainPlace?.name || ''}
        backLabel="Home"
        onBack={() => setPlaceOpen(false)}
      >
        {mainPlace && (
          <PlaceDetail
            place={mainPlace}
            zones={workspace.zones}
            record={homeRecord}
            counts={counts}
          />
        )}
      </PushScreen>
      <DevicePushes
        device={openDevice}
        open={Boolean(openDevice)}
        outage={outage}
        setOutage={setOutage}
        home={openDevice ? (homeFlags[openDevice.id] ?? !openDevice.sample) : false}
        setHome={(on) => setHomeFlags((f) => ({ ...f, [openDevice.id]: on }))}
        onCooling={() => setSheet('cooling')}
        setOpen={(on) => {
          if (!on) {
            setDeviceId(null);
            setOutage(null);
          }
        }}
      />
      <PushScreen
        open={['places', 'tools', 'how', 'sources', 'about'].includes(moreScreen)}
        title={moreTitle[moreScreen] || ''}
        backLabel="More"
        onBack={() => setMoreScreen(null)}
      >
        {moreScreen === 'places' && (
          <MyPlaces
            places={places}
            saved={saved}
            onAdd={() => setSheet('place')}
            onMain={(place) =>
              setSaved((cur) => [place.geoid, ...cur.filter((g) => g !== place.geoid)])
            }
            onRemove={(place) => setSaved((cur) => cur.filter((g) => g !== place.geoid))}
          />
        )}
        {moreScreen === 'tools' && <PlannerTools onTool={openTool} />}
        {moreScreen === 'how' && <HowItWorks onMethods={() => openTool('methods')} />}
        {moreScreen === 'sources' && <DataSources data={data} />}
        {moreScreen === 'about' && <About />}
      </PushScreen>
      <PushScreen
        open={Boolean(tool)}
        title={toolTitle[tool] || ''}
        backLabel="Tools"
        onBack={closeTool}
      >
        {tool === 'explore' && (
          <>
            <MapFilters {...views.MapFilters} />
            <ExploreView {...views.ExploreView} />
          </>
        )}
        {tool === 'shortlist' && (
          <Preparation {...views.Preparation} onExplore={() => openTool('explore')} />
        )}
        {tool === 'evidence' && <EvidenceView {...views.EvidenceView} />}
      </PushScreen>
      <PushScreen
        open={workspace.methodsOpen}
        title="Methods & sources"
        backLabel="Back"
        onBack={() => workspace.setMethodsOpen(false)}
      >
        <Evidence data={data} record={workspace.record} section="methods" />
      </PushScreen>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
