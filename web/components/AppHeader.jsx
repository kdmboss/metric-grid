import React from 'react';
import { Brand } from '../Evidence.jsx';
export function AppHeader({ showEvidence, exportScenario }) {
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
      </div>
    </header>
  );
}
