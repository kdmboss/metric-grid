import React from 'react';
export function Help({ label, children }) {
  return (
    <details className="inline-help">
      <summary aria-label={`Explain ${label}`}>i</summary>
      <p>{children}</p>
    </details>
  );
}
