import React from 'react';

/** Small interface marks use geometry rather than platform font glyphs. */
export function InterfaceIcon({ name }) {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    close: 'm6 6 12 12M18 6 6 18',
    search: 'm16 16 4 4M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  };
  return (
    <svg className="interface-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === 'more' ? (
        <g fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </g>
      ) : (
        <path d={paths[name] || paths.plus} />
      )}
    </svg>
  );
}
