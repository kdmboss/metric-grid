import React from 'react';
import { Icon } from '../ui/Icon.jsx';
const NAMES = { right: 'arrow', external: 'external', down: 'download', reset: 'reset' };
/** Inline direction marks come from the same icon set as everything else. */
export function Arrow({ direction = 'right' }) {
  return <Icon name={NAMES[direction] || 'arrow'} size={16} className="arrow-icon" />;
}
