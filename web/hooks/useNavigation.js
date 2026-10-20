import { useEffect, useState } from 'react';
import { readState } from '../model.js';
import { initialNavigation } from '../presentation.js';
export function useNavigation(data) {
  const [state, setState] = useState(() => readState(data, location.search));
  const [nav, setNav] = useState(() => initialNavigation(location.search));
  const setMode = (value) => setNav((current) => ({ ...current, mode: value }));
  const setCompareTab = (value) => setNav((current) => ({ ...current, compareTab: value }));
  const setEvidenceTab = (value) => setNav((current) => ({ ...current, evidenceTab: value }));
  const { mode, compareTab, evidenceTab } = nav;
  useEffect(() => {
    const query = new URLSearchParams(location.search),
      c = data.constants;
    query.set('alpha', state.alpha);
    query.set('pct', state.target === 'elliott' ? (100 * c.T_NC08_mw) / c.D_NC08_mw : state.target);
    query.set('section', mode === 'evidence' ? evidenceTab : compareTab);
    query.set('cap', state.cap ? '1' : '0');
    query.set('zone', state.zone);
    query.set('mode', mode);
    history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
  }, [state, mode, compareTab, evidenceTab, data]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [mode]);
  useEffect(() => {
    function restoreLink() {
      setState(readState(data, location.search));
      setNav(initialNavigation(location.search));
    }
    window.addEventListener('popstate', restoreLink);
    return () => window.removeEventListener('popstate', restoreLink);
  }, [data]);
  return { ...nav, state, setState, setMode, setCompareTab, setEvidenceTab };
}
