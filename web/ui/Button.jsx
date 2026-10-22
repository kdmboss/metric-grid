import React from 'react';
import { motion } from 'motion/react';
import { SPRING } from './springs.js';

/** primary = filled ember, secondary = tinted, plain = ember text. Press scales to .97 on a spring. */
export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <motion.button
      type="button"
      className={`ios-btn ${
        variant === 'secondary'
          ? 'ios-btn-secondary'
          : variant === 'plain'
            ? 'ios-btn-plain'
            : 'ios-btn-primary'
      } ${className}`}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      {...props}
    >
      {children}
    </motion.button>
  );
}
