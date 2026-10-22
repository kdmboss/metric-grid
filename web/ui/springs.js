/** Spring presets shared by every moving surface. Linear easing is never used. */
export const SPRING = { type: 'spring', stiffness: 500, damping: 35 };
export const SPRING_SOFT = { type: 'spring', stiffness: 320, damping: 34 };
export const SPRING_SHEET = { type: 'spring', stiffness: 420, damping: 40, mass: 0.9 };
export const SPRING_POP = { type: 'spring', stiffness: 620, damping: 22 };
export const ENTER = { opacity: 0, y: 8 };
export const SETTLED = { opacity: 1, y: 0 };

/** Thin-space thousands separators for display only; stored and exported numbers keep commas. */
export function thin(text) {
  return String(text).replace(/(\d),(?=\d{3})/g, '$1 ');
}
