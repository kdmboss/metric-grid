import { workspaceProps } from './hooks/workspaceProps.js';
import { Footer } from './components/Footer.jsx';
import { useWorkspace } from './hooks/useWorkspace.js';
import { EvidenceView } from './components/EvidenceView.jsx';
import { ExploreView } from './components/ExploreView.jsx';
import { ComparePlans } from './components/ComparePlans.jsx';
import { MapFilters } from './components/MapFilters.jsx';
import { Hero } from './components/Hero.jsx';
import { AppHeader } from './components/AppHeader.jsx';
import { ViewTabs } from './components/ViewTabs.jsx';
import { Preparation } from './components/Preparation.jsx';
import { ZoneDetail } from './components/ZoneDetail.jsx';
import { ZoneSheet } from './components/ZoneSheet.jsx';
import { ScenarioControls } from './components/ScenarioControls.jsx';
import { PeopleResults } from './components/PeopleResults.jsx';
import React from 'react';
const MODES = [
  ['compare', 'Compare'],
  ['explore', 'Explore'],
  ['prepare', 'Prepare'],
  ['evidence', 'Evidence'],
];
const COMPARE_VIEWS = [
  ['plans', 'Two plans'],
  ['changes', 'What changed?'],
];
export function Workspace({ data }) {
  const workspace = useWorkspace(data);
  const views = workspaceProps(workspace);
  return (
    <div
      className={`planning-app ${workspace.printMode ? 'printing' : ''}`}
      data-mode={workspace.mode}
    >
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <AppHeader {...views.AppHeader} />
      <div className="workspace-nav">
        <ViewTabs
          items={MODES}
          value={workspace.mode}
          onChange={workspace.setMode}
          label="Planning modes"
          modeTabs
        />
      </div>
      <main className="workspace-main">
        <Hero {...views.Hero} />
        <PeopleResults {...views.PeopleResults} />
        <ScenarioControls {...views.ScenarioControls} />
        {workspace.viewResult.note && (
          <p className="notice" role="status">
            {workspace.viewResult.note}
          </p>
        )}
        {workspace.record.widened && (
          <p className="notice">
            Shared band widened to {workspace.record.delta_pct_used}% to find a feasible result.
          </p>
        )}
        {workspace.storageError && (
          <p className="notice" role="status">
            {workspace.storageError}
          </p>
        )}
        <div className="workspace-tools">
          {workspace.mode === 'compare' && (
            <ViewTabs
              items={COMPARE_VIEWS}
              value={workspace.compareTab}
              onChange={workspace.setCompareTab}
              label="Comparison views"
              prefix="compare"
            />
          )}
          {(workspace.mode === 'explore' ||
            (workspace.mode === 'compare' &&
              ['plans', 'changes'].includes(workspace.compareTab))) && (
            <MapFilters {...views.MapFilters} />
          )}
        </div>
        <div id="workspace" className="workspace-body">
          <ExploreView {...views.ExploreView} />
          <ComparePlans {...views.ComparePlans} />
          <section
            id="panel-prepare"
            role="tabpanel"
            aria-labelledby="tab-prepare"
            hidden={workspace.mode !== 'prepare'}
          >
            <Preparation {...views.Preparation} />
          </section>
          <EvidenceView {...views.EvidenceView} />
        </div>

        {workspace.mobile && (
          <ZoneSheet open={workspace.sheetOpen} close={() => workspace.setSheetOpen(false)}>
            <ZoneDetail {...workspace.detailProps} id="sheet-zone" />
          </ZoneSheet>
        )}
        <Footer {...views.Footer} />
      </main>
    </div>
  );
}
