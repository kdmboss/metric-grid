import React from 'react';
import { Arrow } from './components/Arrow.jsx';
export function ResidentLayer() {
  return (
    <aside className="winter-ready" aria-labelledby="winter-ready-title">
      <span className="workspace-kicker">A few steps before a storm</span>
      <h2 id="winter-ready-title">Get ready for a winter outage</h2>
      <ul>
        <li>Gather warm layers and blankets; plan to stay in one room.</li>
        <li>Charge phones and power banks before severe weather arrives.</li>
        <li>Check on older neighbors and anyone who may need help.</li>
        <li>Never use a stove, oven, or grill to heat your home.</li>
        <li>Run generators outdoors only, away from windows and doors.</li>
      </ul>
      <div className="preparedness-links">
        <a href="https://www.readync.gov/winter-weather" target="_blank" rel="noreferrer">
          ReadyNC winter weather <Arrow direction="external" />
        </a>
        <a href="https://www.ready.gov/winter-weather" target="_blank" rel="noreferrer">
          Ready.gov winter weather <Arrow direction="external" />
        </a>
      </div>
    </aside>
  );
}
