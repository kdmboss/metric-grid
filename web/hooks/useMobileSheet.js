import { useEffect, useState } from 'react';
export function useMobileSheet(mode, compareTab, filtersRef) {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width:700px)').matches);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    const query = matchMedia('(max-width:700px)');
    function resize() {
      setMobile(query.matches);
      if (!query.matches) setSheetOpen(false);
    }
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    setSheetOpen(false);
    if (filtersRef.current) filtersRef.current.open = false;
  }, [mode, compareTab, filtersRef]);
  return { mobile, sheetOpen, setSheetOpen };
}
