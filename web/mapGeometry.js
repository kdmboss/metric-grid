export const HOME_VIEW = {
  scale: 1,
  x: 0,
  y: 0,
};
export function pathPoints(paths) {
  return paths.flatMap((path) =>
    [...path.d.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map((match) => [
      Number(match[1]),
      Number(match[2]),
    ]),
  );
}
export function pathBounds(paths) {
  const points = pathPoints(paths);
  if (!points.length)
    return {
      x: 0,
      y: 0,
      width: 640,
      height: 390,
    };
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  const x = Math.min(...xs),
    y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
}
/** Preserve sixteen screen pixels around the projected district at any panel size. */
export function viewportFrame(paths, width, height) {
  const bounds = pathBounds(paths),
    ratio = width / height;
  const span = Math.max(
    bounds.width / (1 - 32 / Math.max(64, width)),
    (bounds.height / (1 - 32 / Math.max(64, height))) * ratio,
  );
  return {
    x: bounds.x + bounds.width / 2 - span / 2,
    y: bounds.y + bounds.height / 2 - span / ratio / 2,
    width: span,
    height: span / ratio,
  };
}
export function fitPaths(paths) {
  const bounds = pathBounds(paths);
  const scale = Math.min(6, 400 / Math.max(1, bounds.width), 300 / Math.max(1, bounds.height));
  return {
    scale,
    x: 320 - (bounds.x + bounds.width / 2) * scale,
    y: 195 - (bounds.y + bounds.height / 2) * scale,
  };
}
export function zoomAt(view, factor, point) {
  const scale = Math.max(0.8, Math.min(8, view.scale * factor)),
    ratio = scale / view.scale;
  return {
    scale,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  };
}
export function zoomView(view, factor) {
  return zoomAt(view, factor, {
    x: 320,
    y: 195,
  });
}

/** Area-weighted centroid of the largest outer polygon; holes stay out of the pin math. */
export function pathCentroid(path) {
  const rings = path.d
    .split('M')
    .filter(Boolean)
    .map((d) =>
      pathPoints([
        {
          d: 'M' + d,
        },
      ]),
    );
  let best = null;
  for (const ring of rings) {
    let area = 0,
      x = 0,
      y = 0;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i],
        b = ring[(i + 1) % ring.length],
        cross = a[0] * b[1] - b[0] * a[1];
      area += cross;
      x += (a[0] + b[0]) * cross;
      y += (a[1] + b[1]) * cross;
    }
    if (Math.abs(area) > Math.abs(best?.area || 0))
      best = {
        area,
        x: x / (3 * area),
        y: y / (3 * area),
      };
  }
  if (best)
    return {
      x: best.x,
      y: best.y,
    };
  const bounds = pathBounds([path]);
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}
