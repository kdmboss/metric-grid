import React, { useEffect, useRef } from 'react';
export function Welcome({ choose }) {
  const first = useRef(null),
    last = useRef(null);
  useEffect(() => {
    first.current?.focus();
  }, []);
  function trap(event) {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === first.current) {
      event.preventDefault();
      last.current.focus();
    } else if (!event.shiftKey && document.activeElement === last.current) {
      event.preventDefault();
      first.current.focus();
    }
  }
  return (
    <div className="welcome-overlay">
      <section
        className="welcome-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onKeyDown={trap}
      >
        <span className="workspace-kicker">HEARTH · NC-08</span>
        <h1 id="welcome-title">What brings you here?</h1>
        <button ref={first} onClick={() => choose('resident')}>
          <strong>Check my area</strong>
          <span>See how your town fares and get ready for winter outages.</span>
        </button>
        <button ref={last} onClick={() => choose('planner')}>
          <strong>Plan for an outage</strong>
          <span>Compare plans, explore areas, build a shortlist.</span>
        </button>
        <p>No account needed. Your choice stays in this browser.</p>
      </section>
    </div>
  );
}
