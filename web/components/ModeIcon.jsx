import React from 'react';
const PATHS = {
  compare: 'M3 4h7v16H3zM14 4h7v16h-7z',
  explore: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15m6-12v15',
  prepare: 'M7 4h10v3H7zM5 6H3v15h18V6h-2M7 12h10M7 16h7',
  evidence: 'M6 3h9l4 4v14H6ZM14 3v5h5M9 12h7M9 16h7',
};
export function ModeIcon({ mode }) {
  return (
    <svg className="mode-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[mode]} />
    </svg>
  );
}
