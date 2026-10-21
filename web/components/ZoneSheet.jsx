import { InterfaceIcon } from './InterfaceIcon.jsx';
import React, { useRef, useState } from 'react';
import { Status } from './EvidencePrimitives.jsx';
import { status } from '../model.js';
import { awarePlanLabel } from '../presentation.js';
const HEIGHTS = { peek: 120, half: 0.5, full: 0.88 };
export function sheetHeight(detent, height) {
  return detent === 'peek' ? HEIGHTS.peek : Math.round(height * HEIGHTS[detent]);
}
export function ZoneSheet({ open, close, zone, record, children }) {
  const [detent, setDetent] = useState('peek'),
    [dragOffset, setDragOffset] = useState(0);
  const gesture = useRef(null);
  const dragged = useRef(false);
  if (!open || !zone) return null;
  function start(event) {
    if (event.target.closest('.sheet-close')) return;
    dragged.current = false;
    gesture.current = {
      y: event.clientY,
      time: performance.now(),
      height: sheetHeight(detent, innerHeight),
    };
    event.target.setPointerCapture(event.pointerId);
  }
  function move(event) {
    if (gesture.current) setDragOffset(event.clientY - gesture.current.y);
  }
  function end(event) {
    if (!gesture.current) return;
    const offset = event.clientY - gesture.current.y;
    const elapsed = performance.now() - gesture.current.time;
    dragged.current = Math.abs(offset) > 8;
    if ((detent === 'peek' && offset > 55) || (offset > 120 && offset / elapsed > 0.5)) close();
    else {
      const height = gesture.current.height - offset;
      const next = ['peek', 'half', 'full'].reduce((a, b) =>
        Math.abs(sheetHeight(a, innerHeight) - height) <
        Math.abs(sheetHeight(b, innerHeight) - height)
          ? a
          : b,
      );
      setDetent(next);
    }
    gesture.current = null;
    setDragOffset(0);
  }
  function handleKeys(event) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setDetent(detent === 'peek' ? 'half' : 'full');
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (detent === 'peek') close();
      else setDetent('peek');
    }
    if (event.key === 'Escape') close();
  }
  return (
    <section
      className="zone-sheet"
      role="dialog"
      aria-modal="false"
      aria-label="Selected area details"
      data-detent={detent}
      style={{ transform: `translateY(${dragOffset}px)` }}
    >
      <div
        className="sheet-drag-region"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={() => {
          gesture.current = null;
          setDragOffset(0);
        }}
      >
        <button
          className="sheet-handle"
          aria-label="Resize area details"
          onKeyDown={handleKeys}
          onClick={() => {
            if (!dragged.current)
              setDetent(detent === 'peek' ? 'half' : detent === 'half' ? 'full' : 'peek');
          }}
        >
          <span aria-hidden="true" />
        </button>
        <button className="icon-button sheet-close" aria-label="Close area details" onClick={close}>
          <InterfaceIcon name="close" />
        </button>
      </div>
      <div className="sheet-peek">
        <strong>
          Zone {zone.zone_id} · {zone.COUNTY.replace(' County', '')}
        </strong>
        <div>
          <span>
            MW-only <Status value={status(zone, record.baseline)} />
          </span>
          <span>
            {record.alpha === 0 ? 'Business cost' : awarePlanLabel(record)}{' '}
            <Status value={status(zone, record.weighted)} />
          </span>
        </div>
      </div>
      <div className="sheet-scroll" inert={detent === 'peek'}>
        {children}
      </div>
    </section>
  );
}
