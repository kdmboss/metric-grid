import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { Icon } from './Icon.jsx';
import { SPRING_SHEET } from './springs.js';

/** The screen being covered: the previous pushed screen, or the app root. */
function coveredScreen(self) {
  const pushed = [...document.querySelectorAll('.ios-push')].filter((el) => el !== self);
  return pushed.at(-1) || document.querySelector('.planning-app');
}
function Screen({ title, onBack, backLabel, children }) {
  const width = useRef(innerWidth).current;
  const x = useMotionValue(width);
  const controls = useDragControls();
  const dim = useTransform(x, [0, width], [0.14, 0]);
  const root = useRef(null);
  const depth = useRef(
    typeof document === 'undefined' ? 0 : document.querySelectorAll('.ios-push').length,
  ).current;
  const covered = useRef(null);
  // The screen underneath slides 30% to the left while this one arrives, like UINavigationController.
  useMotionValueEvent(x, 'change', (value) => {
    covered.current ||= coveredScreen(root.current);
    const base = covered.current;
    if (base) base.style.transform = `translate3d(${-0.3 * (width - value)}px, 0, 0)`;
  });
  useEffect(() => {
    const base = (covered.current ||= coveredScreen(root.current));
    const trigger = document.activeElement;
    if (base) base.inert = true;
    root.current?.focus({ preventScroll: true });
    function keys(event) {
      if (event.key === 'Escape') onBack();
    }
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('keydown', keys);
      if (base) {
        base.inert = false;
        base.style.transform = '';
      }
      trigger?.focus?.({ preventScroll: true });
    };
  }, [onBack]);
  return (
    <>
      <motion.div
        className="ios-push-dim"
        style={{ opacity: dim, zIndex: 299 + depth * 10 }}
        aria-hidden="true"
      />
      <motion.section
        ref={root}
        className="ios-push"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ x, zIndex: 300 + depth * 10 }}
        initial={{ x: width }}
        animate={{ x: 0 }}
        exit={{ x: width }}
        transition={SPRING_SHEET}
        drag="x"
        dragControls={controls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: 0, right: width }}
        onDragEnd={(_, info) => {
          if (x.get() > width * 0.35 || info.velocity.x > 500) onBack();
          else animate(x, 0, SPRING_SHEET);
        }}
      >
        <header className="ios-push-bar">
          <button type="button" className="ios-back" onClick={onBack}>
            <Icon name="back" size={24} />
            <span>{backLabel}</span>
          </button>
          <h2>{title}</h2>
        </header>
        <div className="ios-push-body">{children}</div>
        <div
          className="ios-edge"
          onPointerDown={(event) => controls.start(event)}
          aria-hidden="true"
        />
      </motion.section>
    </>
  );
}
/** iOS-style push: slides in from the right, edge-swipe from the left to go back. */
export function PushScreen({ open, ...props }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>{open && <Screen key="push" {...props} />}</AnimatePresence>,
    document.body,
  );
}
