import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon, IconTile } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { Button } from '../ui/Button.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { ActionSheet } from '../ui/ActionSheet.jsx';
import { PushScreen } from '../ui/PushScreen.jsx';
import { Box, ProgressRing } from '../ResidentLayer.jsx';
import { SPRING_SOFT } from '../ui/springs.js';
import { coolingSummary } from '../device/outage.js';
import { currentTemp } from '../device/deviceData.js';
import { enabledCategories, readyItems, readyProgress, readyStatus } from './ready.js';

const PALETTE = ['#B4441C', '#3F7D4E', '#5B6B8C', '#8C6A1C', '#7A4E7E', '#2F6F73'];
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
const tint = (name) => PALETTE[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % PALETTE.length];

function ItemRow({ item, checked, onToggle }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={SPRING_SOFT}
    >
      <button
        type="button"
        className="ios-row ready-item"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onToggle(item.id)}
      >
        <IconTile name={item.icon} />
        <span className="ios-row-body">
          <span className="ios-row-title">{item.title}</span>
          <span className="ios-row-detail">{item.why}</span>
        </span>
        <Box checked={checked} />
      </button>
    </motion.div>
  );
}
function PersonSheet({ open, onClose, person, onSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(() => {
    if (open) {
      setName(person?.name || '');
      setPhone(person?.phone || '');
    }
  }, [open, person]);
  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={person ? 'Edit person' : 'Add someone to check on'}
    >
      <form
        className="ios-sheet-list"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) onSave({ ...person, name: name.trim(), phone: phone.trim() });
        }}
      >
        <Group>
          <label className="ios-row">
            <span className="ios-row-title field-label">Name</span>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </label>
          <label className="ios-row">
            <span className="ios-row-title field-label">Phone</span>
            <input
              className="field-input"
              value={phone}
              inputMode="tel"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
          </label>
        </Group>
        <Button className="sheet-cta" type="submit" disabled={!name.trim()}>
          Save
        </Button>
        <p className="ios-section-footer">Saved only on this phone.</p>
      </form>
    </ModalSheet>
  );
}
function WarmthScreen({ room, device, summary }) {
  const temp = device ? currentTemp(device) : null;
  return summary.rate == null ? (
    <div className="warmth">
      <p className="ios-section-footer">
        Warmth is estimated from outages HEARTH Home has recorded in this room. There are none yet.
      </p>
    </div>
  ) : (
    <div className="warmth">
      <div className="device-hero-card">
        <p className="device-room">{room}</p>
        <p className="device-temp">
          {summary.hoursTo64.toFixed(1)}
          <small>h</small>
        </p>
        <p className="device-updated">until about 64 °F with the power off</p>
      </div>
      <Group>
        <Row icon="snowflake" title="Cooling rate" value={`${summary.rate.toFixed(1)} °F/hour`} />
        <Row
          icon="thermometer"
          title="Room now"
          value={temp == null ? '—' : `${temp.toFixed(1)} °F`}
        />
        <Row
          icon="bolt"
          title="Based on"
          value={`${summary.events} outage${summary.events === 1 ? '' : 's'}`}
        />
      </Group>
    </div>
  );
}
export function ReadyTab({
  answers,
  checked,
  setChecked,
  people,
  setPeople,
  room,
  setRoom,
  device,
  onSetup,
  onShare,
}) {
  const items = readyItems(answers);
  const progress = readyProgress(answers, checked);
  const categories = enabledCategories(answers);
  const [category, setCategory] = useState('before');
  const [showDone, setShowDone] = useState(false);
  const [roomSheet, setRoomSheet] = useState(false);
  const [warmth, setWarmth] = useState(false);
  const [person, setPerson] = useState(undefined); // undefined closed, null new, object edit
  const [actions, setActions] = useState(null);
  const active = categories.some(([id]) => id === category) ? category : categories[0][0];
  const list = items.filter((i) => i.cat === active);
  const open = list.filter((i) => !checked.includes(i.id)),
    done = list.filter((i) => checked.includes(i.id));
  const toggle = (id) =>
    setChecked((cur) => (cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]));
  const summary = useMemo(
    () =>
      device
        ? coolingSummary(device.events, currentTemp(device))
        : { rate: null, hoursTo64: null, events: 0 },
    [device],
  );
  function savePerson(next) {
    setPeople((cur) =>
      next.id
        ? cur.map((p) => (p.id === next.id ? { ...p, ...next } : p))
        : [...cur, { id: `${Date.now()}`, done: false, ...next }],
    );
    setPerson(undefined);
  }
  const personOptions = actions
    ? [
        actions.phone && { value: 'call', label: `Call ${actions.name}`, icon: 'phone' },
        actions.phone && { value: 'text', label: `Text ${actions.name}`, icon: 'text' },
        {
          value: 'done',
          label: actions.done ? 'Mark as not checked' : 'Mark as checked on',
          icon: 'check',
        },
        { value: 'edit', label: actions.phone ? 'Edit' : 'Add a phone number', icon: 'pencil' },
        { value: 'remove', label: 'Remove', icon: 'trash' },
      ].filter(Boolean)
    : [];
  function personAction(value) {
    const p = actions;
    if (value === 'call') location.href = `tel:${p.phone.replace(/[^\d+]/g, '')}`;
    if (value === 'text') location.href = `sms:${p.phone.replace(/[^\d+]/g, '')}`;
    if (value === 'done')
      setPeople((cur) => cur.map((x) => (x.id === p.id ? { ...x, done: !x.done } : x)));
    if (value === 'edit') setPerson(p);
    if (value === 'remove') setPeople((cur) => cur.filter((x) => x.id !== p.id));
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
          <p>{readyStatus(progress)}</p>
        </div>
        <div className="chip-row" role="tablist" aria-label="Checklist categories">
          {categories.map(([id, title]) => (
            <button
              key={id}
              type="button"
              role="tab"
              className="chip"
              aria-selected={active === id}
              onClick={() => setCategory(id)}
            >
              {title}
            </button>
          ))}
        </div>
        <Group>
          <AnimatePresence initial={false} mode="popLayout">
            {open.map((item) => (
              <ItemRow key={item.id} item={item} checked={false} onToggle={toggle} />
            ))}
          </AnimatePresence>
          {!open.length && <p className="ios-row ios-row-empty">All done here.</p>}
        </Group>
        {done.length > 0 && (
          <Group className="done-group">
            <button
              type="button"
              className="ios-row done-toggle"
              aria-expanded={showDone}
              onClick={() => setShowDone(!showDone)}
            >
              <span className="ios-row-title">Done ({done.length})</span>
              <Icon name={showDone ? 'up' : 'down'} size={18} className="ios-chevron" />
            </button>
            <AnimatePresence initial={false}>
              {showDone &&
                done.map((item) => <ItemRow key={item.id} item={item} checked onToggle={toggle} />)}
            </AnimatePresence>
          </Group>
        )}

        <button
          type="button"
          className="home-card room-card"
          onClick={() => (room ? setWarmth(true) : setRoomSheet(true))}
        >
          <span className="card-head">
            <span className="card-title">
              <IconTile name="home" /> My warm room
            </span>
            <Icon name="chevron" size={18} className="ios-chevron" />
          </span>
          <span className="room-line">
            {room ? (
              <>
                <b>{room}</b>
                <span>
                  {summary.rate == null
                    ? 'Add HEARTH Home to estimate warmth'
                    : `About ${summary.hoursTo64.toFixed(1)} h until 64 °F`}
                </span>
              </>
            ) : (
              <span>Choose the room you’d stay in</span>
            )}
          </span>
        </button>

        <section className="home-card people-card" aria-label="Check on">
          <span className="card-title">Check on</span>
          <div className="avatar-row">
            {people.map((p) => (
              <button type="button" key={p.id} className="avatar" onClick={() => setActions(p)}>
                <span className="avatar-circle" style={{ background: tint(p.name) }}>
                  {initials(p.name)}
                  {p.done && (
                    <span className="avatar-done">
                      <Icon name="check" size={12} />
                    </span>
                  )}
                </span>
                <span>{p.name.split(' ')[0]}</span>
              </button>
            ))}
            <button
              type="button"
              className="avatar"
              aria-label="Add someone to check on"
              onClick={() => setPerson(null)}
            >
              <span className="avatar-circle avatar-add">
                <Icon name="plus" size={20} />
              </span>
              <span>Add</span>
            </button>
          </div>
          <span className="card-foot">Saved only on this phone.</span>
        </section>

        <Group title="Learn more">
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
          <Row icon="phone" title="NC 211 · call 2-1-1" href="tel:211" />
        </Group>
      </main>
      <div className="share-bar">
        <Button onClick={onShare}>
          <Icon name="share" size={20} /> Share my plan
        </Button>
      </div>

      <ActionSheet
        open={roomSheet}
        onClose={() => setRoomSheet(false)}
        title="My warm room"
        value={room}
        options={['Living room', 'Bedroom', 'Kitchen', 'Basement', 'Other'].map((r) => ({
          value: r,
          label: r,
        }))}
        onSelect={setRoom}
      />
      <PushScreen open={warmth} title="Warmth" backLabel="Ready" onBack={() => setWarmth(false)}>
        <WarmthScreen room={room} device={device} summary={summary} />
      </PushScreen>
      <PersonSheet
        open={person !== undefined}
        onClose={() => setPerson(undefined)}
        person={person}
        onSave={savePerson}
      />
      <ActionSheet
        open={Boolean(actions)}
        onClose={() => setActions(null)}
        title={actions?.name || ''}
        menu
        options={personOptions}
        onSelect={personAction}
      />
    </>
  );
}
