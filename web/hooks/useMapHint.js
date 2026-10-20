import { useEffect, useState } from 'react';
const KEY = 'hearth.map-interacted',
  EVENT = 'hearth-map-interacted';
export function useMapHint() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return true;
    }
  });
  useEffect(() => {
    function hide() {
      setVisible(false);
    }
    window.addEventListener(EVENT, hide);
    return () => window.removeEventListener(EVENT, hide);
  }, []);
  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* The hint still hides for this visit. */
    }
    window.dispatchEvent(new Event(EVENT));
  }
  return { hint: visible, dismissHint: dismiss };
}
