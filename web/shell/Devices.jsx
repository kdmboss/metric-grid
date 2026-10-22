import React, { useMemo } from 'react';
import { Icon, IconTile } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import { ModalSheet } from '../ui/ModalSheet.jsx';
import { PushScreen } from '../ui/PushScreen.jsx';
import { Button } from '../ui/Button.jsx';
import { TempChart } from '../ui/TempChart.jsx';
import { CountUp } from '../ui/CountUp.jsx';
import {
  clock,
  clockRange,
  coolingSummary,
  dateLabel,
  formatDuration,
  last24h,
  outageStats,
  relativeTime,
  smoothReadings,
} from '../device/outage.js';
import { currentTemp } from '../device/deviceData.js';

/** Every sample-derived surface renders this. Real devices never do. */
export function SampleBadge() {
  return <span className="sample-badge">Sample data</span>;
}
const f1 = (n) => (Number.isFinite(n) ? n.toFixed(1) : '—');
const when = (iso) => `${dateLabel(iso)} · ${clock(iso)}`;

export function DeviceRow({ device, onOpen }) {
  const temp = currentTemp(device);
  return (
    <button type="button" className="ios-row device-row" onClick={() => onOpen(device)}>
      <IconTile name="thermometer" />
      <span className="ios-row-body">
        <span className="ios-row-title">
          {device.sample ? device.name : `${device.name} · ${device.room}`}
          {device.sample && <SampleBadge />}
        </span>
        <span className="ios-row-detail">
          <i className="status-dot" data-live={!device.sample} aria-hidden="true" />
          {device.room} · {relativeTime(device.readings.at(-1).t)}
        </span>
      </span>
      <span className="ios-row-value device-temp-small">{f1(temp)} °F</span>
      <Icon name="chevron" size={18} className="ios-chevron" />
    </button>
  );
}
export function DevicesTab({ devices, onOpen, onAdd }) {
  return (
    <>
      <LargeTitleBar
        title="Devices"
        actions={
          <button
            type="button"
            className="ios-circle-button"
            aria-label="Add device"
            onClick={onAdd}
          >
            <Icon name="plus" size={20} />
          </button>
        }
      />
      <main className="tab-main">
        <Group>
          {devices.map((device) => (
            <DeviceRow key={device.id} device={device} onOpen={onOpen} />
          ))}
        </Group>
      </main>
    </>
  );
}

