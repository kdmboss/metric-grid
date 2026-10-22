import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon.jsx';
import { Button } from './Button.jsx';
import { ENTER, SETTLED, SPRING_SOFT } from './springs.js';

/** Centered 48px icon in a tinted circle, a title, one line, one primary action. */
export function EmptyState({ icon = 'plus', title, body, action, onAction, className = '' }) {
  return (
    <motion.div
      className={`ios-empty ${className}`}
      initial={ENTER}
      animate={SETTLED}
      transition={SPRING_SOFT}
    >
      <span className="ios-empty-icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action && (
        <Button onClick={onAction}>
          {action} <Icon name="arrow" size={18} />
        </Button>
      )}
    </motion.div>
  );
}
