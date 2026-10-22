import React, { useEffect, useRef } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';
import { SPRING_POP } from './springs.js';

/** Wraps a changing value; every change pops it from 0.9 to 1 on a spring. */
export function Pop({ trigger, className = '', children }) {
  const [scope, animate] = useAnimate();
  const reduced = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!reduced) animate(scope.current, { scale: [0.9, 1] }, SPRING_POP);
  }, [trigger, reduced, animate, scope]);
  return (
    <span ref={scope} className={`pop ${className}`}>
      {children}
    </span>
  );
}
