import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { Group } from '../ui/Group.jsx';
import { Button } from '../ui/Button.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { Box, ProgressRing } from '../ResidentLayer.jsx';
import { SPRING } from '../ui/springs.js';
import { readyItems, readyProgress, SECTIONS, SETUP_STEPS } from './ready.js';

export function SetupSheet({ open, onClose, answers, onDone }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(answers);
  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft(answers);
    }
  }, [open, answers]);
  const current = SETUP_STEPS[step];
  const value = draft[current.key] ?? (current.multi ? [] : null);
  function choose(option) {
    setDraft((d) => {
      if (!current.multi) return { ...d, [current.key]: option };
      const list = d[current.key] || [];
      return {
        ...d,
        [current.key]: list.includes(option) ? list.filter((o) => o !== option) : [...list, option],
      };
    });
  }
  const last = step === SETUP_STEPS.length - 1;
  return (
    <ModalSheet open={open} onClose={onClose} title="Quick setup">
      <div className="setup-progress" aria-hidden="true">
        {SETUP_STEPS.map((_, i) => (
          <span key={i}>
            <motion.i initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={SPRING} />
          </span>
        ))}
      </div>
      <div className="ios-sheet-list">
        <h3 className="setup-question">{current.title}</h3>
        <Group>
          {current.options.map(([key, label]) => {
            const selected = current.multi ? value.includes(key) : value === key;
            return (
              <button
                key={key}
                type="button"
                className="ios-row"
                role={current.multi ? 'checkbox' : 'radio'}
                aria-checked={selected}
                onClick={() => choose(key)}
              >
                <span className="ios-row-body">
                  <span className="ios-row-title">{label}</span>
                </span>
                {selected && <Icon name="check" size={20} className="ios-check" />}
              </button>
            );
          })}
        </Group>
        <div className="setup-actions">
          <Button variant="plain" onClick={() => (step ? setStep(step - 1) : onDone(draft, false))}>
            {step ? 'Back' : 'Skip'}
          </Button>
          <Button onClick={() => (last ? onDone(draft, true) : setStep(step + 1))}>
            {last ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
export function ReadyTab({ answers, checked, setChecked, people, setPeople, onSetup, onShare }) {
  const items = readyItems(answers);
  const progress = readyProgress(answers, checked);
  const [name, setName] = useState('');
  const toggle = (id) =>
    setChecked((cur) => (cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]));
  function addPerson(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setPeople((cur) => [...cur, { id: `${Date.now()}`, name: trimmed, done: false }]);
    setName('');
  }
  return (
    <>
      <LargeTitleBar
        title="Ready"
        actions={
          <button
            type="button"
            className="ios-circle-button"
            aria-label="Edit setup"
            onClick={onSetup}
          >
            <Icon name="pencil" size={18} />
          </button>
        }
      />
      <main className="tab-main ready-tab">
        <div className="ready-hero">
          <ProgressRing done={progress.done} total={progress.total} big />
          <p>{progress.next ? `Next: ${progress.next.short}` : 'You’re ready'}</p>
        </div>
        {SECTIONS.map(([key, title]) => {
          const list = items.filter((i) => i.section === key);
          if (!list.length) return null;
          return (
            <Group key={key} title={title}>
              {list.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ios-row ready-row"
                  role="checkbox"
                  aria-checked={checked.includes(item.id)}
                  onClick={() => toggle(item.id)}
                >
                  <Box checked={checked.includes(item.id)} />
                  <span className="ios-row-body">
                    <span className="ios-row-title">{item.title}</span>
                  </span>
                </button>
              ))}
            </Group>
          );
        })}
        <Group title="Check on">
          <AnimatePresence initial={false}>
            {people.map((person) => (
              <motion.div
                key={person.id}
                layout="position"
                className="person-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={SPRING}
              >
                <button
                  type="button"
                  className="ios-row ready-row"
                  role="checkbox"
                  aria-checked={person.done}
                  onClick={() =>
                    setPeople((cur) =>
                      cur.map((p) => (p.id === person.id ? { ...p, done: !p.done } : p)),
                    )
                  }
                >
                  <Box checked={person.done} />
                  <span className="ios-row-body">
                    <span className="ios-row-title">{person.name}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="person-remove"
                  aria-label={`Remove ${person.name}`}
                  onClick={() => setPeople((cur) => cur.filter((p) => p.id !== person.id))}
                >
                  <Icon name="close" size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <form className="ios-row add-person" onSubmit={addPerson}>
            <Icon name="plus" size={20} />
            <input
              placeholder="Add a name"
              aria-label="Add a person to check on"
              value={name}
              onChange={(event) => setName(event.target.value)}
              enterKeyHint="done"
            />
          </form>
        </Group>
        <Group>
          <button type="button" className="ios-row ios-row-action" onClick={onShare}>
            <Icon name="share" size={20} />
            <span className="ios-row-title">Share my plan</span>
          </button>
        </Group>
      </main>
    </>
  );
}
