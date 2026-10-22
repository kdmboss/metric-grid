import React, { useState } from 'react';
import { Workspace } from './Workspace.jsx';
import { ResidentView } from './ResidentView.jsx';
import { Welcome } from './components/Welcome.jsx';
import { ENTRY_KEY, entryChoice } from './entry.js';
import { AppShell } from './shell/AppShell.jsx';
import { isAppShell } from './platform.js';
import { CountyDashboard, usesDashboard } from './dashboard/CountyDashboard.jsx';

/** The five-tab app runs on phones and in the app shell; `?view=` keeps the classic planner reachable. */
export function usesAppShell(search = location.search, shell = isAppShell(), narrow = false) {
  return !new URLSearchParams(search).has('view') && (shell || narrow);
}
export function App({ data }) {
  const phone = usesAppShell(
    location.search,
    isAppShell(),
    matchMedia('(max-width:700px)').matches,
  );
  if (phone) return <AppShell data={data} />;
  // Wide windows open the county planner; ?view=planner and ?view=resident keep the classic views.
  if (usesDashboard(location.search, matchMedia('(min-width:1100px)').matches))
    return <CountyDashboard data={data} />;
  return <ClassicApp data={data} />;
}
function ClassicApp({ data }) {
  const [choice, setChoice] = useState(() => {
    try {
      return entryChoice(location.search, localStorage);
    } catch {
      return entryChoice(location.search, null);
    }
  });
  function choose(view) {
    try {
      localStorage.setItem(ENTRY_KEY, view);
    } catch {
      /* The query still works without storage. */
    }
    const query = new URLSearchParams(location.search);
    query.set('view', view);
    history.replaceState(null, '', `${location.pathname}?${query}`);
    setChoice(view);
    window.scrollTo(0, 0);
  }
  function switchView() {
    setChoice(null);
  }
  return (
    <>
      <div inert={choice === null}>
        {choice === 'resident' ? (
          <ResidentView data={data} choose={choose} switchView={switchView} />
        ) : (
          <Workspace data={data} onSwitchView={switchView} />
        )}
      </div>
      {choice === null && <Welcome choose={choose} />}
    </>
  );
}
