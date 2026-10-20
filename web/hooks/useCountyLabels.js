import { useMemo } from 'react';
import { countyLabelAnchors } from '../comparison.js';
export function useCountyLabels(paths, county, view, frame, pixelWidth) {
  const labels = useMemo(() => countyLabelAnchors(paths.zones), [paths]);
  const labelSize = (12 * frame.width) / pixelWidth;
  const displayLabels = useMemo(() => {
    const occupied = [],
      unit = labelSize;
    return labels
      .filter((label) => !county || label.county === county)
      .map((label) => {
        const ax = view.x + label.x * view.scale,
          ay = view.y + label.y * view.scale;
        if (
          ax < frame.x ||
          ax > frame.x + frame.width ||
          ay < frame.y ||
          ay > frame.y + frame.height
        )
          return null;
        const width = label.label.length * unit * 0.57,
          height = unit * 1.3;
        const x = Math.max(
          frame.x + width / 2 + unit,
          Math.min(frame.x + frame.width - width / 2 - unit, ax),
        );
        let y = ay;
        for (const shift of [0, -1.6, 1.6, -3.2, 3.2, -4.8, 4.8]) {
          const candidate = Math.max(
            frame.y + height,
            Math.min(frame.y + frame.height - height, ay + shift * unit),
          );
          const box = {
            x0: x - width / 2,
            x1: x + width / 2,
            y0: candidate - height / 2,
            y1: candidate + height / 2,
          };
          if (
            !occupied.some(
              (other) =>
                box.x0 < other.x1 + unit / 3 &&
                box.x1 > other.x0 - unit / 3 &&
                box.y0 < other.y1 &&
                box.y1 > other.y0,
            )
          ) {
            y = candidate;
            occupied.push(box);
            break;
          }
        }
        return {
          ...label,
          x,
          y,
          ax,
          ay,
        };
      })
      .filter(Boolean);
  }, [labels, county, view, frame, labelSize]);

  return { displayLabels, labelSize };
}
