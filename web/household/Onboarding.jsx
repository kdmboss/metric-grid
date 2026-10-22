import React, { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { Button } from '../ui/Button.jsx';
import { Group } from '../ui/Group.jsx';
import { LogoMark } from '../components/LogoMark.jsx';
import { Checkin } from './Checkin.jsx';

/** First launch: add your town (skippable), then the household check-in (skippable), then Home. */
export function Onboarding({ places, onPlace, onDone }) {
  const [stage, setStage] = useState('town');
  const [query, setQuery] = useState('');
  const matches = useMemo(
    () =>
      query.trim().length > 1
        ? places
            .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
            .slice(0, 8)
        : [],
    [places, query],
  );
  if (stage === 'checkin')
    return (
      <Checkin
        intro
        onDone={(answers) => onDone(answers, true)}
        onClose={(answers) => onDone(answers, false)}
      />
    );
  return (
    <div className="checkin town-step" role="dialog" aria-modal="true" aria-label="Add your town">
      <div className="checkin-stage">
        <div className="checkin-body checkin-intro">
          <LogoMark />
          <h1>Add your town</h1>
          <p>See how a storm like Christmas Eve 2022 would have affected it.</p>
        </div>
        <div className="ios-search town-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Town or place…"
            aria-label="Search towns"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {matches.length > 0 && (
          <Group>
            {matches.map((place) => (
              <button
                type="button"
                key={place.geoid}
                className="ios-row"
                onClick={() => {
                  onPlace(place);
                  setStage('checkin');
                }}
              >
                <span className="ios-row-body">
                  <span className="ios-row-title">{place.name}</span>
                </span>
                <Icon name="chevron" size={18} className="ios-chevron" />
              </button>
            ))}
          </Group>
        )}
      </div>
      <div className="checkin-actions">
        <Button variant="plain" onClick={() => setStage('checkin')}>
          Skip
        </Button>
      </div>
    </div>
  );
}
