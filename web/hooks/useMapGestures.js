import { useEffect, useRef } from 'react';
import { zoomAt } from '../mapGeometry.js';
function svgPoint(svg, clientX, clientY) {
  return new DOMPoint(clientX, clientY).matrixTransform(svg.getScreenCTM().inverse());
}
function midpoint(points) {
  return {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2,
  };
}
function distance(points) {
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

/** Pointer events cover mouse drag and two-finger pinch; wheel uses a nonpassive listener. */
export function useMapGestures(svgRef, view, setView, onSelect, onInteract) {
  const pointers = useRef(new Map()),
    gesture = useRef(null),
    current = useRef({
      view,
      setView,
      onInteract,
    });
  current.current = {
    view,
    setView,
    onInteract,
  };
  useEffect(() => {
    const svg = svgRef.current;
    function wheel(event) {
      event.preventDefault();
      const { view, setView, onInteract } = current.current;
      onInteract();
      const point = svgPoint(svg, event.clientX, event.clientY);
      setView(zoomAt(view, Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.002)), point));
    }
    svg.addEventListener('wheel', wheel, {
      passive: false,
    });
    return () => svg.removeEventListener('wheel', wheel);
  }, [svgRef]);
  function begin(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    onInteract();
    const point = svgPoint(event.currentTarget, event.clientX, event.clientY);
    pointers.current.set(event.pointerId, point);
    const points = [...pointers.current.values()];
    gesture.current = {
      view,
      start: point,
      moved: points.length > 1,
      center: points.length > 1 ? midpoint(points) : point,
      distance: points.length > 1 ? distance(points) : 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    const point = svgPoint(event.currentTarget, event.clientX, event.clientY);
    pointers.current.set(event.pointerId, point);
    const points = [...pointers.current.values()],
      base = gesture.current;
    if (points.length > 1) {
      const center = midpoint(points),
        scaled = zoomAt(base.view, distance(points) / Math.max(1, base.distance), base.center);
      setView({
        ...scaled,
        x: scaled.x + center.x - base.center.x,
        y: scaled.y + center.y - base.center.y,
      });
      base.moved = true;
    } else {
      const dx = point.x - base.start.x,
        dy = point.y - base.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) base.moved = true;
      if (base.moved)
        setView({
          ...base.view,
          x: base.view.x + dx,
          y: base.view.y + dy,
        });
    }
  }
  function end(event) {
    if (gesture.current && !gesture.current.moved) {
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest('[data-zone]');
      onSelect(target ? Number(target.dataset.zone) : 0);
    }
    pointers.current.delete(event.pointerId);
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function cancel() {
    pointers.current.clear();
    gesture.current = null;
  }
  return {
    onPointerDown: begin,
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: cancel,
  };
}
