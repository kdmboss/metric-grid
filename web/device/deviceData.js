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
/** Devices come only from the real export. With no export there are no devices: nothing is invented. */
export function resolveDevices(real) {
  if (!hasRealDevice(real)) return [];
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
      readings,
      events,
    },
  ];
}
export const currentTemp = (device) => device.readings.at(-1)?.temp_f ?? null;
