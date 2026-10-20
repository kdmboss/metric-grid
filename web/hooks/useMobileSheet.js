import { useEffect, useRef, useState } from 'react';
export function useMobileSheet(mode, compareTab, filtersRef) {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width:700px)').matches);
  const [sheetOpen, setSheetOpen] = useState(() =>
    Boolean(Number(new URLSearchParams(location.search).get('zone'))),
  );
  const [compact, setCompact] = useState(() => matchMedia('(max-width:1099px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width:700px)');
    const surface = matchMedia('(max-width:1099px)');
    function resize() {
      setMobile(query.matches);
      setCompact(surface.matches);
    }
    query.addEventListener('change', resize);
    surface.addEventListener('change', resize);
    return () => {
      query.removeEventListener('change', resize);
      surface.removeEventListener('change', resize);
    };
  }, []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSheetOpen(false);
    if (filtersRef.current) filtersRef.current.open = false;
  }, [mode, compareTab, filtersRef]);
  return { mobile, compact, sheetOpen, setSheetOpen };
}
