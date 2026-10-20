import React, { useRef } from 'react';
export function StandaloneHeader({ scrolled, mode, showEvidence, exportScenario }) {
  const menu = useRef(null);
  function methods() {
    showEvidence('methods');
    menu.current.open = false;
  }
  function exportData() {
    exportScenario();
    menu.current.open = false;
  }
  return (
    <header className="native-header" data-scrolled={scrolled}>
      <div className="native-title">
        <span>HEARTH</span>
        <h1>{mode[0].toUpperCase() + mode.slice(1)}</h1>
      </div>
      <details className="native-menu" ref={menu}>
        <summary aria-label="App options">⋯</summary>
        <div className="menu-content">
          <button onClick={methods}>Methods & sources</button>
          <button onClick={exportData}>Export scenario</button>
        </div>
      </details>
    </header>
  );
}
