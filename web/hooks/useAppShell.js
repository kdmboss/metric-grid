import { useEffect, useState } from 'react';
export function useAppShell() {
  const [standalone, setStandalone] = useState(
    () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  );
  const [scrolled, setScrolled] = useState(() => scrollY > 32);
  const [present, setPresent] = useState(
    () => new URLSearchParams(location.search).get('present') === '1',
  );
  useEffect(() => {
    const media = matchMedia('(display-mode: standalone)');
    function display() {
      setStandalone(media.matches || navigator.standalone === true);
    }
    function scroll() {
      setScrolled(scrollY > 32);
    }
    function shortcut(event) {
      if (
        event.key.toLowerCase() !== 'p' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest('input,textarea,select,[contenteditable=true]'))
      )
        return;
      event.preventDefault();
      setPresent((value) => !value);
    }
    media.addEventListener('change', display);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('keydown', shortcut);
    return () => {
      media.removeEventListener('change', display);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('keydown', shortcut);
    };
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (present) query.set('present', '1');
    else query.delete('present');
    history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
  }, [present]);
  return { standalone, scrolled, present };
}
