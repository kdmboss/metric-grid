import { useCallback, useState } from 'react';

export const KEYS = {
  places: 'hearth.places.v2',
  ready: 'hearth.ready.checked.v2',
  setup: 'hearth.ready.setup.v2',
  check: 'hearth.ready.people.v2',
  deviceHome: 'hearth.device.home.v2',
};
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is optional; the value still lives for this visit. */
  }
}
/** useState persisted to localStorage; every read and write is guarded. */
export function useStored(key, initial) {
  const [value, setValue] = useState(() => readJSON(key, initial));
  const set = useCallback(
    (update) =>
      setValue((current) => {
        const next = typeof update === 'function' ? update(current) : update;
        writeJSON(key, next);
        return next;
      }),
    [key],
  );
  return [value, set];
}
/** Erase everything HEARTH saved on this device. */
export function resetAppData() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    keys.filter((k) => k && k.startsWith('hearth')).forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {
    /* Nothing to erase. */
  }
}
