/**
 * "Who's at risk" rule (documented in docs/ASSUMPTIONS.md):
 *   high   = SVI >= 0.75 OR electric heat >= 70% of homes
 *   medium = SVI >= 0.5  OR electric heat >= 50% of homes
 *   low    = otherwise
 *   unknown = the tract has no CDC SVI value (shown gray)
 */
export const RISK_RULE = { highSvi: 0.75, highHeat: 0.7, mediumSvi: 0.5, mediumHeat: 0.5 };
export function riskLevel(zone) {
  if (zone.svi_missing || zone.RPL_THEMES == null) return 'unknown';
  const svi = zone.RPL_THEMES,
    heat = zone.share_electric_heat ?? 0;
  if (svi >= RISK_RULE.highSvi || heat >= RISK_RULE.highHeat) return 'high';
  if (svi >= RISK_RULE.mediumSvi || heat >= RISK_RULE.mediumHeat) return 'medium';
  return 'low';
}
export const RISK_LABEL = { low: 'Low', medium: 'Medium', high: 'High', unknown: 'No data' };
