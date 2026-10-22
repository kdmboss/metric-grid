import React, { useState } from 'react';

import { Group, Row } from '../ui/Group.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import { ActionSheet } from '../ui/ActionSheet.jsx';
import { LogoMark } from '../components/LogoMark.jsx';
import pkg from '../../package.json';

export function MoreTab({ onOpen }) {
  return (
    <>
      <LargeTitleBar title="More" />
      <main className="tab-main more-tab">
        <Group>
          <Row icon="pin" title="My places" onClick={() => onOpen('places')} />
          <Row icon="layers" title="Planner tools" onClick={() => onOpen('tools')} />
        </Group>
        <Group>
          <Row icon="info" title="How HEARTH works" onClick={() => onOpen('how')} />
          <Row icon="book" title="Data sources" onClick={() => onOpen('sources')} />
          <Row icon="flame" title="About HEARTH" onClick={() => onOpen('about')} />
        </Group>
        <Group>
          <Row icon="trash" tone="ink" title="Reset app data" onClick={() => onOpen('reset')} />
        </Group>
      </main>
    </>
  );
}
export function MyPlaces({ places, saved, onAdd, onMain, onRemove }) {
  const [target, setTarget] = useState(null);
  const list = saved.map((id) => places.find((p) => p.geoid === id)).filter(Boolean);
  return (
    <div className="my-places">
      <Group>
        {list.map((place, i) => (
          <Row
            key={place.geoid}
            icon="pin"
            title={place.name}
            value={i === 0 ? 'Main' : ''}
            onClick={() => setTarget(place)}
          />
        ))}
        <Row icon="plus" tone="ink" title="Add a town" onClick={onAdd} />
      </Group>
      <ActionSheet
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target?.name || ''}
        menu
        options={[
          { value: 'main', label: 'Make main place', icon: 'home' },
          { value: 'remove', label: 'Remove', icon: 'trash' },
        ]}
        onSelect={(value) => (value === 'main' ? onMain(target) : onRemove(target))}
      />
    </div>
  );
}
export function PlannerTools({ onTool }) {
  return (
    <Group>
      <Row icon="map" title="Explore areas" onClick={() => onTool('explore')} />
      <Row icon="list" title="Shortlist" onClick={() => onTool('shortlist')} />
      <Row icon="layers" title="Evidence" onClick={() => onTool('evidence')} />
      <Row icon="book" title="Methods & sources" onClick={() => onTool('methods')} />
    </Group>
  );
}
export function HowItWorks({ onMethods }) {
  return (
    <>
      <Group>
        <Row icon="snowflake" title="We replay a real storm" detail="Christmas Eve 2022" />
        <Row icon="bolt" title="We compare two plans" detail="Megawatts only, or people first" />
        <Row icon="people" title="You see who is affected" detail="Down to your town" />
      </Group>
      <Group>
        <Row icon="book" title="Full methods" onClick={onMethods} />
      </Group>
    </>
  );
}
export function DataSources({ data }) {
  return (
    <Group>
      {data.constants.datasets.map((source) => (
        <Row
          key={source.name}
          icon="layers"
          title={source.name}
          detail={source.vintage}
          href={source.url}
          external
        />
      ))}
    </Group>
  );
}
export function About() {
  return (
    <div className="about">
      <div className="about-hero">
        <LogoMark />
        <h2>HEARTH</h2>
        <p>Version {pkg.version}</p>
      </div>
      <Group footer="Built for the Congressional App Challenge · NC-08">
        <Row icon="shield" title="AI disclosure" href="/methods/AI_DISCLOSURE.md" external />
      </Group>
    </div>
  );
}
export function ResetSheet({ open, onClose, onReset }) {
  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title="Erase saved places, checklist and settings?"
      menu
      options={[{ value: 'reset', label: 'Reset app data', icon: 'trash' }]}
      onSelect={onReset}
    />
  );
}
