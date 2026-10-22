import React, { useId } from 'react';
import { motion } from 'motion/react';
import { SPRING } from './springs.js';

/** iOS segmented control: the white thumb slides between segments on a spring. */
export function Segmented({ items, value, onChange, label, className = '' }) {
  const id = useId();
  return (
    <div className={`ios-segmented ${className}`} role="group" aria-label={label}>
      {items.map(([key, title, extra]) => (
        <button
          key={key}
          type="button"
          className={extra?.className}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {value === key && (
            <motion.span
              layoutId={`${id}-thumb`}
              className="ios-segmented-thumb"
              transition={SPRING}
            />
          )}
          <span className="ios-segmented-label">{title}</span>
        </button>
      ))}
    </div>
  );
}
