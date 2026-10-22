/** Monotone cubic smoothing (Fritsch–Carlson): a smooth line that never overshoots the data. */
export function smoothPath(points) {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M${points[0][0]},${points[0][1]}`;
  const dx = [],
    slope = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0]);
    slope.push((points[i + 1][1] - points[i][1]) / (dx[i] || 1));
  }
  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i++)
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) tangent[i] = tangent[i + 1] = 0;
    else {
      const a = tangent[i] / slope[i],
        b = tangent[i + 1] / slope[i],
        h = Math.hypot(a, b);
      if (h > 3) {
        tangent[i] = (3 * a * slope[i]) / h;
        tangent[i + 1] = (3 * b * slope[i]) / h;
      }
    }
  }
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i],
      [x1, y1] = points[i + 1],
      w = dx[i] / 3;
    const c1 = [x0 + w, y0 + tangent[i] * w],
      c2 = [x1 - w, y1 - tangent[i + 1] * w];
    const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    d += `C${pt(c1)} ${pt(c2)} ${pt([x1, y1])}`;
  }
  return d;
}
/** Split readings wherever the device was off (a gap longer than `gapMs`). */
export function segments(readings, gapMs = 12 * 60000) {
  const out = [];
  let current = [];
  for (const reading of readings) {
    const t = Date.parse(reading.t);
    if (current.length && t - Date.parse(current.at(-1).t) > gapMs) {
      out.push(current);
      current = [];
    }
    current.push(reading);
  }
  if (current.length) out.push(current);
  return out;
}
