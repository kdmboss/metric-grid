import { OverflowMenu } from '../ui/OverflowMenu.jsx';
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
        <OverflowMenu
          className="browser-menu"
          items={[
            {
              id: 'methods',
              label: 'Methods & sources',
              icon: 'book',
              run: () => showEvidence('methods'),
            },
            { id: 'export', label: 'Export scenario', icon: 'share', run: exportScenario },
            { id: 'switch', label: 'Switch view', icon: 'people', run: onSwitchView },
          ]}
        />
      </div>
    </header>
  );
}
