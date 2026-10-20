import React from 'react';
const paths = {
  right: 'M4 12h16m-6-6 6 6-6 6',
  external: 'M6 18 18 6M6 6h12v12',
  down: 'M12 4v16m-6-6 6 6 6-6',
  reset: 'M5 9a8 8 0 1 1-1 6M5 3v6h6',
};
export function Arrow({ direction = 'right' }) {
  return (
    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[direction] || paths.right} />
    </svg>
  );
}
