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
import { Resources } from '../county/Resources.jsx';
import { withStatuses } from '../county/resources.js';
import { shareText, successHaptic } from '../platform.js';
import { resolveDevices } from '../device/deviceData.js';
import { Home } from './Home.jsx';
import { MapTab } from './MapTab.jsx';
import { CoolingTestSheet, DevicePushes, DeviceSetupSheet, DevicesTab } from './Devices.jsx';
import { ReadyTab } from './Ready.jsx';
import { Checkin } from '../household/Checkin.jsx';
import { isFirstLaunch, Onboarding, onboardingOutcome } from '../household/Onboarding.jsx';
import { OfficialLists } from '../household/cards.jsx';
import {
  deleteHousehold,
  householdSummary,
  loadHousehold,
  needLevel,
  officialLists,
  saveHousehold,
  showsOfficialLists,
} from '../household/household.js';
import { placeCounty } from '../county/county.js';
import {
  About,
  DataSources,
  HowItWorks,
  MoreTab,
  MyHousehold,
  MyPlaces,
  PlannerTools,
  ResetSheet,
} from './More.jsx';
import { PlaceDetail, PlacePicker, planStatus } from './placeKit.jsx';
import { TabBar, TABS } from './TabBar.jsx';
import { KEYS, resetAppData, useStored } from './store.js';
import { readyItems, readyProgress } from './ready.js';

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
  const [household, setHouseholdState] = useState(loadHousehold);
  const [onboarded, setOnboarded] = useStored(KEYS.onboarded, false);
  const [checkin, setCheckin] = useState(false);
  const setup = household.answers;
  const [people, setPeople] = useStored(KEYS.check, []);
  const [homeFlags, setHomeFlags] = useStored(KEYS.deviceHome, {});
  const [room, setRoom] = useStored(KEYS.room, '');
  const devices = useMemo(() => resolveDevices(data.device), [data.device]);
  const homeRecord = useMemo(() => residentRecord(data), [data]);
  const places = data.places || [];
  const [sheet, setSheet] = useState(null); // 'place' | 'device' | 'cooling'
  const [placeOpen, setPlaceOpen] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [outage, setOutage] = useState(null);
  const [moreScreen, setMoreScreen] = useState(null);
  const [tool, setTool] = useState(null);
  const [resourceRows, setResourceRows] = useState([]);
  const [resourceHover, setResourceHover] = useState(null);
  const [toast, setToast] = useState('');
  const content = useRef(null),
    first = useRef(true),
    reduced = useReducedMotion();

  const mainPlace = places.find((p) => p.geoid === saved[0]) || null;
  const counts = mainPlace ? residentCounts(mainPlace, workspace.zones, homeRecord) : null;
  const progress = readyProgress(setup, checked);
  const homeDevice = devices.find((d) => homeFlags[d.id] ?? true) || null;
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
    if (TOOL_MODE[next]) workspace.setMode(TOOL_MODE[next]);
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
    const todo = readyItems(setup)
      .filter((i) => !checked.includes(i.id))
      .slice(0, 3);
    if (todo.length) lines.push(`Still to do: ${todo.map((i) => i.short).join(', ')}.`);
    if (room) lines.push(`Warm room: ${room}.`);
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
  function saveAnswers(answers, completed = true) {
    const next = { answers, completed };
    saveHousehold(next);
    setHouseholdState(next);
  }
  function removeAnswers() {
    setHouseholdState(deleteHousehold());
    void successHaptic();
    setToast('Answers deleted');
  }
  async function shareHousehold() {
    try {
      const result = await shareText(
        'My household',
        householdSummary(setup, mainPlace?.name || ''),
      );
      if (result === 'copied') setToast('Summary copied');
    } catch {
      setToast('Could not share');
    }
  }
  const level = needLevel(setup);
  const county = mainPlace ? placeCounty(mainPlace, workspace.zones) : null;
  const lists = officialLists(setup, county);
  const zoneSheetShown =
    (tab === 'map' || tool === 'explore') && workspace.sheetOpen && workspace.zone;
  const moreTitle = {
    places: 'My places',
    tools: 'Planner tools',
    household: 'My household',
    lists: 'Official lists',
    how: 'How HEARTH works',
    sources: 'Data sources',
    about: 'About HEARTH',
  };
  const toolTitle = {
    explore: 'Explore areas',
    shortlist: 'Shortlist',
    evidence: 'Evidence',
    resources: 'County resources',
  };

  return (
    <div className="planning-app is-standalone app-shell" data-tab={tab}>
      <div ref={content} className="tab-content">
        {tab === 'home' && (
          <Home
            place={mainPlace}
            counts={counts}
            device={homeDevice}
            progress={progress}
            paths={workspace.paths}
            districtHomes={homeRecord.baseline.households}
            onOpenMap={() => setTab('map')}
            level={level}
            answers={setup}
            showLists={showsOfficialLists(setup)}
            onOpenNeed={() => setMoreScreen('household')}
            onOpenLists={() => setMoreScreen('lists')}
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
            homePlace={mainPlace}
            resourceRows={resourceRows}
          />
        )}
        {tab === 'devices' && (
          <DevicesTab
            devices={devices}
            onOpen={(d) => setDeviceId(d.id)}
            onSetup={() => setSheet('device')}
          />
        )}
        {tab === 'ready' && (
          <ReadyTab
            answers={setup}
            checked={checked}
            setChecked={setChecked}
            people={people}
            setPeople={setPeople}
            room={room}
            setRoom={setRoom}
            device={devices[0] || null}
            onSetup={() => setCheckin(true)}
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
          awareLabel={workspace.record.alpha === 0 ? 'Business cost' : 'People-first'}
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
      <DeviceSetupSheet open={sheet === 'device'} onClose={() => setSheet(null)} />
      <CoolingTestSheet open={sheet === 'cooling'} onClose={() => setSheet(null)} />
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
        home={openDevice ? (homeFlags[openDevice.id] ?? true) : false}
        setHome={(on) => setHomeFlags((f) => ({ ...f, [openDevice.id]: on }))}
        setOpen={(on) => {
          if (!on) {
            setDeviceId(null);
            setOutage(null);
          }
        }}
      />
      <PushScreen
        open={['places', 'tools', 'how', 'sources', 'about', 'household', 'lists'].includes(
          moreScreen,
        )}
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
        {moreScreen === 'household' && (
          <MyHousehold
            answers={setup}
            onEdit={() => setCheckin(true)}
            onShare={shareHousehold}
            onDelete={removeAnswers}
          />
        )}
        {moreScreen === 'lists' && <OfficialLists rows={lists} />}
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
        {tool === 'resources' && (
          <Resources
            zones={workspace.zones}
            features={data.zones.features}
            rows={withStatuses(resourceRows, workspace.zones, workspace.record)}
            onRows={setResourceRows}
            hoverId={resourceHover}
            onHover={setResourceHover}
          />
        )}
      </PushScreen>
      <PushScreen
        open={workspace.methodsOpen}
        title="Methods & sources"
        backLabel="Back"
        onBack={() => workspace.setMethodsOpen(false)}
      >
        <Evidence data={data} record={workspace.record} section="methods" />
      </PushScreen>
      {isFirstLaunch(onboarded) && (
        <Onboarding
          places={places}
          zones={workspace.zones}
          record={homeRecord}
          paths={workspace.paths}
          onPlace={addPlace}
          onDone={(answers, completed) => {
            const outcome = onboardingOutcome('checkin');
            saveAnswers(answers, completed);
            setOnboarded(outcome.onboarded);
            setTab(outcome.tab);
          }}
          onPlanner={() => {
            const outcome = onboardingOutcome('planner');
            setOnboarded(outcome.onboarded);
            setTab(outcome.tab);
          }}
        />
      )}
      {checkin && (
        <Checkin
          intro={false}
          initial={setup}
          onDone={(answers) => {
            saveAnswers(answers, true);
            setCheckin(false);
          }}
          onClose={() => setCheckin(false)}
        />
      )}
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
