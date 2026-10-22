import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { Button } from '../ui/Button.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { LogoMark } from '../components/LogoMark.jsx';
import { DistrictThumb } from '../county/DistrictThumb.jsx';
import { placeCounty, popularTowns } from '../county/county.js';
import { residentCounts } from '../resident.js';
import { PlanRows } from '../shell/placeKit.jsx';
import { SPRING_SOFT } from '../ui/springs.js';
import { Checkin } from './Checkin.jsx';
import { SwipeBack } from './SwipeBack.jsx';

export const isFirstLaunch = (stored) => stored !== true;
/** What each way out of the first-launch flow does. "I plan for a county" skips the check-in entirely. */
export function onboardingOutcome(kind) {
  if (kind === 'planner') return { onboarded: true, tab: 'map', saveAnswers: false };
  return { onboarded: true, tab: 'home', saveAnswers: true };
}
const slide = {
  enter: (dir) => ({ x: dir * 56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -56, opacity: 0 }),
};
function Welcome({ paths, onStart, onPlanner }) {
  return (
    <div className="ob-scroll welcome">
      <div className="welcome-hero">
        <div className="logo-wrap">
          <motion.span
            className="logo-glow"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.95, 0.55], scale: [0.7, 1.25, 1] }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <LogoMark />
        </div>
        <h1>HEARTH</h1>
        <p>Know who loses power before the next winter storm.</p>
      </div>
      <DistrictThumb paths={paths} reveal className="welcome-map" />
      <Group className="welcome-values">
        <Row icon="map" title="See how your town fared on Christmas Eve 2022" />
        <Row icon="ready" title="Get a winter plan built for your household" />
        <Row icon="thermometer" title="Track how fast your home gets cold" />
      </Group>
      <div className="welcome-actions">
        <Button onClick={onStart}>Get started</Button>
        <Button variant="plain" onClick={onPlanner}>
          I plan for a county →
        </Button>
        <p className="welcome-foot">Modeled on public data · Your answers stay on this phone</p>
      </div>
    </div>
  );
}
function TownStep({ places, zones, record, onBack, onContinue, onSkip }) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const popular = useMemo(() => popularTowns(places, zones), [places, zones]);
  const matches = useMemo(
    () =>
      query.trim().length > 1
        ? places
            .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
            .slice(0, 8)
        : [],
    [places, query],
  );
  const counts = picked ? residentCounts(picked, zones, record) : null;
  const choose = (place) => {
    setPicked(place);
    setQuery('');
  };
  return (
    <div className="ob-scroll town-step-body">
      <div className="step-bar">
        <button type="button" className="step-back" onClick={onBack}>
          <Icon name="back" size={22} />
          <span>Back</span>
        </button>
        <span className="step-count">1 of 7</span>
      </div>
      <div className="checkin-body">
        <h1>Add your town</h1>
        <p className="checkin-hint">
          We’ll show whether the usual plan would have cut power there.
        </p>
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
      {!query.trim() && (
        <section className="popular" aria-label="Popular in NC-08">
          <h2 className="ios-section-title">Popular in NC-08</h2>
          <div className="popular-chips">
            {popular.map((place) => (
              <button
                key={place.geoid}
                type="button"
                className="chip"
                aria-pressed={picked?.geoid === place.geoid}
                onClick={() => choose(place)}
              >
                {place.name}
              </button>
            ))}
          </div>
        </section>
      )}
      {matches.length > 0 && (
        <Group>
          {matches.map((place) => (
            <button
              type="button"
              key={place.geoid}
              className="ios-row"
              onClick={() => choose(place)}
            >
              <span className="ios-row-body">
                <span className="ios-row-title">{place.name}</span>
                <span className="ios-row-detail">{placeCounty(place, zones) ?? ''}</span>
              </span>
              <Icon name="chevron" size={18} className="ios-chevron" />
            </button>
          ))}
        </Group>
      )}
      <AnimatePresence>
        {picked && (
          <motion.section
            key={picked.geoid}
            className="preview-card"
            aria-label={`${picked.name} result`}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={SPRING_SOFT}
          >
            <h2>{picked.name}</h2>
            <PlanRows counts={counts} />
            <div className="preview-actions">
              <Button onClick={() => onContinue(picked)}>Continue</Button>
              <Button variant="plain" onClick={onSkip}>
                Skip
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      {!picked && (
        <div className="checkin-actions town-actions">
          <Button variant="plain" onClick={onSkip}>
            Skip
          </Button>
        </div>
      )}
    </div>
  );
}
/** First launch: welcome, add your town (with an instant result), then the household check-in. */
export function Onboarding({
  places,
  zones,
  record,
  paths,
  onPlace,
  onDone,
  onPlanner,
  initialStage = 'welcome',
}) {
  const [stage, setStage] = useState(initialStage);
  const [dir, setDir] = useState(1);
  const go = (next) => {
    const order = ['welcome', 'town', 'checkin'];
    setDir(order.indexOf(next) >= order.indexOf(stage) ? 1 : -1);
    setStage(next);
  };
  let body;
  if (stage === 'welcome')
    body = <Welcome paths={paths} onStart={() => go('town')} onPlanner={onPlanner} />;
  else if (stage === 'town')
    body = (
      <>
        <TownStep
          places={places}
          zones={zones}
          record={record}
          onBack={() => go('welcome')}
          onContinue={(place) => {
            onPlace(place);
            go('checkin');
          }}
          onSkip={() => go('checkin')}
        />
        <SwipeBack onBack={() => go('welcome')} />
      </>
    );
  else
    body = (
      <Checkin
        intro
        onExit={() => go('town')}
        onDone={(answers) => onDone(answers, true)}
        onClose={(answers) => onDone(answers, false)}
      />
    );
  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="Welcome to HEARTH">
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={stage}
          className="ob-stage"
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SPRING_SOFT}
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
