import React, { useState } from 'react';
import { Workspace } from './Workspace.jsx';
import { ResidentView } from './ResidentView.jsx';
import { Welcome } from './components/Welcome.jsx';
import { ENTRY_KEY, entryChoice } from './entry.js';
export function App({ data }) {
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
