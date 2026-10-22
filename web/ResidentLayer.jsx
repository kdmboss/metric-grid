import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimate } from 'motion/react';
import { Group, Row } from './ui/Group.jsx';
import { SPRING_POP } from './ui/springs.js';
import { successHaptic } from './platform.js';
const STEPS = [
  'Gather warm layers and blankets; plan to stay in one room.',
  'Charge phones and power banks before severe weather arrives.',
  'Check on older neighbors and anyone who may need help.',
  'Never use a stove, oven, or grill to heat your home.',
  'Run generators outdoors only, away from windows and doors.',
];
const KEY = 'hearth.ready.v1';
function loadChecked() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved.filter((i) => Number.isInteger(i) && i < STEPS.length) : [];
  } catch {
    return [];
  }
}
export function ProgressRing({ done, total, big = false }) {
  const [scope, pulse] = useAnimate();
  const complete = done === total;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (complete) {
      void successHaptic();
      pulse(scope.current, { scale: [1, 1.12, 1] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
    }
  }, [complete, pulse, scope]);
  return (
    <span
      className={big ? 'ready-ring ready-ring-big' : 'ready-ring'}
      ref={scope}
      data-complete={complete}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="ready-ring-track" cx="22" cy="22" r="18" />
        <motion.circle
          className="ready-ring-fill"
          cx="22"
          cy="22"
          r="18"
          initial={false}
          animate={{ pathLength: done / total }}
          transition={SPRING_POP}
        />
      </svg>
      <strong>
        {done}
        <small>/{total}</small>
      </strong>
    </span>
  );
}
export function Box({ checked }) {
  return (
    <span className="ready-box" data-checked={checked} aria-hidden="true">
      <motion.span
        className="ready-box-fill"
        initial={false}
        animate={{ scale: checked ? 1 : 0.4, opacity: checked ? 1 : 0 }}
        transition={SPRING_POP}
      />
      <svg viewBox="0 0 24 24">
        <motion.path
          d="M6.5 12.5l3.6 3.6 7.4-8"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </span>
  );
}
export function ResidentLayer() {
  const [checked, setChecked] = useState(loadChecked);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(checked));
    } catch {
      /* The checklist still works for this visit. */
    }
  }, [checked]);
  function toggle(index) {
    setChecked((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  }
  return (
    <aside className="winter-ready" aria-labelledby="winter-ready-title">
      <header className="ready-header">
        <ProgressRing done={checked.length} total={STEPS.length} />
        <div>
          <h2 id="winter-ready-title">Get ready for a winter outage</h2>
          <p>A few steps before a storm</p>
        </div>
      </header>
      <Group>
        {STEPS.map((step, index) => (
          <button
            type="button"
            key={step}
            className="ios-row ready-row"
            role="checkbox"
            aria-checked={checked.includes(index)}
            onClick={() => toggle(index)}
          >
            <Box checked={checked.includes(index)} />
            <span className="ios-row-body">
              <span className="ios-row-title">{step}</span>
            </span>
          </button>
        ))}
      </Group>
      <Group className="preparedness-links">
        <Row
          icon="external"
          title="ReadyNC winter weather"
          href="https://www.readync.gov/winter-weather"
          external
        />
        <Row
          icon="external"
          title="Ready.gov winter weather"
          href="https://www.ready.gov/winter-weather"
          external
        />
      </Group>
    </aside>
  );
}
