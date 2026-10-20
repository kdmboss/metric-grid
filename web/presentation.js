/** Labels describe the objective, never an assumed improvement in the outcome. */
export function awarePlanLabel(record) {
  return record.alpha === 0 ? 'Business-cost optimized' : 'Vulnerability-aware';
}
export function comparisonDirection(before, after) {
  const difference = after - before;
  return Math.abs(difference) < 1e-9 ? 'unchanged' : difference > 0 ? 'higher' : 'lower';
}
export function objectiveExplanation(record) {
  return record.alpha === 0
    ? 'Business-cost optimized minimizes interruption cost only. The ' +
        'human-impact score has zero weight; exposure to cold can increase.'
    : record.alpha === 1
      ? 'People-at-risk priority gives interruption cost zero weight. Compare the ' +
        'household and cost trade-offs.'
      : 'The priority blends vulnerability-weighted impact and interruption cost. ' +
        'Both plans meet the same modeled MW band.';
}

/** Preserve existing shared links after moving county/range views into Evidence. */
export function initialNavigation(search = '') {
  const query = new URLSearchParams(search),
    section = query.get('section');
  let mode = ['compare', 'explore', 'prepare', 'evidence'].includes(query.get('mode'))
    ? query.get('mode')
    : 'compare';
  if (['counties', 'range'].includes(section) && ['compare', 'evidence'].includes(mode))
    mode = 'evidence';
  return {
    mode,
    compareTab: section === 'changes' ? 'changes' : 'plans',
    evidenceTab: ['counties', 'range', 'robust', 'forecast', 'methods'].includes(section)
      ? section
      : 'robust',
  };
}
