import React, { useEffect, useRef } from 'react';
export function ZoneSheet({ open, close, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="zone-sheet"
      aria-label="Selected zone details"
      onClose={close}
      onCancel={close}
    >
      <div className="sheet-drag-handle" aria-hidden="true" />
      <div className="sheet-heading">
        <h2>Zone details</h2>
        <button className="button" autoFocus onClick={close}>
          Close
        </button>
      </div>
      {children}
    </dialog>
  );
}
