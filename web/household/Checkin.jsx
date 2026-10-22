import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon, IconTile } from '../ui/Icon.jsx';
import { Button } from '../ui/Button.jsx';
import { LogoMark } from '../components/LogoMark.jsx';
import { SPRING, SPRING_SOFT } from '../ui/springs.js';
import { QUESTIONS, answered } from './household.js';

const slide = {
  enter: (dir) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -48, opacity: 0 }),
};
const optionOf = (question, value) => question.options.find((o) => o[0] === value);
export function answerLabel(question, value) {
  return Array.isArray(value)
    ? value
        .map((v) => optionOf(question, v)?.[1])
        .filter(Boolean)
        .join(', ')
    : optionOf(question, value)?.[1];
}
function Progress({ step, total }) {
  return (
    <div
      className="checkin-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={step}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i}>
          <motion.i initial={false} animate={{ scaleX: i < step ? 1 : 0 }} transition={SPRING} />
        </span>
      ))}
    </div>
  );
}
function Options({ question, value, onPick }) {
  return (
    <div
      className="option-list"
      role={question.multi ? 'group' : 'radiogroup'}
      aria-label={question.title}
    >
      {question.options.map(([key, label, icon]) => {
        const selected = question.multi ? (value || []).includes(key) : value === key;
        return (
          <button
            key={key}
            type="button"
            className="option-row"
            role={question.multi ? 'checkbox' : 'radio'}
            aria-checked={selected}
            onClick={() => onPick(key)}
          >
            <IconTile name={icon} tone={selected ? 'ember' : 'ink'} />
            <span>{label}</span>
            <span className="option-check" aria-hidden="true">
              {selected && <Icon name="check" size={18} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
/** "Your household": one icon row per answered question. */
export function HouseholdSummary({ answers }) {
  const rows = QUESTIONS.filter((q) => answered(answers, q.key));
  return (
    <div className="summary-card">
      <h2>Your household</h2>
      {rows.length ? (
        rows.map((q) => {
          const first = Array.isArray(answers[q.key]) ? answers[q.key][0] : answers[q.key];
          return (
            <div className="summary-row" key={q.key}>
              <IconTile name={optionOf(q, first)?.[2] || 'info'} />
              <span>
                <small>{q.title}</small>
                <b>{answerLabel(q, answers[q.key])}</b>
              </span>
            </div>
          );
        })
      ) : (
        <p className="summary-empty">No answers yet. That’s fine.</p>
      )}
    </div>
  );
}
/**
 * Full-screen check-in: one question per screen, spring slide between steps, Back / Skip / Continue.
 * `intro` shows the welcome screen first (first launch). Answers are handed back to the caller; this
 * component never stores or transmits them.
 */
export function Checkin({ initial = {}, intro = true, onDone, onClose }) {
  const [answers, setAnswers] = useState(initial);
  const total = QUESTIONS.length;
  // 0 = intro (when shown), 1..total = questions, total + 1 = summary
  const [step, setStep] = useState(intro ? 0 : 1);
  const [dir, setDir] = useState(1);
  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };
  const question = QUESTIONS[step - 1];
  const pick = (key) =>
    setAnswers((cur) => {
      if (!question.multi) return { ...cur, [question.key]: key };
      const list = cur[question.key] || [];
      // "None" is exclusive: choosing it clears the others, choosing anything else clears it.
      if (key === 'none') return { ...cur, [question.key]: list.includes('none') ? [] : ['none'] };
      const next = list.includes(key)
        ? list.filter((k) => k !== key)
        : [...list.filter((k) => k !== 'none'), key];
      return { ...cur, [question.key]: next };
    });
  const skip = () =>
    setAnswers((cur) =>
      Object.fromEntries(Object.entries(cur).filter(([k]) => k !== question.key)),
    );
  let body;
  if (step === 0)
    body = (
      <div className="checkin-body checkin-intro">
        <LogoMark />
        <h1>A few quick questions</h1>
        <p>So HEARTH can help you get ready. Your answers stay on this phone.</p>
      </div>
    );
  else if (step > total)
    body = (
      <div className="checkin-body">
        <HouseholdSummary answers={answers} />
      </div>
    );
  else
    body = (
      <div className="checkin-body">
        <h1>{question.title}</h1>
        {question.hint && <p className="checkin-hint">{question.hint}</p>}
        <Options question={question} value={answers[question.key]} onPick={pick} />
      </div>
    );
  return (
    <div className="checkin" role="dialog" aria-modal="true" aria-label="Household check-in">
      <div className="checkin-top">
        {step > 0 ? <Progress step={step} total={total + 1} /> : <span />}
        <button
          type="button"
          className="checkin-close"
          aria-label="Close check-in"
          onClick={() => onClose(answers)}
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="checkin-stage">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
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
      <div className="checkin-actions">
        {step === 0 && (
          <>
            <Button variant="plain" onClick={() => onClose(answers)}>
              Not now
            </Button>
            <Button onClick={() => go(1)}>Start</Button>
          </>
        )}
        {step >= 1 && step <= total && (
          <>
            <Button
              variant="plain"
              onClick={() => (step === 1 && !intro ? onClose(answers) : go(step - 1))}
            >
              {step === 1 && !intro ? 'Cancel' : 'Back'}
            </Button>
            <Button
              variant="plain"
              className="checkin-skip"
              onClick={() => {
                skip();
                go(step + 1);
              }}
            >
              Skip
            </Button>
            <Button onClick={() => go(step + 1)}>Continue</Button>
          </>
        )}
        {step > total && (
          <>
            <Button variant="secondary" onClick={() => go(1)}>
              Edit
            </Button>
            <Button onClick={() => onDone(answers)}>Done</Button>
          </>
        )}
      </div>
    </div>
  );
}
