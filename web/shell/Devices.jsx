import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Icon, IconTile } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { PushScreen } from '../ui/PushScreen.jsx';
import { Button } from '../ui/Button.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { TempChart } from '../ui/TempChart.jsx';
import { CountUp } from '../ui/CountUp.jsx';
import {
  clock12,
  dateLabel,
  formatDuration,
  lastDay,
  outageStats,
  relativeTime,
  smoothReadings,
  stamp,
} from '../device/outage.js';
import { currentTemp } from '../device/deviceData.js';
import { SPRING_SOFT } from '../ui/springs.js';

const f1 = (n) => (Number.isFinite(n) ? n.toFixed(1) : '—');

export function DeviceRow({ device, onOpen }) {
  return (
    <button type="button" className="ios-row device-row" onClick={() => onOpen(device)}>
      <IconTile name="thermometer" />
      <span className="ios-row-body">
        <span className="ios-row-title">{device.name}</span>
        <span className="ios-row-detail">
          {device.room} · {relativeTime(device.readings.at(-1).t)}
        </span>
      </span>
      <span className="ios-row-value device-temp-small">{f1(currentTemp(device))} °F</span>
      <Icon name="chevron" size={18} className="ios-chevron" />
    </button>
  );
}
export function DevicesTab({ devices, onOpen, onSetup }) {
  return (
    <>
      <LargeTitleBar
        title="Devices"
        actions={
          devices.length > 0 && (
            <button
              type="button"
              className="ios-circle-button"
              aria-label="Set up a device"
              onClick={onSetup}
            >
              <Icon name="plus" size={20} />
            </button>
          )
        }
      />
      <main className="tab-main">
        {devices.length ? (
          <Group>
            {devices.map((device) => (
              <DeviceRow key={device.id} device={device} onOpen={onOpen} />
            ))}
          </Group>
        ) : (
          <EmptyState
            className="devices-empty"
            icon="devices"
            title="No device connected yet"
            body="HEARTH Home measures your room’s temperature and logs power outages."
            action="How to set it up"
            onAction={onSetup}
          />
        )}
      </main>
    </>
  );
}
export function OutageRow({ event, onOpen }) {
  const stats = outageStats(event);
  return (
    <button type="button" className="ios-row" onClick={() => onOpen(event)}>
      <span className="ios-row-body">
        <span className="ios-row-title">{dateLabel(event.start)}</span>
        <span className="ios-row-detail">
          {clock12(event.start)} – {clock12(event.end)} · {formatDuration(stats.durationMs)}
        </span>
      </span>
      <span className="drop-chip">−{f1(stats.drop)} °F</span>
      <Icon name="chevron" size={18} className="ios-chevron" />
    </button>
  );
}
export function DeviceScreen({ device, home, setHome, onOutage }) {
  const temp = currentTemp(device);
  const series = useMemo(() => smoothReadings(lastDay(device.readings)), [device]);
  return (
    <div className="device-screen">
      <div className="device-hero-card">
        <p className="device-room">{device.room}</p>
        <p className="device-temp" aria-label={`${f1(temp)} degrees Fahrenheit`}>
          <CountUp value={temp} format={(v) => v.toFixed(1)} />
          <small>°F</small>
        </p>
        <p className="device-updated">Last reading {stamp(device.readings.at(-1).t)}</p>
      </div>
      <TempChart readings={series} label={`${device.room} temperature, last 24 hours`} />
      <Group title="Power outages">
        {device.events.length ? (
          device.events.map((event) => (
            <OutageRow key={event.start} event={event} onOpen={onOutage} />
          ))
        ) : (
          <p className="ios-row ios-row-empty">No outages recorded yet.</p>
        )}
      </Group>
      <Group>
        <label className="ios-row ios-switch-row">
          <IconTile name="home" tone="ink" />
          <span className="ios-row-body">
            <span className="ios-row-title">Show on Home</span>
          </span>
          <input
            type="checkbox"
            className="ios-switch"
            role="switch"
            checked={home}
            onChange={(event) => setHome(event.target.checked)}
          />
        </label>
      </Group>
    </div>
  );
}
export function OutageDetail({ event }) {
  const stats = outageStats(event);
  return (
    <div className="device-screen outage-detail">
      <div className="device-hero">
        <p className="device-room">{dateLabel(event.start)}</p>
        <p className="device-temp device-duration">{formatDuration(stats.durationMs)}</p>
      </div>
      <div className="timeline">
        <div className="timeline-track" aria-hidden="true">
          <i />
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...SPRING_SOFT, delay: 0.1 }}
          />
          <i />
        </div>
        <div className="timeline-ends">
          <div>
            <small>Power off</small>
            <b>{clock12(event.start)}</b>
            <span>{f1(event.temp_start_f)} °F</span>
          </div>
          <div>
            <small>Power back</small>
            <b>{clock12(event.end)}</b>
            <span>{f1(event.temp_end_f)} °F</span>
          </div>
        </div>
      </div>
      <Group>
        <Row icon="trend" title="Temperature drop" value={`${f1(stats.drop)} °F`} />
        <Row icon="snowflake" title="Drop rate" value={`${f1(stats.rate)} °F/hour`} />
      </Group>
      <p className="ios-section-footer">Recorded by HEARTH Home in this room.</p>
    </div>
  );
}
const Step = ({ n, icon, children }) => (
  <li className="step-row">
    <span className="step-number">{n}</span>
    <IconTile name={icon} />
    <span>{children}</span>
  </li>
);
export function DeviceSetupSheet({ open, onClose }) {
  return (
    <ModalSheet open={open} onClose={onClose} title="Set up HEARTH Home">
      <div className="ios-sheet-list">
        <ol className="step-list">
          <Step n="1" icon="plug">
            Plug it in
          </Step>
          <Step n="2" icon="thermometer">
            It shows the room temperature
          </Step>
          <Step n="3" icon="bolt">
            It logs outages by itself
          </Step>
          <Step n="4" icon="share">
            Export the log to this app
          </Step>
        </ol>
        <Button className="sheet-cta" onClick={onClose}>
          Done
        </Button>
      </div>
    </ModalSheet>
  );
}
export function CoolingTestSheet({ open, onClose }) {
  return (
    <ModalSheet open={open} onClose={onClose} title="Cooling test">
      <div className="ios-sheet-list">
        <ol className="step-list">
          <Step n="1" icon="snowflake">
            Turn the heat off
          </Step>
          <Step n="2" icon="home">
            Close the room’s door
          </Step>
          <Step n="3" icon="clock">
            Leave it 2 hours
          </Step>
        </ol>
        <Button className="sheet-cta" disabled>
          Start · Coming soon
        </Button>
      </div>
    </ModalSheet>
  );
}
export function DevicePushes({ device, outage, setOutage, open, setOpen, home, setHome }) {
  return (
    <>
      <PushScreen
        open={open && Boolean(device)}
        title={device ? device.room : ''}
        backLabel="Devices"
        onBack={() => setOpen(false)}
      >
        {device && (
          <DeviceScreen device={device} home={home} setHome={setHome} onOutage={setOutage} />
        )}
      </PushScreen>
      <PushScreen
        open={open && Boolean(device && outage)}
        title="Outage"
        backLabel={device ? device.room : 'Back'}
        onBack={() => setOutage(null)}
      >
        {device && outage && <OutageDetail event={outage} />}
      </PushScreen>
    </>
  );
}
