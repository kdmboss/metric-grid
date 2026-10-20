export const ENTRY_KEY = 'hearth.entry.v1';
export function entryChoice(search, storage) {
  const query = new URLSearchParams(search).get('view');
  if (['resident', 'planner'].includes(query)) return query;
  try {
    const saved = storage?.getItem(ENTRY_KEY);
    return ['resident', 'planner'].includes(saved) ? saved : null;
  } catch {
    return null;
  }
}
