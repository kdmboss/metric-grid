import React from 'react';
import { Brand } from '../Evidence.jsx';
export function AppHeader({ showEvidence, exportScenario, onSwitchView }) {
  return (
    <header className="appbar">
      <Brand />
      <div className="appbar-district">NC-08</div>
      <div className="appbar-actions">
        <button
          className="text-button"
          aria-label="Methods & sources"
          onClick={() => showEvidence('methods')}
        >
          <span className="desktop-copy">Methods & sources</span>
          <span className="mobile-copy">Methods</span>
        </button>
        <button className="button" onClick={exportScenario}>
          Export
        </button>
        <details className="browser-menu native-menu">
          <summary aria-label="App options">⋯</summary>
          <div className="menu-content">
            <button onClick={() => showEvidence('methods')}>Methods & sources</button>
            <button onClick={exportScenario}>Export scenario</button>
            <button onClick={onSwitchView}>Switch view</button>
          </div>
        </details>
      </div>
    </header>
  );
}
