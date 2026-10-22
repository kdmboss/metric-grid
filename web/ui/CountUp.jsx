import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';

/**
 * Counts to a new value in ~400ms. The moving digits are aria-hidden and written straight to
 * the DOM (React never re-renders them mid-count); a static copy carries the final value.
 */
export function CountUp({ value, format }) {
  const reduced = useReducedMotion();
  const shown = useMotionValue(value);
  const text = useRef(null);
  const formatRef = useRef(format);
  formatRef.current = format;
  const previous = useRef(value);
  const paint = (latest) => {
    if (text.current) text.current.textContent = formatRef.current(latest);
  };
  useLayoutEffect(() => paint(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  useMotionValueEvent(shown, 'change', paint);
  useEffect(() => {
    if (previous.current === value) return undefined;
    previous.current = value;
    if (reduced) {
      shown.set(value);
      return undefined;
    }
    const controls = animate(shown, value, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduced, shown]);
  return (
    <>
      <span ref={text} aria-hidden="true" className="count-up" />
      <span className="sr-only">{format(value)}</span>
    </>
  );
}
