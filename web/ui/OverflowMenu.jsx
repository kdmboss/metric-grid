import React, { useState } from 'react';
import { Icon } from './Icon.jsx';
import { ActionSheet } from './ActionSheet.jsx';

/** Circular "more" button that opens an iOS action sheet of commands. */
export function OverflowMenu({ items, className = '', title = 'HEARTH' }) {
  const [open, setOpen] = useState(false);
  const options = items.filter(Boolean).map(({ id, label, icon }) => ({ value: id, label, icon }));
  return (
    <>
      <button
        type="button"
        className={`ios-circle-button ${className}`}
        aria-label="App options"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Icon name="more" size={20} />
      </button>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        options={options}
        menu
        onSelect={(id) => items.find((item) => item && item.id === id).run()}
      />
    </>
  );
}
