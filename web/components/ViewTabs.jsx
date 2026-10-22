import { Icon } from '../ui/Icon.jsx';
import { SPRING_POP } from '../ui/springs.js';
import { motion } from 'motion/react';
import React from 'react';

/** One keyboard pattern for mode, comparison, and evidence tabs. */
export function ViewTabs({ items, value, onChange, label, prefix, modeTabs = false }) {
  const tabId = (id) => (modeTabs ? `tab-${id}` : `${prefix}-tab-${id}`);
  const panelId = (id) => (modeTabs ? `panel-${id}` : `${prefix}-${id}`);
  function moveTab(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = items.findIndex(([id]) => id === event.currentTarget.dataset.tab);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    onChange(items[next][0]);
    document.getElementById(tabId(items[next][0]))?.focus();
  }
  function chooseTab(event) {
    onChange(event.currentTarget.dataset.tab);
  }
  return (
    <div className={modeTabs ? 'mode-tabs' : 'view-tabs'} role="tablist" aria-label={label}>
      {items.map(([id, title]) => (
        <button
          key={id}
          role="tab"
          id={tabId(id)}
          aria-controls={value === id ? panelId(id) : undefined}
          aria-selected={value === id}
          tabIndex={value === id ? 0 : -1}
          data-tab={id}
          onClick={chooseTab}
          onKeyDown={moveTab}
        >
          {modeTabs && (
            <motion.span
              key={`${id}-${value === id}`}
              className="mode-icon"
              initial={{ scale: value === id ? 0.86 : 1 }}
              animate={{ scale: 1 }}
              transition={SPRING_POP}
            >
              <Icon name={id} filled={value === id} size={24} />
            </motion.span>
          )}
          <span>{title}</span>
        </button>
      ))}
    </div>
  );
}
