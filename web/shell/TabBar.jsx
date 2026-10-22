import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon.jsx';
import { SPRING_POP } from '../ui/springs.js';

export const TABS = [
  ['home', 'Home', 'home'],
  ['map', 'Map', 'map'],
  ['devices', 'Devices', 'devices'],
  ['ready', 'Ready', 'ready'],
  ['more', 'More', 'more'],
];
/** Five tabs, frosted, ember tint on the selected one, a small spring when it changes. */
export function TabBar({ value, onChange }) {
  return (
    <nav className="ios-tabbar" role="tablist" aria-label="HEARTH">
      {TABS.map(([id, title, icon]) => (
        <button
          key={id}
          type="button"
          role="tab"
          id={`tab-${id}`}
          aria-selected={value === id}
          onClick={() => onChange(id)}
        >
          <motion.span
            key={`${id}-${value === id}`}
            className="tab-glyph"
            initial={{ scale: value === id ? 0.86 : 1 }}
            animate={{ scale: 1 }}
            transition={SPRING_POP}
          >
            <Icon name={icon} filled={value === id} size={24} />
          </motion.span>
          <span>{title}</span>
        </button>
      ))}
    </nav>
  );
}
