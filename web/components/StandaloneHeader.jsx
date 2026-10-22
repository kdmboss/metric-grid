import { OverflowMenu } from '../ui/OverflowMenu.jsx';
import { LargeTitleBar } from '../ui/LargeTitleBar.jsx';
import React from 'react';

/** Large-title navigation bar for the classic planner screens. */
export function StandaloneHeader({ mode, showEvidence, exportScenario, onSwitchView }) {
  const title = mode[0].toUpperCase() + mode.slice(1);
  const items = [
    showEvidence && {
      id: 'methods',
      label: 'Methods & sources',
      icon: 'book',
      run: () => showEvidence('methods'),
    },
    exportScenario && {
      id: 'export',
      label: 'Export scenario',
      icon: 'share',
      run: exportScenario,
    },
    { id: 'switch', label: 'Switch view', icon: 'people', run: onSwitchView },
  ];
  return <LargeTitleBar title={title} actions={<OverflowMenu items={items} />} />;
}
