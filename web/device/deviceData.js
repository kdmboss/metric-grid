import { makeSampleDevice } from '../demo/deviceSample.js';

const validReading = (r) => r && typeof r.t === 'string' && Number.isFinite(r.temp_f);
const validEvent = (e) =>
  e &&
  typeof e.start === 'string' &&
  typeof e.end === 'string' &&
  Number.isFinite(e.temp_start_f) &&
  Number.isFinite(e.temp_end_f) &&
  Date.parse(e.end) > Date.parse(e.start);
/** True when a real exported log (data/frozen/device_*.json) was bundled with the app. */
export function hasRealDevice(real) {
  return Boolean(real && Array.isArray(real.readings) && real.readings.some(validReading));
}
/**
 * Real data always wins. Sample data is returned only when no real export exists, and the two are
 * never combined: a device is either entirely real or entirely sample.
 */
export function resolveDevices(real, now = Date.now()) {
  if (hasRealDevice(real)) {
    const readings = real.readings
      .filter(validReading)
      .sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
    const events = (real.events || [])
      .filter(validEvent)
      .sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
    return [
      {
        id: real.device?.id || 'hearth-home',
        name: 'HEARTH Home',
        room: real.device?.name || 'Home',
        sample: false,
        readings,
        events,
      },
    ];
  }
  return [makeSampleDevice(now)];
}
export const currentTemp = (device) => device.readings.at(-1)?.temp_f ?? null;