export function OutageRow({ event, device, onOpen }) {
  const stats = outageStats(event);
  return (
    <button type="button" className="ios-row" onClick={() => onOpen(event)}>
      <span className="ios-row-body">
        <span className="ios-row-title">
          {dateLabel(event.start)}
          {device.sample && <SampleBadge />}
        </span>
        <span className="ios-row-detail">
          {clockRange(event.start, event.end)} · {formatDuration(stats.durationMs)}
        </span>
      </span>
      <span className="ios-row-value outage-value">
        {f1(event.temp_start_f)} → {f1(event.temp_end_f)} °F
      </span>
      <Icon name="chevron" size={18} className="ios-chevron" />
    </button>
  );
}
export function DeviceScreen({ device, home, setHome, onOutage, onCooling }) {
  const temp = currentTemp(device);
  const series = useMemo(() => smoothReadings(last24h(device.readings)), [device]);
  const cooling = coolingSummary(device.events, temp);
  return (
    <div className="device-screen">
      <div className="device-hero">
        <p className="device-room">
          {device.room}
          {device.sample && <SampleBadge />}
        </p>
        <p className="device-temp" aria-label={`${f1(temp)} degrees Fahrenheit`}>
          <CountUp value={temp} format={(v) => v.toFixed(1)} />
          <small>°F</small>
        </p>
        <p className="device-updated">Updated {relativeTime(device.readings.at(-1).t)}</p>
      </div>
      <TempChart readings={series} label={`${device.room} temperature, last 24 hours`} />
      <Group title="Power outages">
        {device.events.length ? (
          device.events.map((event) => (
            <OutageRow key={event.start} event={event} device={device} onOpen={onOutage} />
          ))
        ) : (
          <p className="ios-row ios-row-empty">No outages recorded yet.</p>
        )}
      </Group>
      <Group title="Cooling">
        <Row
          icon="snowflake"
          title="Cooling rate"
          value={cooling.rate == null ? 'Not measured' : `${f1(cooling.rate)} °F/h`}
        />
        <Row
          icon="clock"
          title="Until 64 °F"
          value={cooling.hoursTo64 == null ? '—' : `about ${f1(cooling.hoursTo64)} h`}
        />
      </Group>
      <Button variant="secondary" className="device-cta" onClick={onCooling}>
        Start cooling test
      </Button>
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
export function OutageDetail({ device, event }) {
  const stats = outageStats(event);
  const around = useMemo(() => {
    const from = Date.parse(event.start) - 3 * 3600000,
      to = Date.parse(event.end) + 3 * 3600000;
    return device.readings.filter((r) => Date.parse(r.t) >= from && Date.parse(r.t) <= to);
  }, [device, event]);
  const bridge = [
    { t: event.start, temp_f: event.temp_start_f },
    { t: event.end, temp_f: event.temp_end_f },
  ];
  return (
    <div className="device-screen outage-detail">
      <div className="device-hero">
        <p className="device-room">
          Power outage
          {device.sample && <SampleBadge />}
        </p>
        <p className="device-temp device-duration">{formatDuration(stats.durationMs)}</p>
      </div>
      <Group>
        <Row icon="calendar" title="Started" value={when(event.start)} />
        <Row icon="plug" title="Power back" value={when(event.end)} />
        <Row
          icon="thermometer"
          title="Temperature at start"
          value={`${f1(event.temp_start_f)} °F`}
        />
        <Row icon="thermometer" title="When power came back" value={`${f1(event.temp_end_f)} °F`} />
        <Row icon="trend" title="Drop" value={`${f1(stats.drop)} °F`} />
        <Row icon="snowflake" title="Drop rate" value={`${f1(stats.rate)} °F/hour`} />
      </Group>
      <TempChart
        readings={around}
        bridges={[bridge]}
        height={170}
        label="Temperature around the outage"
      />
      <p className="ios-section-footer">
        {device.sample
          ? 'Sample data, not recorded by a device.'
          : 'Recorded by HEARTH Home in this room.'}
      </p>
    </div>
  );
}
const STEP = ({ n, icon, children }) => (
  <li className="step-row">
    <span className="step-number">{n}</span>
    <IconTile name={icon} />
    <span>{children}</span>
  </li>
);
export function AddDeviceSheet({ open, onClose }) {
  return (
    <ModalSheet open={open} onClose={onClose} title="Connect HEARTH Home">
      <div className="ios-sheet-list">
        <ol className="step-list">
          <STEP n="1" icon="plug">
            Plug it in
          </STEP>
          <STEP n="2" icon="wifi">
            Join your Wi-Fi
          </STEP>
          <STEP n="3" icon="link">
            Tap Pair
          </STEP>
        </ol>
        <Button className="sheet-cta" disabled>
          Pair · Coming soon
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
          <STEP n="1" icon="snowflake">
            Turn the heat off
          </STEP>
          <STEP n="2" icon="home">
            Close the room’s door
          </STEP>
          <STEP n="3" icon="clock">
            Leave it 2 hours
          </STEP>
        </ol>
        <Button className="sheet-cta" disabled>
          Start · Coming soon
        </Button>
      </div>
    </ModalSheet>
  );
}
export function DevicePushes({
  device,
  outage,
  setOutage,
  open,
  setOpen,
  home,
  setHome,
  onCooling,
}) {
  return (
    <>
      <PushScreen
        open={open && Boolean(device)}
        title={device ? device.room : ''}
        backLabel="Devices"
        onBack={() => setOpen(false)}
      >
        {device && (
          <DeviceScreen
            device={device}
            home={home}
            setHome={setHome}
            onOutage={setOutage}
            onCooling={onCooling}
          />
        )}
      </PushScreen>
      <PushScreen
        open={open && Boolean(device && outage)}
        title="Outage"
        backLabel={device ? device.room : 'Back'}
        onBack={() => setOutage(null)}
      >
        {device && outage && <OutageDetail device={device} event={outage} />}
      </PushScreen>
    </>
  );
}
