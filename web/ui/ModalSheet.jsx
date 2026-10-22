import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { Icon } from './Icon.jsx';
import { SPRING_SHEET } from './springs.js';

/** Modal bottom sheet on a frosted material. Drag the header down, tap outside, or press Escape. */
export function ModalSheet({ open, onClose, title, children, className = '', panelRef }) {
  const titleId = useId();
  const local = useRef(null);
  const panel = panelRef || local;
  const dragControls = useDragControls();
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    panel.current?.focus({ preventScroll: true });
    function keys(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('keydown', keys);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, panel]);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="ios-sheet-root">
          <motion.div
            className="ios-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.section
            ref={panel}
            className={`ios-action-sheet ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRING_SHEET}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
          >
            <header
              className="ios-sheet-header"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span className="ios-grabber" aria-hidden="true" />
              <h2 id={titleId}>{title}</h2>
              <button
                type="button"
                className="ios-circle-button"
                aria-label="Close"
                onClick={onClose}
              >
                <Icon name="close" size={18} />
              </button>
            </header>
            {children}
          </motion.section>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
