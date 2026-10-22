import { Icon } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { isNative } from '../platform.js';
import { AnimatePresence, motion } from 'motion/react';
import { SPRING_SOFT } from '../ui/springs.js';
import { ShortlistItem } from './ShortlistItem.jsx';
import { PrintSheet } from './PrintSheet.jsx';
import React from 'react';
import { CountyData } from '../CountyData.jsx';
import { download, shortlistCsv } from '../planning.js';
export function Preparation({
  rows,
  setPlan,
  counts,
  plan,
  data,
  record,
  zones,
  onExplore,
  undo,
  clear,
  restore,
  printMode,
  setPrintMode,
}) {
  return (
    <div className="preparation">
      <div className="prepare-intro">
        <h2>Your shortlist</h2>
        <Group className="prepare-actions">
          <Row
            icon="download"
            title="Export CSV"
            disabled={!rows.length}
            onClick={() => download(shortlistCsv(rows), 'hearth-planning-shortlist.csv')}
          />
          {!isNative() && (
            <Row
              icon="print"
              title={printMode ? 'Close print view' : 'Print view'}
              disabled={!rows.length}
              onClick={() => setPrintMode(!printMode)}
            />
          )}
        </Group>
      </div>

      {printMode && !isNative() && (
        <PrintSheet setPrintMode={setPrintMode} data={data} record={record} rows={rows} />
      )}
      {!plan.length ? (
        <EmptyState
          className="empty-shortlist"
          icon="list"
          title="Start with your map."
          body="Pick areas on the map to build a list for outreach, warming centers, or backup power."
          action="Explore areas"
          onAction={onExplore}
        />
      ) : (
        <>
          <div className="shortlist-count">
            <h3>
              {plan.length} {plan.length === 1 ? 'zone' : 'zones'} to investigate
            </h3>
            <button className="text-button" onClick={clear}>
              Clear shortlist
            </button>
          </div>
          <div className="shortlist-items">
            <AnimatePresence initial={false} mode="popLayout">
              {plan.map((item) => {
                const z = zones.find((z) => z.zone_id === item.zone);
                return (
                  <motion.div
                    key={item.zone}
                    layout="position"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={SPRING_SOFT}
                  >
                    <ShortlistItem
                      setPlan={setPlan}
                      plan={plan}
                      counts={counts}
                      data={data}
                      record={record}
                      item={item}
                      z={z}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
      <details className="county-import-disclosure">
        <summary>
          <span>Add county resource data (CSV)</span>
          <Icon name="down" size={18} className="ios-chevron" />
        </summary>
        <CountyData zones={zones} record={record} />
      </details>
      {undo && (
        <div className="undo-banner" role="status">
          Shortlist cleared.
          <button className="text-button" onClick={restore}>
            Undo clear
          </button>
        </div>
      )}
    </div>
  );
}
