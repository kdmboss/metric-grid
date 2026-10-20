import React from 'react';
export function Footer({ showMethods }) {
  return (
    <footer className="app-footer">
      <p>
        HEARTH is a planning simulator built on public data. It is not Duke Energy&apos;s plan. ·{' '}
        <button className="text-button" onClick={showMethods}>
          Methods & sources
        </button>
      </p>
    </footer>
  );
}
