import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useDragControls, useMotionValue, useTransform } from 'motion/react';
import { SPRING_SHEET } from '../ui/springs.js';
import { lightImpact } from '../platform.js';

const DETENTS = ['peek', 'medium', 'large'];
/** Visible height of each detent for the space above the tab bar. */
export function detentHeights(available, peek = 140) {
  if (typeof document === 'undefined')
    return { peek, medium: available / 2, large: available * 0.92 };
  const safe =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top-px')) || 0;
  return {
    peek,
    medium: Math.round(available * 0.5),
    large: Math.round(Math.min(available * 0.92, available - Math.max(safe, 44) - 12)),
  };
}
function available() {
  const viewport = window.visualViewport?.height ?? innerHeight;
  const covered = document.querySelector('.ios-push');
  const tabs = covered
    ? 0
    : (document.querySelector('.ios-tabbar, .mode-tabs')?.getBoundingClientRect().height ?? 0);
  return Math.max(viewport - tabs, 320);
}
/**
 * Bottom sheet with three detents (peek / 50% / 92%). Drag the header; a flick is projected to the nearest
 * detent. With `onDismiss`, flicking down past peek closes it. The map behind stays live at peek.
 */
export function DetentSheet({
  onDismiss,
  onDetent,
  collapseKey,
  label,
  peek = 140,
  header,
  children,
  className = '',
}) {
  const [detent, setDetentState] = useState('peek');
  const [space, setSpace] = useState(available);
  const heights = detentHeights(space, peek);
  const top = heights.large;
  const offsets = { peek: top - heights.peek, medium: top - heights.medium, large: 0 };
  const y = useMotionValue(top);
  const dim = useTransform(y, [offsets.peek, offsets.medium, 0], [0, 0.16, 0.34]);
  const dragControls = useDragControls();
  const dragged = useRef(false);
  useLayoutEffect(() => {
    const measure = () => setSpace(available());
    measure(); // the tab bar mounts after the first render, so measure again once it exists
    const later = setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(later);
      window.removeEventListener('resize', measure);
    };
  }, []);
  function settle(next) {
    setDetentState(next);
    onDetent?.(next);
    animate(y, offsets[next], SPRING_SHEET);
  }
  const firstCollapse = useRef(true);
  useEffect(() => {
    if (firstCollapse.current) {
      firstCollapse.current = false;
      return;
    }
    settle('peek');
  }, [collapseKey]); // eslint-disable-line react-hooks/exhaustive-deps
  function release(_, info) {
    dragged.current = true;
    setTimeout(() => (dragged.current = false), 0);
    const projected = y.get() + info.velocity.y * 0.18;
    if (onDismiss && projected > offsets.peek + 64) return onDismiss();
    const next = DETENTS.reduce((a, b) =>
      Math.abs(offsets[a] - projected) < Math.abs(offsets[b] - projected) ? a : b,
    );
    if (next !== detent) void lightImpact();
    return settle(next);
  }
  function keys(event) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      settle(detent === 'peek' ? 'medium' : 'large');
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (detent === 'peek') onDismiss?.();
      else settle(detent === 'large' ? 'medium' : 'peek');
    }
    if (event.key === 'Escape') onDismiss?.();
  }
  return (
    <>
      <motion.div
        className="ios-dim"
        style={{ opacity: dim, pointerEvents: detent === 'peek' ? 'none' : 'auto' }}
        onClick={() => settle('peek')}
      />
      <motion.section
        className={`ios-zone-sheet ${className}`}
        role="dialog"
        aria-modal="false"
        aria-label={label}
        data-detent={detent}
        style={{ y, height: top }}
        initial={{ y: top }}
        animate={{ y: offsets[detent] }}
        exit={{ y: top + 24 }}
        transition={SPRING_SHEET}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={{ top: 0.04, bottom: 0.2 }}
        dragConstraints={{ top: 0, bottom: top }}
        onDragEnd={release}
      >
        <div className="ios-sheet-drag" onPointerDown={(event) => dragControls.start(event)}>
          <button
            type="button"
            className="ios-grabber-button"
            aria-label={`Resize ${label.toLowerCase()}`}
            onKeyDown={keys}
            onClick={() => {
              if (!dragged.current)
                settle(detent === 'peek' ? 'medium' : detent === 'medium' ? 'large' : 'peek');
            }}
          >
            <span className="ios-grabber" aria-hidden="true" />
          </button>
          {header}
        </div>
        <div className="ios-sheet-scroll" inert={detent === 'peek'}>
          {children}
        </div>
      </motion.section>
    </>
  );
}
