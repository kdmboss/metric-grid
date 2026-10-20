import { ShortlistItem } from './ShortlistItem.jsx';
import { PrintSheet } from './PrintSheet.jsx';
import { Arrow } from './Arrow.jsx';
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
        <div>
          <span className="workspace-kicker">From comparison to preparation</span>
          <h2>Your planning shortlist.</h2>
          <p>Save areas and notes for outreach, warming centers, and backup-power discussions.</p>
        </div>
        <div className="prepare-actions">
          <button
            className="button"
            disabled={!rows.length}
            onClick={() => download(shortlistCsv(rows), 'hearth-planning-shortlist.csv')}
          >
            Export CSV <Arrow direction="down" />
          </button>
          <button
            className="button"
            disabled={!rows.length}
            onClick={() => setPrintMode(!printMode)}
          >
            {printMode ? 'Close print view' : 'Print view'}
          </button>
        </div>
      </div>
      <CountyData zones={zones} record={record} />

      {printMode && (
        <PrintSheet setPrintMode={setPrintMode} data={data} record={record} rows={rows} />
      )}
      {!plan.length ? (
        <div className="empty-shortlist">
          <span aria-hidden="true">＋</span>
          <h3>Choose an area to investigate.</h3>
          <p>
            Select a census tract in Explore, review its evidence, and add it here. No zones are
            added automatically.
          </p>
          <button className="primary-button" onClick={onExplore}>
            Explore census tract zones <Arrow direction="right" />
          </button>
        </div>
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
            {plan.map((item) => {
              const z = zones.find((z) => z.zone_id === item.zone);
              return (
                <ShortlistItem
                  key={item.zone}
                  setPlan={setPlan}
                  plan={plan}
                  counts={counts}
                  data={data}
                  record={record}
                  item={item}
                  z={z}
                />
              );
            })}
          </div>
        </>
      )}
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
