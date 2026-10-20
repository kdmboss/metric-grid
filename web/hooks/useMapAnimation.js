import { useEffect, useRef } from 'react';
/** Animate the camera with requestAnimationFrame; model settings never change. */
export function useMapAnimation(setView) {
  const frame = useRef(null),
    latest = useRef(setView);
  latest.current = setView;
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return function animate(target) {
    cancelAnimationFrame(frame.current);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      latest.current(target);
      return;
    }
    let start;
    latest.current((current) => {
      start = current;
      return current;
    });
    const began = performance.now();
    function step(now) {
      if (!start) {
        frame.current = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, (now - began) / 240),
        ease = 1 - (1 - t) ** 3;
      latest.current({
        scale: start.scale + (target.scale - start.scale) * ease,
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
      });
      if (t < 1) frame.current = requestAnimationFrame(step);
    }
    frame.current = requestAnimationFrame(step);
  };
}
