import { Icon } from '../ui/Icon.jsx';
import React from 'react';
import { AnimatePresence } from 'motion/react';
import { DetentSheet } from './DetentSheet.jsx';
import { Status } from './EvidencePrimitives.jsx';
import { status } from '../model.js';
import { awarePlanLabel } from '../presentation.js';

export { detentHeights } from './DetentSheet.jsx';
export function ZoneSheet({ open, close, zone, record, awareLabel, children }) {
  return (
    <AnimatePresence>
      {open && zone && (
        <DetentSheet
          key="zone-sheet"
          label="Selected area details"
          onDismiss={close}
          header={
            <>
              <button
                type="button"
                className="ios-circle-button ios-sheet-close"
                aria-label="Close area details"
                onClick={close}
              >
                <Icon name="close" size={18} />
              </button>
              <div className="ios-sheet-peek">
                <h2>
                  Zone {zone.zone_id} <span>{zone.COUNTY.replace(' County', '')}</span>
                </h2>
                <div className="ios-sheet-pills">
                  <span>
                    MW-only <Status value={status(zone, record.baseline)} />
                  </span>
                  <span>
                    {awareLabel || (record.alpha === 0 ? 'Business cost' : awarePlanLabel(record))}{' '}
                    <Status value={status(zone, record.weighted)} />
                  </span>
                </div>
              </div>
            </>
          }
        >
          {children}
        </DetentSheet>
      )}
    </AnimatePresence>
  );
}
