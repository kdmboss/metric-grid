import { useEffect, useMemo, useState } from 'react';
import { FOLLOWUPS, STORAGE_KEY, sanitizePlan } from '../planning.js';
export function useShortlist(data) {
  const validIds = useMemo(
    () => new Set(data.zones.features.map((f) => f.properties.zone_id)),
    [data],
  );
  const [plan, setPlan] = useState(() => {
    try {
      return sanitizePlan(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'), validIds);
    } catch {
      return [];
    }
  });
  const [undo, setUndo] = useState(null),
    [storageError, setStorageError] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizePlan(plan, validIds)));
      setStorageError('');
    } catch {
      setStorageError('Browser storage is unavailable; export your shortlist before leaving.');
    }
  }, [plan, validIds]);
  function addZone(id) {
    setPlan((current) =>
      current.some((p) => p.zone === id)
        ? current
        : [...current, { zone: id, note: '', followup: FOLLOWUPS[0] }],
    );
  }
  function clear() {
    setUndo(plan);
    setPlan([]);
  }
  function restore() {
    setPlan((current) => [
      ...current,
      ...undo.filter((item) => !current.some((saved) => saved.zone === item.zone)),
    ]);
    setUndo(null);
  }
  return { plan, setPlan, undo, storageError, addZone, clear, restore };
}
