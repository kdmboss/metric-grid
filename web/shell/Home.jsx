import React from 'react';
import { Icon } from '../ui/Icon.jsx';
import { Button } from '../ui/Button.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import { Sparkline } from '../ui/Sparkline.jsx';
import { ProgressRing } from '../ResidentLayer.jsx';
import { PlanRows } from './placeKit.jsx';
import { NeedCard, OfficialListsCard } from '../household/cards.jsx';
import { currentTemp } from '../device/deviceData.js';
import { greeting, relativeTime, sparkSeries } from '../device/outage.js';

function QuickAction({ icon, label, onClick }) {
  return (
    <button type="button" className="quick-action" onClick={onClick}>
      <span className="quick-action-icon">
        <Icon name={icon} size={24} />
      </span>
      <span>{label}</span>
    </button>
  );
}
/** One glanceable dashboard: my place, my device, my readiness, three quick actions. */
export function Home({
  now = new Date(),
  place,
  counts,
  device,
  progress,
  level = null,
  answers = {},
  showLists = false,
  onOpenNeed = () => {},
  onOpenLists = () => {},
  onAddPlace,
  onOpenPlace,
  onOpenDevice,
  onOpenReady,
  onCooling,
  onShare,
}) {
  return (
    <>
      <LargeTitleBar title="Home" />
      <main className="tab-main home">
        <p className="greeting">{greeting(now)}</p>
        {place ? (
          <button type="button" className="home-card place-card" onClick={onOpenPlace}>
            <span className="card-head">
              <h2>{place.name}</h2>
              <Icon name="chevron" size={18} className="ios-chevron" />
            </span>
            <PlanRows counts={counts} />
          </button>
        ) : (
          <section className="home-card place-card place-empty">
            <h2>Is your area safe?</h2>
            <Button onClick={onAddPlace}>Add your town</Button>
          </section>
        )}
        {level && <NeedCard level={level} answers={answers} onOpen={onOpenNeed} />}
        {showLists && <OfficialListsCard onOpen={onOpenLists} />}
        {device && (
          <button type="button" className="home-card device-card" onClick={onOpenDevice}>
            <span className="card-head">
              <span className="device-card-title">
                {device.room} · <b>{currentTemp(device).toFixed(1)} °F</b>
              </span>
              <Sparkline
                readings={sparkSeries(device.readings)}
                label={`${device.room} temperature trend`}
              />
            </span>
            <span className="card-foot">Updated {relativeTime(device.readings.at(-1).t)}</span>
          </button>
        )}
        <button type="button" className="home-card ready-card" onClick={onOpenReady}>
          <ProgressRing done={progress.done} total={progress.total} />
          <span className="ready-card-text">
            <b>
              {progress.done} of {progress.total} ready
            </b>
            <span>{progress.next ? `Next: ${progress.next.short}` : 'All set'}</span>
          </span>
          <Icon name="chevron" size={18} className="ios-chevron" />
        </button>
        <div className="quick-actions">
          <QuickAction icon="plus" label="Add place" onClick={onAddPlace} />
          <QuickAction icon="snowflake" label="Start cooling test" onClick={onCooling} />
          <QuickAction icon="share" label="Share my plan" onClick={onShare} />
        </div>
      </main>
    </>
  );
}
